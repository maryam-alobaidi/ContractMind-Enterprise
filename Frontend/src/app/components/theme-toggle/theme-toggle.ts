import { Component, inject, input } from '@angular/core';
import { Theme } from '../../services/theme';

/**
 * Switches between light and dark mode.
 * variant="text": labelled button for the app's top bar.
 * variant="icon": compact icon button for the sign-in pages.
 */
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button
      type="button"
      [class]="variant() === 'icon' ? 'cm-icon-btn theme-toggle' : 'cm-btn cm-btn--quiet theme-toggle'"
      (click)="theme.toggleTheme()"
      [attr.aria-label]="variant() === 'icon' ? (theme.isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode') : null"
      [attr.aria-pressed]="theme.isDarkMode()"
      [attr.title]="theme.isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'">
      @if (theme.isDarkMode()) {
        <!-- sun: offered while in dark mode -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4"></circle>
          <line x1="12" y1="2" x2="12" y2="4"></line>
          <line x1="12" y1="20" x2="12" y2="22"></line>
          <line x1="4.9" y1="4.9" x2="6.3" y2="6.3"></line>
          <line x1="17.7" y1="17.7" x2="19.1" y2="19.1"></line>
          <line x1="2" y1="12" x2="4" y2="12"></line>
          <line x1="20" y1="12" x2="22" y2="12"></line>
          <line x1="4.9" y1="19.1" x2="6.3" y2="17.7"></line>
          <line x1="17.7" y1="6.3" x2="19.1" y2="4.9"></line>
        </svg>
      } @else {
        <!-- moon: offered while in light mode -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"></path>
        </svg>
      }
      @if (variant() === 'text') {
        <span class="label">{{ theme.isDarkMode() ? 'Light mode' : 'Dark mode' }}</span>
      }
    </button>
  `,
  styles: [`
    :host { display: inline-flex; }
    @media (max-width: 520px) {
      .label { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
      .cm-btn.theme-toggle { padding-inline: 0.6rem; }
    }
  `],
})
export class ThemeToggle {
  theme = inject(Theme);
  variant = input<'text' | 'icon'>('text');
}
