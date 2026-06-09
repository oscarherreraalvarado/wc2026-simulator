import { Component, Input } from '@angular/core';
import { getTeamFlag } from './team-flags';

@Component({
  selector: 'app-flag-emoji',
  standalone: true,
  template: `<span class="flag" [attr.aria-label]="team">{{ emoji }}</span>`,
  styles: [
    `
      .flag {
        margin-right: 0.35rem;
      }
    `,
  ],
})
export class FlagEmojiComponent {
  @Input({ required: true }) team!: string;

  get emoji(): string {
    return getTeamFlag(this.team);
  }
}
