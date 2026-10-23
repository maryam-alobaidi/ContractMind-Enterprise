import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-audit-logs',
  imports: [DatePipe,CommonModule],
  templateUrl: './audit-logs.html',
  styleUrl: './audit-logs.css',
})
export class AuditLogs implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7221/api/AuditLogs'; // قم بتعديل الـ URL حسب السيرفر لديك

  logs = signal<any[]>([]);
  filteredLogs = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  
  // أدوات التصفية والبحث
  searchTerm = signal<string>('');
  selectedAction = signal<string>('ALL');

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.isLoading.set(true);
    const params = new HttpParams().set('_t', new Date().getTime().toString());
    
    this.http.get<any[]>(this.apiUrl, { params }).subscribe({
      next: (data) => {
        this.logs.set(data);
        this.filteredLogs.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading audit logs:', err);
        this.isLoading.set(false);
      }
    });
  }

  filterLogs() {
    const term = this.searchTerm().toLowerCase();
    const action = this.selectedAction();

    const filtered = this.logs().filter(log => {
      const matchesSearch = log.action?.toLowerCase().includes(term) || 
                            log.userId?.toString().includes(term);
      const matchesAction = action === 'ALL' || log.action?.includes(action);
      return matchesSearch && matchesAction;
    });

    this.filteredLogs.set(filtered);
  }

  onSearchChange(event: any) {
    this.searchTerm.set(event.target.value);
    this.filterLogs();
  }

  onActionFilterChange(event: any) {
    this.selectedAction.set(event.target.value);
    this.filterLogs();
  }
}