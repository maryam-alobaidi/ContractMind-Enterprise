import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Audit {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7221/api/AuditLogs';

  
  getAuditLogs(params?: HttpParams): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  deleteAuditLogsByRange(params: HttpParams): Observable<any> {
    return this.http.delete(this.apiUrl, { params });
  }
}
