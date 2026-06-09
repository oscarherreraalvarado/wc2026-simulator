import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { TournamentStore } from '../../store/tournament.store';
import { BracketViewComponent } from './bracket-view.component';
import { GroupCardComponent } from './group-card.component';
import { ThirdsTableComponent } from './thirds-table.component';

type SimulatorTab = 'groups' | 'thirds' | 'bracket';

@Component({
  selector: 'app-simulator',
  standalone: true,
  imports: [GroupCardComponent, ThirdsTableComponent, BracketViewComponent],
  template: `
    <main class="simulator">
      <header class="sim-header">
        <div class="sim-title">
          <span class="trophy">⚽</span>
          <div>
            <h1>FIFA World Cup 2026 — Simulator</h1>
            <p class="muted">48 equipos · 12 grupos · 64 partidos</p>
          </div>
        </div>

        <nav class="sim-tabs">
          <button
            type="button"
            class="tab-btn"
            [class.active]="tab() === 'groups'"
            (click)="setTab('groups')"
          >
            ⚽ Grupos
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.active]="tab() === 'thirds'"
            (click)="setTab('thirds')"
          >
            🃏 Terceros
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.active]="tab() === 'bracket'"
            (click)="setTab('bracket')"
          >
            🏆 Llave
          </button>
        </nav>
      </header>

      @if (store.loading()) {
        <p class="loading">Cargando grupos…</p>
      } @else if (store.error()) {
        <p class="error">{{ store.error() }}</p>
      } @else {
        @switch (tab()) {
          @case ('groups') {
            <div class="quick-actions">
              <button type="button" class="btn btn-primary" (click)="simulateAll()">
                ⚡ Simular Todo
              </button>
              <button type="button" class="btn btn-secondary" (click)="resetAll()">
                ↺ Reiniciar
              </button>
              @if (auth.isAuthenticated()) {
                <button type="button" class="btn" (click)="createPrediction()">
                  + Nueva predicción
                </button>
              }
              <span class="hint">Los marcadores se guardan en tu navegador.</span>
            </div>

            <div class="groups-grid">
              @for (card of store.groupCards(); track card.letter) {
                <app-group-card
                  [letter]="card.letter"
                  [group]="card.group"
                  [standings]="card.standings"
                />
              }
            </div>
          }
          @case ('thirds') {
            <app-thirds-table [thirds]="store.rankedThirds()" />
          }
          @case ('bracket') {
            <app-bracket-view />
          }
        }
      }
    </main>
  `,
  styles: [
    `
      .simulator {
        padding: 1.5rem;
        max-width: 1600px;
        margin: 0 auto;
      }
      .sim-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border);
      }
      .sim-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .sim-title .trophy {
        font-size: 1.75rem;
      }
      .sim-title h1 {
        font-family: var(--font-display);
        font-size: 1.35rem;
        letter-spacing: 2px;
        color: var(--accent);
        margin: 0;
      }
      .sim-tabs {
        display: flex;
        gap: 0.25rem;
      }
      .tab-btn {
        padding: 8px 16px;
        border-radius: 6px;
        border: 1px solid transparent;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        background: transparent;
        color: var(--muted);
        transition: all 0.2s;
      }
      .tab-btn:hover {
        color: var(--text);
        background: var(--surface2);
      }
      .tab-btn.active {
        background: var(--accent);
        color: #000;
        border-color: var(--accent);
      }
      .quick-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
        margin-bottom: 1.25rem;
      }
      .hint {
        font-size: 12px;
        color: var(--muted);
      }
      .groups-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
        gap: 1rem;
        align-items: start;
      }
      .loading,
      .error {
        padding: 2rem;
        text-align: center;
      }
      .error {
        color: var(--loss);
      }
    `,
  ],
})
export class SimulatorComponent implements OnInit {
  readonly store = inject(TournamentStore);
  readonly auth = inject(AuthService);
  readonly tab = signal<SimulatorTab>('groups');

  ngOnInit(): void {
    void this.init();
  }

  private async init(): Promise<void> {
    await this.store.loadGroups();
    if (this.auth.isAuthenticated()) {
      await this.store.loadPredictions();
    }
  }

  setTab(value: SimulatorTab): void {
    this.tab.set(value);
  }

  simulateAll(): void {
    void this.store.simulateAll();
  }

  resetAll(): void {
    if (confirm('¿Reiniciar todas las predicciones?')) {
      this.store.resetAll();
    }
  }

  createPrediction(): void {
    void this.store.createPrediction();
  }
}
