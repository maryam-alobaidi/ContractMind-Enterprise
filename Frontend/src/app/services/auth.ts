import { HttpClient } from '@angular/common/http';
import { inject, Inject, Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {


 

  private router = inject(Router);
  private http=inject(HttpClient);


  private apiUrl="https://localhost:7221/api/Auth/login";

  login(credentials:{email:string;password:string,rememberDevice?:boolean}):Observable<any>{
    return this.http.post<any>(this.apiUrl,credentials).pipe(
      tap(response=>{
        if(response && response.token){

          const storage=credentials.rememberDevice?localStorage:sessionStorage;

          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');

          storage.setItem('authToken', response.token);
          storage.setItem('currentUser', JSON.stringify(response.user));
        }
      })
    );
  }


  logout(){
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
  


}
