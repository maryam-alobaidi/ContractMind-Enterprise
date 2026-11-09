import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { ThemeToggle } from '../../components/theme-toggle/theme-toggle';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule, RouterLink, ThemeToggle],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(Auth);

  newPassword = signal('');
  confirmPassword = signal('');
  successMessage = signal('');
  errorMessage = signal('');
  isSaving = signal(false);
  linkMissing = signal(false);

  private email = '';
  private token = '';

  ngOnInit(): void {
    // The emailed link carries the email and a one-time token
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.token = params['token'] || '';
      this.linkMissing.set(!this.email || !this.token);
    });
  }

  onSubmit() {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (this.newPassword() !== this.confirmPassword()) {
      this.errorMessage.set("The two passwords don't match.");
      return;
    }

    const payload = {
      email: this.email,
      token: this.token,
      newPassword: this.newPassword()
    };

    this.isSaving.set(true);
    this.authService.resetPassword(payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set('Password saved. Taking you to sign in…');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err.error?.message || 'This reset link has expired or was already used.');
      }
    });
  }
}
