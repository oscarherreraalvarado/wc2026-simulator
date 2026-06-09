import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import type { LeaderboardEntry } from '@wc2026/shared-types';
import { FlagEmojiComponent } from '../../shared/flag-emoji.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [FlagEmojiComponent],
  template: `
    <main class="leaderboard">
      <h1>Leaderboard</h1>
      <p class="muted">Top 100 predicciones públicas</p>

      @if (loading()) {
        <p>Cargando…</p>
      } @else if (error()) {
        <p class="error">{{ error() }}</p>
      } @else {
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Usuario</th>
              <th>Predicción</th>
              <th>Puntos</th>
              <th>Campeón</th>
            </tr>
          </thead>
          <tbody>
            @for (entry of entries(); track entry.predictionId) {
              <tr>
                <td>{{ entry.rank }}</td>
                <td>{{ entry.username }}</td>
                <td>{{ entry.title }}</td>
                <td>{{ entry.totalScore }}</td>
                <td>
                  @if (entry.champion) {
                    <app-flag-emoji [team]="entry.champion" />{{ entry.champion }}
                  } @else {
                    —
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </main>
  `,
  styles: [
    `
      .leaderboard {
        padding: 1.5rem;
        max-width: 900px;
        margin: 0 auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
      }
      th,
      td {
        padding: 0.5rem;
        border-bottom: 1px solid var(--border);
        text-align: left;
      }
      .error {
        color: #b91c1c;
      }
    `,
  ],
})
export class LeaderboardComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly entries = signal<LeaderboardEntry[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(this.api.get<LeaderboardEntry[]>('/leaderboard'));
      this.entries.set(data);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Error al cargar leaderboard');
    } finally {
      this.loading.set(false);
    }
  }
}
