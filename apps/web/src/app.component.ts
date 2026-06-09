import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { NavbarComponent } from './shared/navbar.component';

const AUTH_PATHS = new Set(['/', '/register', '/login']);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    @if (showNavbar()) {
      <app-navbar />
    }
    <router-outlet />
  `,
})
export class AppComponent {
  private readonly router = inject(Router);

  readonly showNavbar = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => !AUTH_PATHS.has((event as NavigationEnd).urlAfterRedirects.split('?')[0])),
      startWith(!AUTH_PATHS.has(this.router.url.split('?')[0])),
    ),
    { initialValue: false },
  );
}
