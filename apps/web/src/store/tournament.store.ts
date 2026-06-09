import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type {
  GroupLetter,
  GroupsResponse,
  PredictionDetailResponse,
  PredictionListItem,
  Standing,
} from '@wc2026/shared-types';
import type { GroupState } from '@wc2026/shared-types';
import { ApiService } from '../core/services/api.service';
import {
  GROUP_LETTERS,
  calcStandings,
  extractApiGroups,
  getBestThirds,
  hydrateGroup,
  toFixtures,
} from './group.utils';

type GroupView = GroupsResponse['groups'][GroupLetter];

const STORAGE_KEY = 'wc2026_groups_scores';
const STORAGE_VERSION_KEY = 'wc2026_groups_version';
const STORAGE_VERSION = 5;

type SavedFixture = {
  homeTeam: string;
  awayTeam: string;
  homeGoals: number | null;
  awayGoals: number | null;
};

type SavedScores = Partial<Record<GroupLetter, SavedFixture[]>>;

export interface RankedThird extends Standing {
  groupLetter: GroupLetter;
  qualified: boolean;
}

@Injectable({ providedIn: 'root' })
export class TournamentStore {
  private readonly api = inject(ApiService);

  private readonly groupsSignal = signal<Record<GroupLetter, GroupView> | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly activePredictionSignal = signal<PredictionDetailResponse | null>(null);
  private readonly predictionsSignal = signal<PredictionListItem[]>([]);

  readonly groups = this.groupsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly activePrediction = this.activePredictionSignal.asReadonly();
  readonly predictions = this.predictionsSignal.asReadonly();

  readonly groupLetters = computed(() =>
    this.groupsSignal() ? GROUP_LETTERS : ([] as GroupLetter[]),
  );

  readonly standingsByGroup = computed(() => {
    const groups = this.groupsSignal();
    if (!groups) {
      return {} as Record<GroupLetter, Standing[]>;
    }

    const result = {} as Record<GroupLetter, Standing[]>;
    for (const letter of GROUP_LETTERS) {
      const group = groups[letter];
      result[letter] = calcStandings(group.teams, toFixtures(letter, group));
    }
    return result;
  });

  readonly bestThirds = computed(() => {
    const groups = this.groupsSignal();
    const standings = this.standingsByGroup();
    if (!groups) {
      return [] as Standing[];
    }

    const groupStates = {} as Record<GroupLetter, GroupState>;
    for (const letter of GROUP_LETTERS) {
      const group = groups[letter];
      groupStates[letter] = {
        group: { letter, teams: group.teams, fixtures: toFixtures(letter, group) },
        standings: standings[letter],
      };
    }

    return getBestThirds(groupStates);
  });

  readonly rankedThirds = computed((): RankedThird[] => {
    const groups = this.groupsSignal();
    const standings = this.standingsByGroup();
    if (!groups) {
      return [];
    }

    const rows = GROUP_LETTERS.map((letter) => {
      const third = standings[letter]?.find((row) => row.rank === 3);
      if (!third) {
        return null;
      }
      return { ...third, groupLetter: letter };
    })
      .filter((row): row is Standing & { groupLetter: GroupLetter } => row !== null)
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });

    return rows.map((row, index) => ({
      ...row,
      qualified: index < 8,
    }));
  });

  /** Tarjetas listas para la UI del simulador. */
  readonly groupCards = computed(() => {
    const groups = this.groupsSignal();
    const standings = this.standingsByGroup();
    if (!groups) {
      return [] as Array<{ letter: GroupLetter; group: GroupView; standings: Standing[] }>;
    }

    return GROUP_LETTERS.map((letter) => ({
      letter,
      group: groups[letter],
      standings: standings[letter] ?? [],
    }));
  });

  async loadGroups(): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      const response = await firstValueFrom(this.api.get<GroupsResponse>('/groups'));
      const apiGroups = extractApiGroups(response);
      const merged = this.buildAllGroups(apiGroups);
      this.groupsSignal.set(merged);
    } catch (error) {
      this.errorSignal.set(error instanceof Error ? error.message : 'Error al cargar grupos');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  resetAll(): void {
    const groups = this.groupsSignal();
    if (!groups) {
      return;
    }

    const cleared = this.buildAllGroups({});

    this.groupsSignal.set(cleared);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
  }

  async loadPredictions(): Promise<void> {
    const list = await firstValueFrom(this.api.get<PredictionListItem[]>('/predictions'));
    this.predictionsSignal.set(list);
    if (list.length > 0 && !this.activePredictionSignal()) {
      await this.selectPrediction(list[0].id);
    }
  }

  async selectPrediction(id: string): Promise<void> {
    const detail = await firstValueFrom(
      this.api.get<PredictionDetailResponse>(`/predictions/${id}`),
    );
    this.activePredictionSignal.set(detail);
    this.applyPredictionState(detail);
  }

  async createPrediction(title = 'Mi Predicción'): Promise<void> {
    const detail = await firstValueFrom(
      this.api.post<PredictionDetailResponse>('/predictions', { title }),
    );
    this.activePredictionSignal.set(detail);
    await this.loadPredictions();
  }

  updateScore(
    letter: GroupLetter,
    homeTeam: string,
    awayTeam: string,
    homeGoals: number,
    awayGoals: number,
  ): void {
    const groups = this.groupsSignal();
    if (!groups) {
      return;
    }

    const group = groups[letter];
    const fixtures = group.fixtures.map((fixture) =>
      fixture.homeTeam === homeTeam && fixture.awayTeam === awayTeam
        ? { ...fixture, homeGoals, awayGoals }
        : fixture,
    );

    this.groupsSignal.set({
      ...groups,
      [letter]: { ...group, fixtures },
    });
    this.persistScores();
  }

  async simulateGroup(letter: GroupLetter): Promise<void> {
    const predictionId = this.activePredictionSignal()?.id;
    const body = predictionId ? { predictionId } : {};
    const result = await firstValueFrom(
      this.api.post<{
        group: {
          teams: string[];
          fixtures: Array<{
            homeTeam: string;
            awayTeam: string;
            homeGoals: number | null;
            awayGoals: number | null;
          }>;
        };
        standings: Standing[];
      }>(`/groups/${letter}/simulate`, body),
    );

    const groups = this.groupsSignal();
    if (groups) {
      this.groupsSignal.set({
        ...groups,
        [letter]: {
          letter,
          teams: result.group.teams,
          fixtures: result.group.fixtures.map((fixture) => ({
            homeTeam: fixture.homeTeam,
            awayTeam: fixture.awayTeam,
            homeGoals: fixture.homeGoals,
            awayGoals: fixture.awayGoals,
          })),
        },
      });
      this.persistScores();
    }
  }

  async simulateAll(): Promise<void> {
    const predictionId = this.activePredictionSignal()?.id;
    const body = predictionId ? { predictionId } : {};
    const result = await firstValueFrom(
      this.api.post<{
        groups: Record<
          GroupLetter,
          {
            group: {
              teams: string[];
              fixtures: Array<{
                homeTeam: string;
                awayTeam: string;
                homeGoals: number | null;
                awayGoals: number | null;
              }>;
            };
          }
        >;
      }>('/groups/simulate-all', body),
    );

    const groups = this.groupsSignal();
    if (!groups) {
      return;
    }

    const updated = { ...groups };
    for (const letter of GROUP_LETTERS) {
      updated[letter] = {
        letter,
        teams: result.groups[letter].group.teams,
        fixtures: result.groups[letter].group.fixtures.map((fixture) => ({
          homeTeam: fixture.homeTeam,
          awayTeam: fixture.awayTeam,
          homeGoals: fixture.homeGoals,
          awayGoals: fixture.awayGoals,
        })),
      };
    }
    this.groupsSignal.set(updated);
    this.persistScores();
  }

  async saveGroupResults(letter: GroupLetter): Promise<void> {
    const prediction = this.activePredictionSignal();
    const groups = this.groupsSignal();
    if (!prediction || !groups) {
      return;
    }

    const results = groups[letter].fixtures
      .filter((fixture) => fixture.homeGoals != null && fixture.awayGoals != null)
      .map((fixture) => ({
        homeTeam: fixture.homeTeam,
        awayTeam: fixture.awayTeam,
        homeGoals: fixture.homeGoals as number,
        awayGoals: fixture.awayGoals as number,
      }));

    await firstValueFrom(
      this.api.post('/groups/results', {
        predictionId: prediction.id,
        groupLetter: letter,
        results,
      }),
    );
  }

  private applyPredictionState(detail: PredictionDetailResponse): void {
    const groups = this.groupsSignal();
    if (!groups) {
      return;
    }

    const updated = { ...groups };

    for (const letter of GROUP_LETTERS) {
      const state = detail.state.groupStates[letter];
      const savedFixtures =
        state?.group?.fixtures?.map((fixture) => ({
          homeTeam: fixture.homeTeam,
          awayTeam: fixture.awayTeam,
          homeGoals: fixture.homeGoals,
          awayGoals: fixture.awayGoals,
        })) ?? [];

      updated[letter] = hydrateGroup(letter, groups[letter], savedFixtures);
    }

    this.groupsSignal.set(updated);
    this.persistScores();
  }

  private persistScores(): void {
    const groups = this.groupsSignal();
    if (!groups) {
      return;
    }
    try {
      const scores: SavedScores = {};
      for (const letter of GROUP_LETTERS) {
        scores[letter] = groups[letter].fixtures.map((fixture) => ({
          homeTeam: fixture.homeTeam,
          awayTeam: fixture.awayTeam,
          homeGoals: fixture.homeGoals,
          awayGoals: fixture.awayGoals,
        }));
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
      localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
    } catch {
      // ignore quota errors
    }
  }

  private readSavedScores(): SavedScores {
    try {
      const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
      if (storedVersion !== String(STORAGE_VERSION)) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
        return {};
      }

      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return {};
      }

      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== 'object') {
        return {};
      }

      const record = parsed as Record<string, unknown>;
      const scores: SavedScores = {};

      for (const letter of GROUP_LETTERS) {
        const value = record[letter];
        if (!Array.isArray(value)) {
          continue;
        }

        scores[letter] = value
          .filter((row): row is SavedFixture => {
            if (!row || typeof row !== 'object') {
              return false;
            }
            const fixture = row as Record<string, unknown>;
            return (
              typeof fixture['homeTeam'] === 'string' &&
              typeof fixture['awayTeam'] === 'string' &&
              fixture['homeTeam'].trim().length > 0 &&
              fixture['awayTeam'].trim().length > 0
            );
          })
          .map((row) => ({
            homeTeam: row.homeTeam,
            awayTeam: row.awayTeam,
            homeGoals:
              typeof row.homeGoals === 'number' || row.homeGoals === null ? row.homeGoals : null,
            awayGoals:
              typeof row.awayGoals === 'number' || row.awayGoals === null ? row.awayGoals : null,
          }));
      }

      return scores;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return {};
    }
  }

  private buildAllGroups(
    apiGroups: Partial<Record<GroupLetter, GroupView>>,
  ): Record<GroupLetter, GroupView> {
    const savedScores = this.readSavedScores();
    const merged = {} as Record<GroupLetter, GroupView>;

    for (const letter of GROUP_LETTERS) {
      merged[letter] = hydrateGroup(letter, apiGroups[letter], savedScores[letter] ?? []);
    }

    return merged;
  }
}
