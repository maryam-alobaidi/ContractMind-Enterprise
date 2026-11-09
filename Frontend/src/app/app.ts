import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Theme } from './services/theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Creating the theme service here applies the saved light/dark choice on every page,
  // including sign-in and password pages that sit outside the main layout.
  private theme = inject(Theme);
}
