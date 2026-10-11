import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
    protected readonly title = signal('contract-mind-frontend');

  isLightMode = false;

  toggleTheme() {
    this.isLightMode = !this.isLightMode;
  }
}
