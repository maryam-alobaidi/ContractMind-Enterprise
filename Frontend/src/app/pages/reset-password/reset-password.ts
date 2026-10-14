
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  // Define reactive state using Angular Signals
  newPassword = signal('');
  confirmPassword = signal('');
  successMessage = signal('');
  errorMessage = signal('');

  private email = '';
  private token = '';

  ngOnInit(): void {
    // Capture email and token from query parameters securely
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.token = params['token'] || '';
    });
  }

  onSubmit() {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (this.newPassword() !== this.confirmPassword()) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    const payload = {
      email: this.email,
      token: this.token,
      newPassword: this.newPassword()
    };

    // Submit payload to .NET 9 API endpoint
    this.http.post('https://localhost:7221/api/auth/reset-password', payload).subscribe({
      next: () => {
        this.successMessage.set('Password has been reset successfully! Redirecting to login...');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to reset password. The link may have expired.');
      }
    });
  }
}