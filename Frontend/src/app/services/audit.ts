import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Audit {
  private http = inject(HttpClient);
  private apiUrl = '${environment.apiUrl}/AuditLogs';

  
  getAuditLogs(params?: HttpParams): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  deleteAuditLogsByRange(params: HttpParams): Observable<any> {
    return this.http.delete(this.apiUrl, { params });
  }
}
