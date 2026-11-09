import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Audit } from '../../services/audit';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [DatePipe, CommonModule, FormsModule],
  templateUrl: './audit-logs.html',
  styleUrl: './audit-logs.css',
})
export class AuditLogs implements OnInit {
   auditService = inject(Audit);
   authService=inject(Auth);

  logs = signal<any[]>([]);
  filteredLogs = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  
  searchTerm = signal<string>('');
  selectedAction = signal<string>('ALL');
  startDate = signal<string>('');
  endDate = signal<string>('');

  // Toast Notification Signals
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');
  private toastTimeout: any;

  // Delete Modal Signal
  showDeleteModal = signal<boolean>(false);

  ngOnInit() {
    this.loadLogs();
  }

  
  // Load logs from the server and reset filters on manual refresh
  loadLogs(resetFilters: boolean = false) {
    this.isLoading.set(true);

    // إذا تم الضغط على زر التحديث يدويًا، نقوم بتصفير الفلاتر ليعود كل شيء لأصله
    if (resetFilters) {
      this.searchTerm.set('');
      this.selectedAction.set('ALL');
      this.startDate.set('');
      this.endDate.set('');
    }

    const params = new HttpParams().set('_t', new Date().getTime().toString());
    
    this.auditService.getAuditLogs(params).subscribe({
      next: (data) => {
        this.logs.set(data);
        this.filterLogs(); // تطبيق الفلاتر (التي أصبحت فارغة، لذا ستعرض كل السجلات)
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading audit logs:', err);
        this.isLoading.set(false);
      }
    });
  }

  // 2. Comprehensive filtering (Search + Action Type + Date Range)
  filterLogs() {
    const term = this.searchTerm().toLowerCase();
    const action = this.selectedAction();
    const start = this.startDate();
    const end = this.endDate();

    const filtered = this.logs().filter(log => {
      const matchesSearch = !term || 
        log.action?.toLowerCase().includes(term) || 
        log.userId?.toString().includes(term) ||
        String(log.logId || log.id).includes(term);

      const matchesAction = action === 'ALL' || log.action?.includes(action);

      let matchesDate = true;
      const logDateStr = log.timestamp || log.createdAt;
      if (logDateStr) {
        const logDate = new Date(logDateStr).toISOString().split('T')[0];
        if (start && logDate < start) matchesDate = false;
        if (end && logDate > end) matchesDate = false;
      }

      return matchesSearch && matchesAction && matchesDate;
    });

    this.filteredLogs.set(filtered);
  }

  clearFilters() {
    this.searchTerm.set('');
    this.selectedAction.set('ALL');
    this.startDate.set('');
    this.endDate.set('');
    this.filterLogs();
  }

  // Log entries are stored as "UPLOAD / file name", "DELETE / file name", "AI_CHAT / file name"
  actionKind(log: any): 'upload' | 'delete' | 'chat' | 'other' {
    const action: string = log?.action || '';
    if (action.startsWith('UPLOAD')) return 'upload';
    if (action.startsWith('DELETE')) return 'delete';
    if (action.startsWith('AI_CHAT')) return 'chat';
    return 'other';
  }

  actionLabel(log: any): string {
    switch (this.actionKind(log)) {
      case 'upload': return 'Uploaded';
      case 'delete': return 'Deleted';
      case 'chat': return 'Asked AI';
      default: return (log?.action || '').split(' / ')[0] || 'Other';
    }
  }

  actionDocument(log: any): string {
    const parts = (log?.action || '').split(' / ');
    return parts.length > 1 ? parts.slice(1).join(' / ') : '–';
  }

  private escapeHtml(value: unknown): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private csvCell(value: unknown): string {
    return `"${String(value ?? '').replace(/"/g, '""')}"`;
  }

  // 3. Export filtered logs to CSV
  exportLogs() {
    const logs = this.filteredLogs();
    if (logs.length === 0) {
      this.triggerToast('No entries to export. Change the filters and try again.', 'error');
      return;
    }

    const headers = ['Entry', 'When', 'Action', 'Document', 'User'];
    const csvRows = [
      headers.join(','),
      ...logs.map(log => [
        this.csvCell(log.logId || log.id),
        this.csvCell(log.timestamp || log.createdAt),
        this.csvCell(this.actionLabel(log)),
        this.csvCell(this.actionDocument(log)),
        this.csvCell(log.userId ?? '')
      ].join(','))
    ];

    // BOM so Excel opens Arabic and accented file names correctly
    const blob = new Blob(['﻿' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${this.startDate() || 'all'}_to_${this.endDate() || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 4. Print logs by dynamically generating a dedicated print window and report
  printLogs() {
    const logsToPrint = this.filteredLogs();
    
    if (logsToPrint.length === 0) {
      this.triggerToast('No entries to print. Change the filters and try again.', 'error');
      return;
    }

    const printDate = new Date().toLocaleString();
    const start = this.escapeHtml(this.startDate() || 'the first entry');
    const end = this.escapeHtml(this.endDate() || 'today');

    let printContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>ContractMind audit log</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 32px; color: #19213A; background: #fff; }
          h1 { font-family: Georgia, 'Times New Roman', serif; font-size: 24px; margin: 0 0 4px; }
          .meta { font-size: 12px; color: #545E78; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #D6DBE4; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border-bottom: 1px solid #D6DBE4; padding: 8px 10px; text-align: left; font-size: 12px; }
          th { color: #545E78; font-weight: 600; border-bottom-color: #B9C1CF; }
          .deleted { color: #B8142C; }
        </style>
      </head>
      <body>
        <h1>Audit log</h1>
        <div class="meta">${logsToPrint.length} entries from ${start} to ${end}. Printed ${printDate}.</div>
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>When</th>
              <th>Action</th>
              <th>Document</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
    `;

    logsToPrint.forEach(log => {
      const when = log.timestamp || log.createdAt;
      printContent += `
        <tr>
          <td>${this.escapeHtml(log.logId || log.id || '–')}</td>
          <td>${this.escapeHtml(when ? new Date(when).toLocaleString() : '–')}</td>
          <td class="${this.actionKind(log) === 'delete' ? 'deleted' : ''}">${this.escapeHtml(this.actionLabel(log))}</td>
          <td dir="auto">${this.escapeHtml(this.actionDocument(log))}</td>
          <td>${this.escapeHtml(log.userId ?? '–')}</td>
        </tr>
      `;
    });

    printContent += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=900,height=650');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    }
  }

  // 5. Open Custom Delete Modal (checks dates first)
  openDeleteModal() {
    const start = this.startDate();
    const end = this.endDate();

    if (!start || !end) {
      this.triggerToast('Choose a From and a To date first. Only entries in that range are deleted.', 'error');
      return;
    }

    this.showDeleteModal.set(true);
  }

  // Cancel deletion and close modal
  cancelDeleteRange() {
    this.showDeleteModal.set(false);
  }

  // Confirm and execute deletion via API
  confirmDeleteRange() {
    const start = this.startDate();
    const end = this.endDate();

    const deleteParams = new HttpParams()
      .set('startDate', start)
      .set('endDate', end);

    this.auditService.deleteAuditLogsByRange(deleteParams).subscribe({
      next: () => {
        this.cancelDeleteRange();
        this.triggerToast('Entries deleted.');
        this.loadLogs();
      },
      error: (err) => {
        console.error('Error deleting logs:', err);
        this.cancelDeleteRange();
        this.triggerToast("Couldn't delete the entries. Try again.", 'error');
      }
    });
  }

  // Toast Trigger Helper
  triggerToast(message: string, type: 'success' | 'error' = 'success') {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.toastTimeout = setTimeout(() => this.toastMessage.set(null), 3500);
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