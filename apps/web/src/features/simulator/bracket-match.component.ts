import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FlagEmojiComponent } from '../../shared/flag-emoji.component';

export interface BracketMatchView {
  homeTeam: string | null;
  awayTeam: string | null;
  winner: string | null;
  penWin?: boolean;
}

@Component({
  selector: 'app-bracket-match',
  standalone: true,
  imports: [FlagEmojiComponent],
  template: `
    <div class="bracket-match">
      <button
        type="button"
        class="bracket-team"
        [class.winner]="winner === homeTeam"
        [class.tbd]="!homeTeam"
        (click)="pick(homeTeam)"
      >
        @if (homeTeam) {
          <app-flag-emoji [team]="homeTeam" />
          <span>{{ homeTeam }}</span>
          @if (winner === homeTeam) {
            <span class="arrow">▶</span>
          }
        } @else {
          <span class="placeholder">⬡ Por definir</span>
        }
      </button>
      <button
        type="button"
        class="bracket-team"
        [class.winner]="winner === awayTeam"
        [class.tbd]="!awayTeam"
        (click)="pick(awayTeam)"
      >
        @if (awayTeam) {
          <app-flag-emoji [team]="awayTeam" />
          <span>{{ awayTeam }}</span>
          @if (winner === awayTeam) {
            <span class="arrow">▶</span>
          }
        } @else {
          <span class="placeholder">⬡ Por definir</span>
        }
      </button>
    </div>
  `,
  styles: [
    `
      .bracket-match {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        overflow: hidden;
        transition: border-color 0.2s;
      }
      .bracket-match:hover {
        border-color: var(--accent);
      }
      .bracket-team {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 100%;
        padding: 7px 10px;
        font-size: 12px;
        font-weight: 500;
        border: none;
        border-bottom: 1px solid var(--border);
        background: transparent;
        color: var(--text);
        cursor: pointer;
        text-align: left;
        min-height: 34px;
      }
      .bracket-team:last-child {
        border-bottom: none;
      }
      .bracket-team:hover {
        background: var(--surface2);
      }
      .bracket-team.winner {
        background: rgba(245, 197, 24, 0.08);
        color: var(--accent);
        font-weight: 700;
      }
      .bracket-team.tbd {
        color: var(--muted);
        font-style: italic;
        cursor: default;
      }
      .placeholder {
        font-size: 11px;
      }
      .arrow {
        margin-left: auto;
        font-size: 10px;
        color: var(--accent);
      }
    `,
  ],
})
export class BracketMatchComponent {
  @Input() homeTeam: string | null = null;
  @Input() awayTeam: string | null = null;
  @Input() winner: string | null = null;
  @Output() teamPick = new EventEmitter<string>();

  pick(team: string | null): void {
    if (team) {
      this.teamPick.emit(team);
    }
  }
}
