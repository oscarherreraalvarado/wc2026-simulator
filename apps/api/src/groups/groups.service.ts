import { Injectable, InternalServerErrorException, Inject } from '@nestjs/common';
import type { Group, GroupLetter, GroupsResponse, Standing } from '@wc2026/shared-types';
import { simulateAll, simulateGroup } from '@wc2026/tournament-logic';
import {
  PREDICTIONS_REPOSITORY,
  type IPredictionsRepository,
} from '../predictions/interfaces/predictions-repository.interface';
import { PredictionsService } from '../predictions/predictions.service';
import { SupabaseService } from '../supabase/supabase.service';
import type { SaveGroupResultsDto } from './dto/save-results.dto';

interface TournamentTeamRow {
  name: string;
  group_letter: GroupLetter;
}

interface TournamentFixtureRow {
  group_letter: GroupLetter;
  home_team: string;
  away_team: string;
}

@Injectable()
export class GroupsService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly predictionsService: PredictionsService,
    @Inject(PREDICTIONS_REPOSITORY)
    private readonly predictionsRepository: IPredictionsRepository,
  ) {}

  /** Devuelve todos los grupos con fixtures de referencia. */
  async getAllGroups(): Promise<GroupsResponse> {
    const client = this.supabaseService.getClient();

    const [{ data: teams, error: teamsError }, { data: fixtures, error: fixturesError }] =
      await Promise.all([
        client.from('tournament_teams').select('name, group_letter').order('name'),
        client
          .from('tournament_fixtures')
          .select('group_letter, home_team, away_team')
          .order('id'),
      ]);

    if (teamsError || fixturesError) {
      throw new InternalServerErrorException(
        teamsError?.message ?? fixturesError?.message ?? 'Error al cargar grupos',
      );
    }

    const teamRows = (teams ?? []) as TournamentTeamRow[];
    const fixtureRows = (fixtures ?? []) as TournamentFixtureRow[];
    const letters = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
    ] as GroupLetter[];

    const groups = {} as GroupsResponse['groups'];

    for (const letter of letters) {
      groups[letter] = {
        letter,
        teams: teamRows.filter((t) => t.group_letter === letter).map((t) => t.name),
        fixtures: fixtureRows
          .filter((f) => f.group_letter === letter)
          .map((f) => ({
            homeTeam: f.home_team,
            awayTeam: f.away_team,
            homeGoals: null,
            awayGoals: null,
          })),
      };
    }

    return { groups };
  }

  /** Simula un grupo con marcadores aleatorios. */
  async simulateOne(
    letter: GroupLetter,
    userId: string,
    predictionId?: string,
  ): Promise<{ group: Group; standings: Standing[] }> {
    const result = simulateGroup(letter);

    if (predictionId) {
      await this.predictionsService.assertOwnership(predictionId, userId);
      await this.predictionsRepository.upsertGroupResults(
        predictionId,
        letter,
        result.group.fixtures.map((fixture) => ({
          homeTeam: fixture.homeTeam,
          awayTeam: fixture.awayTeam,
          homeGoals: fixture.homeGoals ?? 0,
          awayGoals: fixture.awayGoals ?? 0,
        })),
      );
    }

    return result;
  }

  /** Simula los 12 grupos. */
  async simulateAllGroups(userId: string, predictionId?: string) {
    const result = simulateAll();

    if (predictionId) {
      await this.predictionsService.assertOwnership(predictionId, userId);
      const letters = Object.keys(result.groups) as GroupLetter[];

      for (const letter of letters) {
        const group = result.groups[letter].group;
        await this.predictionsRepository.upsertGroupResults(
          predictionId,
          letter,
          group.fixtures.map((fixture) => ({
            homeTeam: fixture.homeTeam,
            awayTeam: fixture.awayTeam,
            homeGoals: fixture.homeGoals ?? 0,
            awayGoals: fixture.awayGoals ?? 0,
          })),
        );
      }
    }

    return result;
  }

  /** Guarda marcadores de fase de grupos en una predicción. */
  async saveResults(userId: string, dto: SaveGroupResultsDto): Promise<{ saved: true }> {
    await this.predictionsService.assertOwnership(dto.predictionId, userId);
    await this.predictionsRepository.upsertGroupResults(
      dto.predictionId,
      dto.groupLetter,
      dto.results,
    );
    return { saved: true };
  }
}
