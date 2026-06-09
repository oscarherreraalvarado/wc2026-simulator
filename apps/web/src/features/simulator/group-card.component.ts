import { Component, Input } from '@angular/core';
import type { GroupLetter, Standing } from '@wc2026/shared-types';
import { FlagEmojiComponent } from '../../shared/flag-emoji.component';
import { ScoreInputComponent } from '../../shared/score-input.component';
import type { ReferenceGroupView } from '../../store/group.utils';
import { TournamentStore } from '../../store/tournament.store';
import { StandingsTableComponent } from './standings-table.component';

@Component({
  selector: 'app-group-card',
  standalone: true,
  imports: [FlagEmojiComponent, ScoreInputComponent, StandingsTableComponent],
  template: `
    <article class="group-card">
      <header class="group-header">
        <span class="group-label">Grupo {{ letter }}</span>
        <button type="button" class="simulate-btn" (click)="simulate()">⚡ Simular</button>
      </header>

      <div class="standings-wrap">
        <app-standings-table [standings]="standings" />
      </div>

      <div class="fixtures-section">
        @for (fixture of group.fixtures; track fixture.homeTeam + '-' + fixture.awayTeam) {
          <div class="fixture-row">
            <div class="fix-team">
              <app-flag-emoji [team]="fixture.homeTeam" />
              <span>{{ fixture.homeTeam }}</span>
            </div>
            <app-score-input
              [homeGoals]="fixture.homeGoals"
              [awayGoals]="fixture.awayGoals"
              (scoreChange)="onScoreChange(fixture.homeTeam, fixture.awayTeam, $event)"
            />
            <div class="fix-team right">
              <span>{{ fixture.awayTeam }}</span>
              <app-flag-emoji [team]="fixture.awayTeam" />
            </div>
          </div>
        }
      </div>
    </article>
  `,
  styles: [
    `
      .group-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        overflow: hidden;
        transition: border-color 0.2s;
        min-width: 0;
      }
      .group-card:hover {
        border-color: var(--accent);
      }
      .group-header {
        background: linear-gradient(90deg, var(--surface2), var(--surface));
        padding: 10px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--border);
      }
      .group-label {
        font-family: var(--font-display);
        font-size: 20px;
        letter-spacing: 2px;
        color: var(--accent);
      }
      .simulate-btn {
        font-size: 11px;
        padding: 4px 10px;
        border-radius: 4px;
        background: transparent;
        border: 1px solid var(--border);
        color: var(--muted);
        cursor: pointer;
        transition: all 0.2s;
      }
      .simulate-btn:hover {
        border-color: var(--win);
        color: var(--win);
      }
      .standings-wrap {
        padding: 8px 8px 0;
      }
      .fixtures-section {
        padding: 8px;
        border-top: 1px solid var(--border);
      }
      .fixture-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
        align-items: center;
        gap: 8px;
        padding: 5px 4px;
        border-radius: 6px;
        transition: background 0.15s;
      }
      .fixture-row:hover {
        background: var(--surface2);
      }
      .fix-team {
        font-size: 11px;
        display: flex;
        align-items: center;
        gap: 4px;
        min-width: 0;
      }
      .fix-team span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .fix-team.right {
        justify-content: flex-end;
        text-align: right;
      }
    `,
  ],
})
export class GroupCardComponent {
  @Input({ required: true }) letter!: GroupLetter;
  @Input({ required: true }) group!: ReferenceGroupView;
  @Input({ required: true }) standings!: Standing[];

  constructor(private readonly store: TournamentStore) {}

  onScoreChange(
    homeTeam: string,
    awayTeam: string,
    scores: { homeGoals: number; awayGoals: number },
  ): void {
    this.store.updateScore(
      this.letter,
      homeTeam,
      awayTeam,
      scores.homeGoals,
      scores.awayGoals,
    );
  }

  simulate(): void {
    void this.store.simulateGroup(this.letter);
  }
}
