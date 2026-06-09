import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="dashboard">
      <h1>WC2026 Simulator</h1>
      <p>Predice resultados del Mundial 2026, compite en el leaderboard y comparte tu bracket.</p>
      <div class="cta">
        <a routerLink="/simulator" class="btn btn-primary">Ir al simulador</a>
        <a routerLink="/leaderboard" class="btn">Ver leaderboard</a>
      </div>
    </main>
  `,
  styles: [
    `
      .dashboard {
        padding: 3rem 1.5rem;
        max-width: 640px;
        margin: 0 auto;
        text-align: center;
      }
      .cta {
        display: flex;
        gap: 0.75rem;
        justify-content: center;
        margin-top: 1.5rem;
        flex-wrap: wrap;
      }
    `,
  ],
})
export class DashboardComponent {}
