import { effect, Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'theme';

/**
 * Light / dark mode.
 * Dark is the default. Once the user picks a mode with the toggle, that choice is saved.
 * The same rule runs in a small script in index.html so the first paint already has the right theme.
 */
@Injectable({
  providedIn: 'root',
})
export class Theme {
  isDarkMode = signal<boolean>(this.readSaved() !== 'light');

  constructor() {
    effect(() => {
      const dark = this.isDarkMode();
      const root = document.documentElement;
      root.classList.toggle('dark-theme', dark);
      root.classList.toggle('light-theme', !dark);
      root.style.colorScheme = dark ? 'dark' : 'light';
    });
  }

  toggleTheme() {
    this.isDarkMode.update(val => !val);
    try {
      localStorage.setItem(STORAGE_KEY, this.isDarkMode() ? 'dark' : 'light');
    } catch {
      // Storage can be blocked (private mode); the toggle still works for this visit
    }
  }

  private readSaved(): 'light' | 'dark' | null {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  }
}
