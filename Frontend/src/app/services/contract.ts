import { HttpClient, HttpParams ,HttpEventType} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter, map } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class Contract {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Contracts`;

  
  private contractsSubject = new BehaviorSubject<any[]>([]);
  contracts$ = this.contractsSubject.asObservable();


  loadAllContracts() {
    const params = new HttpParams().set('_t', new Date().getTime().toString());
    this.http.get<any[]>(this.apiUrl, { params }).subscribe({
      next: (data) => this.contractsSubject.next(data),
      error: (err) => console.error('Error loading contracts:', err)
    });
  }



  nodifyContractAdded(newContract: any) {
    this.loadAllContracts();
  }

 uploadAndAnalyze(file: File, userId: number | null, language: string): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);
  const safeUserId = userId ? userId.toString() : '1';
  formData.append('userId', safeUserId);
  formData.append('language', language);

  return this.http.post<any>(`${this.apiUrl}/upload-and-analyze`, formData, {
    reportProgress: true,
    observe: 'events'
  }).pipe(
    filter(event => event.type === HttpEventType.Response),
    map((event: any) => event.body)
  );
}

  getAllContracts(): Observable<any[]> {
    const params = new HttpParams().set('_t', new Date().getTime().toString());
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  getContractById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<any> {
    const params = new HttpParams().set('_t', new Date().getTime().toString());
    return this.http.get<any>(`${this.apiUrl}/stats`, { params });
  }

  getResentContracts(): Observable<any> {
    const params = new HttpParams().set('_t', new Date().getTime().toString());
    return this.http.get<any>(`${this.apiUrl}/recent`, { params });
  }

  deleteContract(id: number | string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getChatHistory(contractId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/History/${contractId}`);
  }
}