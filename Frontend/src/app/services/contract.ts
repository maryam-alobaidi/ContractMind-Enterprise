import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Contract {
private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7221/api/Contracts'; 

  uploadAndAnalyze(file: File, userId: number|null, language: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
   const safeUserId = userId ? userId.toString() : '1';
    formData.append('userId', safeUserId);
    formData.append('language', language); 

    return this.http.post<any>(`${this.apiUrl}/upload-and-analyze`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  getAllContracts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getContractById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}