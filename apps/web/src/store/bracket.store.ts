import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { BracketMatch, BracketRound, GroupLetter } from '@wc2026/shared-types';
import { buildBracket } from '@wc2026/tournament-logic';
import { AuthService } from '../core/services/auth.service';
import { ApiService } from '../core/services/api.service';
import { TournamentStore } from './tournament.store';
import { createEmptyRound, propagateToNextRound } from './bracket.utils';

@Injectable({ providedIn: 'root' })
export class BracketStore {
  private readonly tournament = inject(TournamentStore);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  private readonly r32Signal = signal<BracketMatch[]>([]);
  private readonly r16Signal = signal<BracketMatch[]>(createEmptyRound('R16', 8));
  private readonly qfSignal = signal<BracketMatch[]>(createEmptyRound('QF', 4));
  private readonly sfSignal = signal<BracketMatch[]>(createEmptyRound('SF', 2));
  private readonly finalSignal = signal<BracketMatch[]>(createEmptyRound('FINAL', 1));
  private readonly tpSignal = signal<BracketMatch[]>(createEmptyRound('TP', 1));

  readonly r32 = this.r32Signal.asReadonly();
  readonly r16 = this.r16Signal.asReadonly();
  readonly qf = this.qfSignal.asReadonly();
  readonly sf = this.sfSignal.asReadonly();
  readonly final = this.finalSignal.asReadonly();
  readonly tp = this.tpSignal.asReadonly();

  readonly champion = computed(() => this.finalSignal()[0]?.winner ?? null);

  readonly allMatches = computed(() => [
    ...this.r32Signal(),
    ...this.r16Signal(),
    ...this.qfSignal(),
    ...this.sfSignal(),
    ...this.finalSignal(),
    ...this.tpSignal(),
  ]);

  constructor() {
    effect(() => {
      const standings = this.tournament.standingsByGroup();
      const thirds = this.tournament.bestThirds();
      if (!Object.keys(standings).length) {
        return;
      }

      this.r32Signal.set(
        buildBracket(standings as Partial<Record<GroupLetter, typeof thirds>>, thirds),
      );
      this.resetKnockoutFromR16();
    });
  }

  /** Avanza un equipo en la ronda indicada (clic en la UI). */
  advance(round: BracketRound, matchIndex: number, winner: string): void {
    switch (round) {
      case 'R32':
        this.advanceR32(matchIndex, winner);
        break;
      case 'R16':
        this.advanceR16(matchIndex, winner);
        break;
      case 'QF':
        this.advanceQf(matchIndex, winner);
        break;
      case 'SF':
        this.advanceSf(matchIndex, winner);
        break;
      case 'FINAL':
        this.advanceFinal(matchIndex, winner);
        break;
      case 'TP':
        this.advanceTp(matchIndex, winner);
        break;
    }

    void this.syncPickToApi(round, matchIndex, winner);
  }

  private advanceR32(matchIndex: number, winner: string): void {
    this.r32Signal.update((matches) =>
      matches.map((m) => (m.matchIndex === matchIndex ? { ...m, winner } : m)),
    );
    this.r16Signal.update((matches) => propagateToNextRound(matches, matchIndex, winner));
  }

  private advanceR16(matchIndex: number, winner: string): void {
    this.r16Signal.update((matches) =>
      matches.map((m) => (m.matchIndex === matchIndex ? { ...m, winner } : m)),
    );
    this.qfSignal.update((matches) => propagateToNextRound(matches, matchIndex, winner));
  }

  private advanceQf(matchIndex: number, winner: string): void {
    const match = this.qfSignal()[matchIndex];
    const loser =
      match?.homeTeam === winner ? match.awayTeam : match?.homeTeam ?? null;

    this.qfSignal.update((matches) =>
      matches.map((m) => (m.matchIndex === matchIndex ? { ...m, winner } : m)),
    );
    this.sfSignal.update((matches) => propagateToNextRound(matches, matchIndex, winner));

    if (loser) {
      this.tpSignal.update((matches) => {
        const copy = [...matches];
        const slot = matchIndex < 2 ? 'homeTeam' : 'awayTeam';
        copy[0] = { ...copy[0], [slot]: loser };
        return copy;
      });
    }
  }

  private advanceSf(matchIndex: number, winner: string): void {
    const match = this.sfSignal()[matchIndex];
    const loser =
      match?.homeTeam === winner ? match.awayTeam : match?.homeTeam ?? null;

    this.sfSignal.update((matches) =>
      matches.map((m) => (m.matchIndex === matchIndex ? { ...m, winner } : m)),
    );

    if (loser) {
      this.tpSignal.update((matches) => {
        const copy = [...matches];
        copy[0] =
          matchIndex === 0
            ? { ...copy[0], homeTeam: loser }
            : { ...copy[0], awayTeam: loser };
        return copy;
      });
    }

    this.finalSignal.update((matches) => {
      const copy = [...matches];
      copy[0] =
        matchIndex === 0
          ? { ...copy[0], homeTeam: winner }
          : { ...copy[0], awayTeam: winner };
      return copy;
    });
  }

  private advanceFinal(_matchIndex: number, winner: string): void {
    this.finalSignal.update((matches) =>
      matches.map((m) => ({ ...m, winner })),
    );
  }

  private advanceTp(_matchIndex: number, winner: string): void {
    this.tpSignal.update((matches) =>
      matches.map((m) => ({ ...m, winner })),
    );
  }

  private resetKnockoutFromR16(): void {
    this.r16Signal.set(createEmptyRound('R16', 8));
    this.qfSignal.set(createEmptyRound('QF', 4));
    this.sfSignal.set(createEmptyRound('SF', 2));
    this.finalSignal.set(createEmptyRound('FINAL', 1));
    this.tpSignal.set(createEmptyRound('TP', 1));
  }

  private async syncPickToApi(
    round: BracketRound,
    matchIndex: number,
    winner: string,
  ): Promise<void> {
    const prediction = this.tournament.activePrediction();
    if (!this.auth.isAuthenticated() || !prediction) {
      return;
    }

    try {
      await firstValueFrom(
        this.api.put(`/bracket/${prediction.id}`, { round, matchIndex, winner }),
      );
    } catch {
      // la UI local sigue funcionando aunque falle el sync
    }
  }
}
