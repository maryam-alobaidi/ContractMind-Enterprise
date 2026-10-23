import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContractChat {



  private http=inject(HttpClient);
  private router=inject(Router);

  private apiUrl="https://localhost:7221/api/Contracts";


  chatWithContract(contractId: number, userQuery: string, language: string = 'en'): Observable<any> {
    
    const requestPayload = {
      contractId: contractId,
      userQuery: userQuery,
      language: language
    };

   
    return this.http.post<any>(`${this.apiUrl}/Chat`, requestPayload);
  }

 


 
}






