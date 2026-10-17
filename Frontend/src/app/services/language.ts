import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Language {

  currentLanguage=signal<string>(localStorage.getItem('app-language')||'en');

  setLanguage(lang: string) {
    this.currentLanguage.set(lang);
    localStorage.setItem('app_language', lang);
  }
}
