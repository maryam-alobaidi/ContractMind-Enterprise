import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { ThemeToggle } from '../../components/theme-toggle/theme-toggle';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ThemeToggle],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(Auth);

  loginError = signal<string | null>(null);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberDevice: [false]
  });

  ngOnInit(): void {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.loginForm.patchValue({
        email: savedEmail,
        rememberDevice: true
      });
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }



  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loginError.set(null);
    const formValues = this.loginForm.value;

    if (formValues.rememberDevice) {
      localStorage.setItem('rememberedEmail', formValues.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
      rememberDevice: this.loginForm.value.rememberDevice
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
       
        if (response && response.userName) {
          localStorage.setItem('userName', response.userName);
        }
        if (response && response.token) {
          localStorage.setItem('token', response.token);
        }
        // =========================================================================

        this.router.navigate(['/contracts-archive']);
      },
      error: (err) => {
        const errorMsg = err.status === 401
          ? 'That email and password don’t match. Check both and try again.'
          : (err.error?.message || "Couldn't reach the server. Check your connection and try again.");
        this.loginError.set(errorMsg);
        console.error('Login Failed', err);
      }
    });
  }
}