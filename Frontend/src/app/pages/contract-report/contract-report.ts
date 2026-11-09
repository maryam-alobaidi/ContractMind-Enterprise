import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Contract } from '../../services/contract';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Auth } from '../../services/auth';

// Report colours for print/PDF, matching the app's light theme
const INK = '#0F1222';
const INK_SOFT = '#565C73';
const RULE = '#D0D3E0';
const REDLINE = '#E11D48';
const STET = '#059669';

@Component({
  selector: 'app-contract-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contract-report.html',
  styleUrl: './contract-report.css'
})
export class ContractReport implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private contractService = inject(Contract);
  private authService = inject(Auth);

  contract = signal<any | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  userName = signal<string | null>(this.authService.userName());

  riskScore = computed<number>(() => {
    const c = this.contract();
    return Number(c?.riskScore ?? c?.RiskScore ?? 0);
  });

  ngOnInit() {
    const contractId = this.route.snapshot.paramMap.get('id');
    if (contractId) {
      this.fetchContractDetails(Number(contractId));
    } else {
      this.isLoading.set(false);
      this.errorMessage.set('This link has no contract number.');
    }
  }

  fetchContractDetails(id: number) {
    this.isLoading.set(true);
    this.contractService.getContractById(id).subscribe({
      next: (data) => {
        this.contract.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching contract by id:', err);
        this.isLoading.set(false);
        this.errorMessage.set("This contract couldn't be loaded.");
      }
    });
  }

  goBack() {
    this.router.navigate(['/contracts-archive']);
  }

  askAi() {
    const c = this.contract();
    const id = c?.contractId || c?.id;
    if (id) {
      this.router.navigate(['/ai-legal-assistant', id]);
    }
  }

  /** Escapes text before it is written into report HTML (file names and AI output are untrusted). */
  private escapeHtml(value: unknown): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private reportFields() {
    const c = this.contract();
    const score = this.riskScore();
    const isHigh = score > 50;
    return {
      id: this.escapeHtml(c?.contractId || c?.id || 'N/A'),
      fileName: this.escapeHtml(c?.fileName || 'Untitled contract'),
      uploaded: c?.uploadDate ? new Date(c.uploadDate).toLocaleString() : 'Not recorded',
      summary: this.escapeHtml(c?.summary || 'The AI did not return a summary for this contract.'),
      score,
      verdict: isHigh ? 'High risk' : 'Low risk',
      riskColor: isHigh ? REDLINE : STET,
    };
  }

  printReport() {
    if (!this.contract()) return;

    const f = this.reportFields();
    const user = this.escapeHtml(this.authService.userName() || 'System user');
    const role = this.escapeHtml(this.authService.userRole() || 'User');
    const printedAt = new Date().toLocaleString();

    const printContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Contract report No. ${f.id}</title>
        <style>
          body { font-family: Georgia, 'Times New Roman', serif; padding: 40px; color: ${INK}; background: #fff; line-height: 1.6; max-width: 760px; margin: 0 auto; }
          .brand { font-size: 13px; color: ${INK_SOFT}; font-family: 'Segoe UI', Arial, sans-serif; }
          h1 { font-size: 26px; margin: 6px 0 4px; line-height: 1.2; }
          .meta { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: ${INK_SOFT}; padding-bottom: 16px; border-bottom: 1px solid ${RULE}; }
          .risk { margin: 20px 0; padding-left: 14px; border-left: 2px solid ${f.riskColor}; color: ${f.riskColor}; font-style: italic; font-size: 18px; }
          h2 { font-family: 'Segoe UI', Arial, sans-serif; font-size: 15px; margin: 24px 0 8px; }
          .summary { font-size: 15px; white-space: pre-wrap; }
          .footer { margin-top: 40px; padding-top: 10px; border-top: 1px solid ${RULE}; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: ${INK_SOFT}; }
        </style>
      </head>
      <body>
        <div class="brand">ContractMind contract report, No. ${f.id}</div>
        <h1 dir="auto">${f.fileName}</h1>
        <div class="meta">Uploaded ${f.uploaded}</div>
        <div class="risk">AI risk score ${f.score}/100, ${f.verdict.toLowerCase()}</div>
        <h2>Summary</h2>
        <div class="summary" dir="auto">${f.summary}</div>
        <div class="footer">Printed ${printedAt} by ${user} (${role}). Confidential.</div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    }
  }

  exportReport() {
    if (!this.contract()) return;

    const f = this.reportFields();
    const generatedBy = this.escapeHtml(this.userName());
    const generatedAt = new Date().toLocaleString();

    const reportContainer = document.createElement('div');
    reportContainer.style.position = 'absolute';
    reportContainer.style.left = '-9999px';
    reportContainer.style.top = '0';
    reportContainer.style.width = '800px';
    reportContainer.style.padding = '48px';
    reportContainer.style.backgroundColor = '#ffffff';
    reportContainer.style.color = INK;
    reportContainer.style.fontFamily = "Georgia, 'Times New Roman', serif";
    reportContainer.style.boxSizing = 'border-box';

    reportContainer.innerHTML = `
      <div style="font-family: Arial, sans-serif; font-size: 13px; color: ${INK_SOFT};">ContractMind contract report, No. ${f.id}</div>
      <h1 dir="auto" style="font-size: 28px; line-height: 1.2; margin: 8px 0 6px;">${f.fileName}</h1>
      <div style="font-family: Arial, sans-serif; font-size: 13px; color: ${INK_SOFT}; padding-bottom: 18px; border-bottom: 1px solid ${RULE};">
        Uploaded ${f.uploaded}
      </div>
      <div style="margin: 24px 0; padding-left: 16px; border-left: 2px solid ${f.riskColor}; color: ${f.riskColor}; font-style: italic;">
        <span style="font-size: 40px; font-weight: bold;">${f.score}</span><span style="font-size: 18px;">/100</span>
        <div style="font-size: 18px; margin-top: 4px;">${f.verdict}</div>
      </div>
      <h2 style="font-family: Arial, sans-serif; font-size: 15px; margin: 0 0 10px;">Summary</h2>
      <div dir="auto" style="font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${f.summary}</div>
      <div style="margin-top: 48px; padding-top: 12px; border-top: 1px solid ${RULE}; font-family: Arial, sans-serif; font-size: 11px; color: ${INK_SOFT};">
        Generated ${generatedAt} by ${generatedBy}. Confidential.
      </div>
    `;

    document.body.appendChild(reportContainer);

    html2canvas(reportContainer, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    }).then((canvas) => {
      document.body.removeChild(reportContainer);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Contract-Report-${this.contract()?.contractId || this.contract()?.id || 'report'}.pdf`);
    });
  }
}
