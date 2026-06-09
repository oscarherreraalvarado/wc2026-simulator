import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import type { UserSession } from '@wc2026/shared-types';
import { ApiService } from './api.service';

const TOKEN_KEY = 'wc2026_access_token';
const REFRESH_KEY = 'wc2026_refresh_token';
const SESSION_KEY = 'wc2026_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly sessionSignal = signal<UserSession | null>(this.readStoredSession());

  readonly session = this.sessionSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.sessionSignal() !== null);
  readonly accessToken = computed(() => this.sessionSignal()?.accessToken ?? null);
  readonly profile = computed(() => this.sessionSignal()?.profile ?? null);

  /** Registra un usuario y persiste la sesión. */
  async register(email: string, password: string, username: string): Promise<UserSession> {
    const session = await firstValueFrom(
      this.api.post<UserSession>('/auth/register', { email, password, username }),
    );
    this.persistSession(session);
    return session;
  }

  /** Inicia sesión y persiste la sesión. */
  async login(email: string, password: string): Promise<UserSession> {
    const session = await firstValueFrom(
      this.api.post<UserSession>('/auth/login', { email, password }),
    );
    this.persistSession(session);
    return session;
  }

  /** Cierra sesión local y en Supabase. */
  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.api.post<{ loggedOut: true }>('/auth/logout', {}));
    } catch {
      // limpiar sesión local aunque falle el backend
    }
    this.clearSession();
    await this.router.navigate(['/login']);
  }

  private persistSession(session: UserSession): void {
    localStorage.setItem(TOKEN_KEY, session.accessToken);
    localStorage.setItem(REFRESH_KEY, session.refreshToken);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.sessionSignal.set(session);
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(SESSION_KEY);
    this.sessionSignal.set(null);
  }

  private readStoredSession(): UserSession | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as UserSession;
    } catch {
      return null;
    }
  }
}
