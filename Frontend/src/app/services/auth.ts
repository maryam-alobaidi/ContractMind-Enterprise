import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private router = inject(Router);
  private http = inject(HttpClient);

  userName = signal<string>('User');
  userId = signal<number>(-1);
  userRole=signal<string|null>(null);

    private apiUrl = `${environment.apiUrl}/Auth`;

  constructor() {
    const savedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user) {
          this.userName.set(user.name || 'User');
          this.userId.set(user.id || -1);
          this.userRole.set(user.role || null);
        }
      } catch (error) {
        console.error('Error parsing saved user from storage', error);
      }
    }
  }

  login(credentials: { email: string; password: string, rememberDevice?: boolean }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          const storage = credentials.rememberDevice ? localStorage : sessionStorage;

          // تنظيف القديم أولاً
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          sessionStorage.removeItem('currentUser');

          // تخزين الجديد
          storage.setItem('authToken', response.token);
          storage.setItem('currentUser', JSON.stringify(response.user));
          
          this.userName.set(response.user.name);
          this.userId.set(response.user.id);
          this.userRole.set(response.user.role);
          
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('currentUser');
    
    this.userName.set('User');
    this.userId.set(-1);
    this.userRole.set(null);

    this.router.navigate(['/login']);
  }

  forgotPassword(email: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email });
  }
}