import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  template: `
    <div class="auth-layout">
      <aside class="auth-hero" aria-hidden="true">
        <div class="hero-glow"></div>
        <div class="hero-content">
          <span class="hero-icon">⚽</span>
          <p class="hero-badge">FIFA WORLD CUP 2026</p>
          <h1>Simulador<br />del Mundial</h1>
          <p class="hero-tagline">
            Predice marcadores, simula escenarios y compite en el leaderboard con tus amigos.
          </p>
          <ul class="hero-stats">
            <li><span>48</span> equipos</li>
            <li><span>12</span> grupos</li>
            <li><span>64</span> partidos</li>
          </ul>
        </div>
      </aside>

      <main class="auth-main">
        <div class="auth-card">
          <header class="auth-card-header">
            <h2>{{ title }}</h2>
            @if (subtitle) {
              <p>{{ subtitle }}</p>
            }
          </header>
          <ng-content />
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .auth-layout {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 1fr 1fr;
      }

      .auth-hero {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        background: linear-gradient(145deg, #0d1b2e 0%, #0a1628 40%, #121a0a 100%);
        border-right: 1px solid var(--border);
        overflow: hidden;
      }

      .hero-glow {
        position: absolute;
        width: 420px;
        height: 420px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(245, 197, 24, 0.12) 0%, transparent 70%);
        top: 20%;
        left: 10%;
        pointer-events: none;
      }

      .hero-content {
        position: relative;
        max-width: 380px;
      }

      .hero-icon {
        font-size: 3rem;
        display: block;
        margin-bottom: 1rem;
      }

      .hero-badge {
        font-size: 11px;
        letter-spacing: 3px;
        text-transform: uppercase;
        color: var(--accent);
        font-weight: 700;
        margin-bottom: 0.75rem;
      }

      .hero-content h1 {
        font-family: var(--font-display);
        font-size: clamp(2.5rem, 5vw, 3.5rem);
        line-height: 1;
        letter-spacing: 2px;
        color: var(--text);
        margin-bottom: 1rem;
      }

      .hero-tagline {
        color: var(--muted);
        font-size: 15px;
        line-height: 1.6;
        margin-bottom: 2rem;
      }

      .hero-stats {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        gap: 1.5rem;
      }

      .hero-stats li {
        font-size: 13px;
        color: var(--muted);
      }

      .hero-stats span {
        display: block;
        font-family: var(--font-display);
        font-size: 28px;
        color: var(--accent);
        letter-spacing: 1px;
        line-height: 1.1;
      }

      .auth-main {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        background: var(--bg);
      }

      .auth-card {
        width: 100%;
        max-width: 400px;
      }

      .auth-card-header {
        margin-bottom: 1.75rem;
      }

      .auth-card-header h2 {
        font-family: var(--font-display);
        font-size: 2rem;
        letter-spacing: 1px;
        color: var(--text);
        margin-bottom: 0.35rem;
      }

      .auth-card-header p {
        color: var(--muted);
        font-size: 14px;
      }

      @media (max-width: 860px) {
        .auth-layout {
          grid-template-columns: 1fr;
        }

        .auth-hero {
          display: none;
        }

        .auth-main {
          min-height: 100vh;
          padding: 1.5rem;
        }
      }
    `,
  ],
})
export class AuthShellComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
}
