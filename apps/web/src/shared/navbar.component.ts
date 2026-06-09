import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <a routerLink="/" class="brand">
        <span class="trophy">⚽</span>
        <span class="brand-text">WC2026</span>
      </a>
      <div class="links">
        <a routerLink="/simulator" routerLinkActive="active">Simulador</a>
        <a routerLink="/leaderboard" routerLinkActive="active">Leaderboard</a>
        @if (auth.isAuthenticated()) {
          <span class="user">{{ auth.profile()?.username }}</span>
          <button type="button" class="btn-sm" (click)="logout()">Salir</button>
        } @else {
          <a routerLink="/login" routerLinkActive="active">Login</a>
        }
      </div>
    </nav>
  `,
  styles: [
    `
      .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        background: linear-gradient(135deg, #0d1b2e 0%, var(--bg) 60%, #0d1b2e 100%);
        border-bottom: 1px solid var(--border);
        position: sticky;
        top: 0;
        z-index: 100;
        backdrop-filter: blur(20px);
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
      }
      .trophy {
        font-size: 1.5rem;
      }
      .brand-text {
        font-family: var(--font-display);
        font-size: 22px;
        letter-spacing: 2px;
        color: var(--accent);
      }
      .links {
        display: flex;
        gap: 1rem;
        align-items: center;
      }
      a {
        color: var(--muted);
        text-decoration: none;
        font-size: 13px;
        font-weight: 500;
      }
      a.active,
      a:hover {
        color: var(--text);
      }
      .user {
        font-size: 0.85rem;
        color: var(--muted);
      }
    `,
  ],
})
export class NavbarComponent {
  readonly auth = inject(AuthService);

  logout(): void {
    void this.auth.logout();
  }
}
