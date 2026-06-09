import { Component, Input } from '@angular/core';
import type { Standing } from '@wc2026/shared-types';
import { FlagEmojiComponent } from '../../shared/flag-emoji.component';

@Component({
  selector: 'app-standings-table',
  standalone: true,
  imports: [FlagEmojiComponent],
  template: `
    <table class="standings">
      <thead>
        <tr>
          <th>#</th>
          <th>Equipo</th>
          <th>PJ</th>
          <th>PTS</th>
          <th>DG</th>
          <th>GF</th>
        </tr>
      </thead>
      <tbody>
        @for (row of standings; track row.team; let i = $index) {
          <tr [class]="'pos-' + (i + 1)">
            <td><span class="pos-badge" [class]="'pos-' + (i + 1)">{{ i + 1 }}</span></td>
            <td>
              <div class="team-cell">
                <app-flag-emoji [team]="row.team" />
                <span>{{ row.team }}</span>
              </div>
            </td>
            <td class="muted">{{ row.played }}</td>
            <td class="pts">{{ row.points }}</td>
            <td [class.pos-dg]="row.goalDifference > 0" [class.neg-dg]="row.goalDifference < 0">
              {{ row.goalDifference > 0 ? '+' + row.goalDifference : row.goalDifference }}
            </td>
            <td class="muted">{{ row.goalsFor }}</td>
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: [
    `
      .standings {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
      }
      th {
        padding: 6px 8px;
        text-align: left;
        color: var(--muted);
        font-weight: 500;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid var(--border);
      }
      td {
        padding: 7px 8px;
        border-bottom: 1px solid #131c2b;
      }
      tr:last-child td {
        border-bottom: none;
      }
      .team-cell {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
      }
      .pts {
        font-weight: 700;
      }
      .muted {
        color: var(--muted);
      }
      .pos-dg {
        color: var(--win);
      }
      .neg-dg {
        color: var(--loss);
      }
      .pos-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        font-size: 10px;
        font-weight: 700;
      }
      .pos-badge.pos-1 {
        background: rgba(0, 229, 160, 0.15);
        color: var(--win);
      }
      .pos-badge.pos-2 {
        background: rgba(245, 197, 24, 0.15);
        color: var(--accent);
      }
      .pos-badge.pos-3 {
        background: rgba(107, 122, 153, 0.1);
        color: var(--muted);
      }
      .pos-badge.pos-4 {
        background: rgba(255, 77, 109, 0.1);
        color: var(--loss);
      }
    `,
  ],
})
export class StandingsTableComponent {
  @Input({ required: true }) standings: Standing[] = [];
}
