import { Component, inject } from '@angular/core';
import type { BracketMatch, BracketRound } from '@wc2026/shared-types';
import { getTeamFlag } from '../../shared/team-flags';
import { BracketStore } from '../../store/bracket.store';
import { ROUND_LABELS } from '../../store/bracket.utils';
import { BracketMatchComponent } from './bracket-match.component';

interface RoundColumn {
  label: string;
  round: BracketRound;
  matches: BracketMatch[];
}

@Component({
  selector: 'app-bracket-view',
  standalone: true,
  imports: [BracketMatchComponent],
  template: `
    <section class="bracket-view">
      <div class="section-head">
        <h2 class="section-title">🏆 Llave Eliminatoria</h2>
        <p class="section-sub">Haz clic en un equipo para avanzarlo a la siguiente ronda.</p>
      </div>

      @if (store.champion(); as champion) {
        <div class="champion-card">
          <div class="trophy">🏆</div>
          <h3>{{ flag(champion) }} {{ champion }}</h3>
          <p class="muted">¡Campeón del Mundo 2026!</p>
        </div>
      }

      <div class="bracket-wrap">
        <div class="bracket">
          @for (col of sideColumns(); track col.label + col.round) {
            <div class="bracket-round">
              <div class="round-label">{{ col.label }}</div>
              <div class="round-matches">
                @for (match of col.matches; track match.matchIndex) {
                  <app-bracket-match
                    [homeTeam]="match.homeTeam"
                    [awayTeam]="match.awayTeam"
                    [winner]="match.winner"
                    (teamPick)="store.advance(col.round, match.matchIndex, $event)"
                  />
                }
              </div>
            </div>
          }

          <div class="bracket-round center">
            <div class="round-label">{{ ROUND_LABELS.FINAL }}</div>
            <div class="round-matches">
              @for (match of store.final(); track match.matchIndex) {
                <app-bracket-match
                  [homeTeam]="match.homeTeam"
                  [awayTeam]="match.awayTeam"
                  [winner]="match.winner"
                  (teamPick)="store.advance('FINAL', match.matchIndex, $event)"
                />
              }
              <div class="tp-label">{{ ROUND_LABELS.TP }}</div>
              @for (match of store.tp(); track match.matchIndex) {
                <app-bracket-match
                  [homeTeam]="match.homeTeam"
                  [awayTeam]="match.awayTeam"
                  [winner]="match.winner"
                  (teamPick)="store.advance('TP', match.matchIndex, $event)"
                />
              }
            </div>
          </div>

          @for (col of sideColumnsRight(); track col.label + col.round) {
            <div class="bracket-round">
              <div class="round-label">{{ col.label }}</div>
              <div class="round-matches">
                @for (match of col.matches; track match.matchIndex) {
                  <app-bracket-match
                    [homeTeam]="match.homeTeam"
                    [awayTeam]="match.awayTeam"
                    [winner]="match.winner"
                    (teamPick)="store.advance(col.round, match.matchIndex, $event)"
                  />
                }
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .section-title {
        font-family: var(--font-display);
        font-size: 1.5rem;
        letter-spacing: 2px;
      }
      .section-sub {
        font-size: 13px;
        color: var(--muted);
        margin-top: 0.35rem;
      }
      .champion-card {
        background: linear-gradient(135deg, #1a1500, var(--bg));
        border: 2px solid var(--accent);
        border-radius: 12px;
        padding: 1.25rem;
        text-align: center;
        margin-bottom: 1.5rem;
      }
      .trophy {
        font-size: 3rem;
      }
      .champion-card h3 {
        font-family: var(--font-display);
        font-size: 1.75rem;
        color: var(--accent);
        letter-spacing: 2px;
        margin-top: 0.5rem;
      }
      .bracket-wrap {
        overflow-x: auto;
        padding-bottom: 1.5rem;
      }
      .bracket {
        display: flex;
        min-width: 1200px;
      }
      .bracket-round {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 180px;
      }
      .bracket-round.center {
        min-width: 200px;
      }
      .round-label {
        font-family: var(--font-display);
        font-size: 14px;
        letter-spacing: 1.5px;
        color: var(--muted);
        text-align: center;
        padding: 12px 8px;
        border-bottom: 1px solid var(--border);
        text-transform: uppercase;
      }
      .round-matches {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        padding: 8px 4px;
        gap: 8px;
      }
      .tp-label {
        font-size: 11px;
        color: var(--muted);
        text-align: center;
        margin-top: 1rem;
        letter-spacing: 1px;
        text-transform: uppercase;
      }
    `,
  ],
})
export class BracketViewComponent {
  readonly store = inject(BracketStore);
  readonly ROUND_LABELS = ROUND_LABELS;

  sideColumns(): RoundColumn[] {
    return [
      { label: ROUND_LABELS.R32, round: 'R32', matches: this.store.r32().slice(0, 8) },
      { label: ROUND_LABELS.R16, round: 'R16', matches: this.store.r16().slice(0, 4) },
      { label: ROUND_LABELS.QF, round: 'QF', matches: this.store.qf().slice(0, 2) },
      { label: ROUND_LABELS.SF, round: 'SF', matches: this.store.sf().slice(0, 1) },
    ];
  }

  sideColumnsRight(): RoundColumn[] {
    return [
      { label: ROUND_LABELS.SF, round: 'SF', matches: this.store.sf().slice(1, 2) },
      { label: ROUND_LABELS.QF, round: 'QF', matches: this.store.qf().slice(2, 4) },
      { label: ROUND_LABELS.R16, round: 'R16', matches: this.store.r16().slice(4, 8) },
      { label: ROUND_LABELS.R32, round: 'R32', matches: this.store.r32().slice(8, 16) },
    ];
  }

  flag(team: string): string {
    return getTeamFlag(team);
  }
}
