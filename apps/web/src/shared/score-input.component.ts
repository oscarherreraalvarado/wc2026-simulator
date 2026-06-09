import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-score-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="score-input">
      <input
        type="number"
        min="0"
        max="30"
        class="score-field"
        [ngModel]="displayHome"
        (ngModelChange)="onHomeChange($event)"
        placeholder="—"
        aria-label="Goles local"
      />
      <span class="sep">-</span>
      <input
        type="number"
        min="0"
        max="30"
        class="score-field"
        [ngModel]="displayAway"
        (ngModelChange)="onAwayChange($event)"
        placeholder="—"
        aria-label="Goles visitante"
      />
    </div>
  `,
  styles: [
    `
      .score-input {
        display: flex;
        align-items: center;
        gap: 0.35rem;
      }
      .score-field {
        width: 32px;
        height: 28px;
        text-align: center;
        background: var(--surface2);
        border: 1px solid var(--border);
        border-radius: 6px;
        color: var(--text);
        font-size: 14px;
        font-weight: 700;
      }
      .score-field:focus {
        outline: none;
        border-color: var(--accent);
        background: #1e2d45;
      }
      .sep {
        color: var(--muted);
        font-weight: 700;
        font-size: 12px;
      }
    `,
  ],
})
export class ScoreInputComponent {
  @Input() homeGoals: number | null = null;
  @Input() awayGoals: number | null = null;
  @Output() scoreChange = new EventEmitter<{ homeGoals: number; awayGoals: number }>();

  get displayHome(): number | null {
    return this.homeGoals;
  }

  get displayAway(): number | null {
    return this.awayGoals;
  }

  onHomeChange(value: number | null): void {
    this.scoreChange.emit({
      homeGoals: value ?? 0,
      awayGoals: this.awayGoals ?? 0,
    });
  }

  onAwayChange(value: number | null): void {
    this.scoreChange.emit({
      homeGoals: this.homeGoals ?? 0,
      awayGoals: value ?? 0,
    });
  }
}
