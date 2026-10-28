import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class User {

private http = inject(HttpClient);
  private apiUrl = '${environment.apiUrl}/Users';

  // GET: api/Users
  loadUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // POST: api/Users
  createUser(user: any): Observable<any> {
    return this.http.post(this.apiUrl, user);
  }

  // PUT: api/Users/{id}
  updateUser(id: number, user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, user);
  }

  // DELETE: api/Users/{id}
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
