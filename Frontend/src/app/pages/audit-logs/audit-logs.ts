import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Audit } from '../../services/audit';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [DatePipe, CommonModule, FormsModule],
  templateUrl: './audit-logs.html',
  styleUrl: './audit-logs.css',
})
export class AuditLogs implements OnInit {
  private auditService = inject(Audit);

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

  // 3. Export filtered logs to CSV
  exportLogs() {
    const logs = this.filteredLogs();
    if (logs.length === 0) {
      this.triggerToast('No logs available to export for the selected range.', 'error');
      return;
    }

    const headers = ['LogID', 'UserID', 'Action', 'Date'];
    const csvRows = [
      headers.join(','),
      ...logs.map(log => [
        log.logId || log.id,
        log.userId || '1',
        `"${log.action}"`,
        `"${log.timestamp || log.createdAt}"`
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
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
      this.triggerToast('No logs available to print based on the current filter.', 'error');
      return;
    }

    const printDate = new Date().toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const start = this.startDate() || 'All';
    const end = this.endDate() || 'All';

    let printContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Audit Logs Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #111; background: #fff; }
          .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #333; padding-bottom: 15px; }
          .header h1 { margin: 0 0 5px 0; font-size: 22px; color: #1f2937; }
          .meta-info { display: flex; justify-content: space-between; font-size: 13px; color: #555; margin-bottom: 20px; background: #f9fafb; padding: 10px 15px; border-radius: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #d1d5db; padding: 10px 12px; text-align: left; font-size: 12px; }
          th { background-color: #f3f4f6; color: #111; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9fafb; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ContractMind System - Audit Logs Report</h1>
          <p style="margin: 0; font-size: 12px; color: #6b7280;">Official System Activity and Operations Record</p>
        </div>
        <div class="meta-info">
          <div><strong>Printed At:</strong> ${printDate}</div>
          <div><strong>Date Range:</strong> ${start} to ${end}</div>
          <div><strong>Total Records:</strong> ${logsToPrint.length}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Log ID</th>
              <th>User ID</th>
              <th>Action</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
    `;

    logsToPrint.forEach(log => {
      printContent += `
        <tr>
          <td>${log.logId || log.id || '-'}</td>
          <td>${log.userId || '1'}</td>
          <td>${log.action || '-'}</td>
          <td>${log.timestamp || log.createdAt || '-'}</td>
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
      this.triggerToast('Please select both Start Date and End Date to clear records.', 'error');
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
        this.triggerToast('Audit logs cleared successfully for the selected range.');
        this.loadLogs();
      },
      error: (err) => {
        console.error('Error deleting logs:', err);
        this.cancelDeleteRange();
        this.triggerToast('Failed to delete audit logs, please try again.', 'error');
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