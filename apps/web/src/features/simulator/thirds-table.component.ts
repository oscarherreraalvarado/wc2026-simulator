import { Component, Input } from '@angular/core';
import { FlagEmojiComponent } from '../../shared/flag-emoji.component';
import type { RankedThird } from '../../store/tournament.store';

@Component({
  selector: 'app-thirds-table',
  standalone: true,
  imports: [FlagEmojiComponent],
  template: `
    <section class="thirds">
      <h2 class="section-title">🃏 Mejores Terceros</h2>
      <p class="section-sub">
        Los 8 mejores equipos en 3er lugar acceden al Round of 32. Verde = clasificado, rojo =
        eliminado.
      </p>

      <div class="third-card">
        <div class="third-header">
          <span class="icon">🎯</span>
          <h3>Tabla de Terceros — 12 Grupos</h3>
        </div>
        <table class="third-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Equipo</th>
              <th>Grupo</th>
              <th>PTS</th>
              <th>DG</th>
              <th>GF</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            @for (row of thirds; track row.team; let i = $index) {
              <tr [class.qualifying]="row.qualified" [class.eliminated]="!row.qualified">
                <td><span class="rank-num">{{ i + 1 }}</span></td>
                <td>
                  <div class="team-cell">
                    <app-flag-emoji [team]="row.team" />
                    <strong>{{ row.team }}</strong>
                  </div>
                </td>
                <td><span class="group-tag">Grupo {{ row.groupLetter }}</span></td>
                <td><strong class="pts">{{ row.points }}</strong></td>
                <td
                  [class.pos-dg]="row.goalDifference > 0"
                  [class.neg-dg]="row.goalDifference < 0"
                >
                  {{ row.goalDifference > 0 ? '+' + row.goalDifference : row.goalDifference }}
                </td>
                <td class="muted">{{ row.goalsFor }}</td>
                <td>
                  @if (row.qualified) {
                    <span class="badge badge-q">✓ Clasificado</span>
                  } @else {
                    <span class="badge badge-x">✗ Eliminado</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
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
        margin: 0.35rem 0 1.25rem;
      }
      .third-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        overflow: hidden;
      }
      .third-header {
        background: linear-gradient(90deg, #1a1f2e, var(--surface));
        padding: 14px 20px;
        border-bottom: 1px solid var(--border);
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .third-header h3 {
        font-family: var(--font-display);
        font-size: 20px;
        letter-spacing: 2px;
        color: var(--accent);
        margin: 0;
      }
      .icon {
        font-size: 24px;
      }
      .third-table {
        width: 100%;
        border-collapse: collapse;
      }
      .third-table th {
        padding: 8px 16px;
        text-align: left;
        color: var(--muted);
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid var(--border);
        background: #0d131f;
      }
      .third-table td {
        padding: 10px 16px;
        border-bottom: 1px solid #131c2b;
        font-size: 13px;
      }
      tr.qualifying td {
        background: rgba(0, 229, 160, 0.04);
      }
      tr.qualifying td:first-child {
        border-left: 3px solid var(--win);
      }
      tr.eliminated td {
        background: rgba(255, 77, 109, 0.04);
      }
      tr.eliminated td:first-child {
        border-left: 3px solid var(--loss);
      }
      .team-cell {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .group-tag {
        color: var(--muted);
        font-family: var(--font-display);
        font-size: 16px;
        letter-spacing: 1px;
      }
      .rank-num {
        font-family: var(--font-display);
        font-size: 18px;
        color: var(--muted);
      }
      .pts {
        color: var(--accent);
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
      .badge {
        font-size: 10px;
        padding: 2px 8px;
        border-radius: 10px;
        font-weight: 600;
      }
      .badge-q {
        background: rgba(0, 229, 160, 0.15);
        color: var(--win);
      }
      .badge-x {
        background: rgba(255, 77, 109, 0.15);
        color: var(--loss);
      }
    `,
  ],
})
export class ThirdsTableComponent {
  @Input({ required: true }) thirds: RankedThird[] = [];
}
