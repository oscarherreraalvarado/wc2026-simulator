import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthShellComponent } from '../../shared/auth-shell.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AuthShellComponent],
  template: `
    <app-auth-shell
      title="Iniciar sesión"
      subtitle="Entra para guardar predicciones y subir en el ranking."
    >
      <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()">
        <label class="field">
          <span>Email</span>
          <input
            type="email"
            formControlName="email"
            autocomplete="email"
            placeholder="tu@email.com"
          />
        </label>

        <label class="field">
          <span>Contraseña</span>
          <input
            type="password"
            formControlName="password"
            autocomplete="current-password"
            placeholder="••••••••"
          />
        </label>

        @if (error()) {
          <p class="form-error" role="alert">{{ error() }}</p>
        }

        <button type="submit" class="btn btn-primary btn-block" [disabled]="form.invalid || loading()">
          @if (loading()) {
            Entrando…
          } @else {
            Entrar al simulador
          }
        </button>

        <p class="form-footer">
          ¿No tienes cuenta?
          <a routerLink="/register">Crea una gratis</a>
        </p>
      </form>
    </app-auth-shell>
  `,
  styles: [
    `
      .auth-form {
        display: flex;
        flex-direction: column;
        gap: 1.1rem;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      .field span {
        font-size: 12px;
        font-weight: 500;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .field input {
        padding: 12px 14px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--surface);
        color: var(--text);
        font-size: 15px;
        font-family: var(--font-body);
        transition: border-color 0.2s, box-shadow 0.2s;
      }

      .field input::placeholder {
        color: #4a5568;
      }

      .field input:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 3px rgba(245, 197, 24, 0.12);
      }

      .btn-block {
        width: 100%;
        padding: 13px 20px;
        margin-top: 0.25rem;
        font-size: 14px;
      }

      .form-error {
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(255, 77, 109, 0.1);
        border: 1px solid rgba(255, 77, 109, 0.3);
        color: var(--loss);
        font-size: 13px;
      }

      .form-footer {
        text-align: center;
        font-size: 14px;
        color: var(--muted);
        margin-top: 0.5rem;
      }

      .form-footer a {
        color: var(--accent);
        text-decoration: none;
        font-weight: 600;
        margin-left: 0.25rem;
      }

      .form-footer a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.login(email, password);
      await this.router.navigate(['/simulator']);
    } catch (err) {
      this.error.set(extractApiError(err));
    } finally {
      this.loading.set(false);
    }
  }
}

function extractApiError(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { message?: string | string[] } | undefined;
    if (Array.isArray(body?.message)) {
      return body.message.join(', ');
    }
    if (typeof body?.message === 'string') {
      return body.message;
    }
  }
  return err instanceof Error ? err.message : 'Error al iniciar sesión';
}
