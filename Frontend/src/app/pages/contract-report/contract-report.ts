import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Contract } from '../../services/contract';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Auth } from '../../services/auth';

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
  private authService=inject(Auth);

  contract = signal<any | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  userName=signal<string|null>(this.authService.userName());

  ngOnInit() {
    const contractId = this.route.snapshot.paramMap.get('id');
    if (contractId) {
      this.fetchContractDetails(Number(contractId));
    } else {
      this.isLoading.set(false);
      this.errorMessage.set('Invalid contract ID.');
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
        this.errorMessage.set('Could not load contract details.');
      }
    });
  }

  goBack() {
    this.router.navigate(['/contracts-archive']);
  }
// 🖨️ دالة طباعة تقرير العقد بشكل احترافي
  printReport() {
    // جلب بيانات المستخدم الحالي من خدمة المصادقة
    const currentUserName = this.authService.userName() || 'System User';
    const currentUserRole = this.authService.userRole() || 'User';
    
    // جلب بيانات العقد الحالية (تأكد من مطابقتها لمتغيرات العقد لديك)
    const contract = this.contract(); // أو الـ object الخاص بالعقد
    const printDate = new Date().toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    let printContent = `
      <!DOCTYPE html>
      <html lang="en" dir="ltr">
      <head>
        <meta charset="utf-8">
        <title>Contract Analysis Report - #${contract?.contractId|| 'Report'}</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 30px; 
            color: #1f2937; 
            background: #fff; 
            line-height: 1.6;
          }
          .header { 
            text-align: center; 
            margin-bottom: 25px; 
            border-bottom: 2px solid #0d9488; 
            padding-bottom: 15px; 
          }
          .header h1 { 
            margin: 0 0 5px 0; 
            font-size: 24px; 
            color: #0f766e; 
          }
          .brand-subtitle {
            font-size: 13px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: bold;
          }
          .meta-grid { 
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            font-size: 13px; 
            margin-bottom: 25px; 
            background: #f8fafc; 
            padding: 15px; 
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          .meta-item strong {
            color: #334155;
          }
          .summary-box {
            background: #f0fdfa;
            border: 1px solid #ccfbf1;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
          }
          .summary-box h3 {
            margin-top: 0;
            color: #0f766e;
            font-size: 16px;
            border-bottom: 1px solid #99f6e4;
            padding-bottom: 8px;
          }
          .summary-text {
            font-size: 14px;
            color: #334155;
            text-align: justify;
            white-space: pre-line;
          }
          .footer {
            margin-top: 40px;
            text-align: right;
            font-size: 11px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand-subtitle">ContractMind </div>
          <h1>Contract Analysis Report</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #4b5563;">Contract ID: #${contract?.contractId || 'N/A'}</p>
        </div>

        <div class="meta-grid">
          <div><strong>Document Name:</strong> ${contract?.fileName || contract?.title || 'Untitled Contract'}</div>
          <div><strong>Upload/Contract Date:</strong> ${contract?.date || contract?.uploadDate || 'N/A'}</div>
          <div><strong>AI Risk Assessment:</strong> <span style="color: #059669; font-weight: bold;">${contract?.riskLevel || 'Low Risk'}</span></div>
          <div><strong>Printed At:</strong> ${printDate}</div>
          <div style="grid-column: span 2; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 4px;">
            <strong>Generated By (User):</strong> ${currentUserName} (${currentUserRole})
          </div>
        </div>

        <div class="summary-box">
          <h3>🤖 AI Executive Summary</h3>
          <div class="summary-text">${contract?.summary || 'No summary available for this contract.'}</div>
        </div>

        <div class="footer">
          ContractMind Legal Management System &copy; 2026 - Confidential Internal Report
        </div>
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
    const contractData = this.contract();
    if (!contractData) return;

   
    const generationTime = new Date().toLocaleString();

    // بناء هيكل المستند النظيف لحظياً (شكل تقرير رسمي عام)
    const reportContainer = document.createElement('div');
    reportContainer.style.position = 'absolute';
    reportContainer.style.left = '-9999px';
    reportContainer.style.top = '0';
    reportContainer.style.width = '800px'; // عرض مناسب لصفحة A4
    reportContainer.style.padding = '40px';
    reportContainer.style.backgroundColor = '#ffffff';
    reportContainer.style.color = '#111827';
    reportContainer.setAttribute('dir', 'auto');
    reportContainer.style.fontFamily = 'Arial, sans-serif';
    reportContainer.style.boxSizing = 'border-box';

    // محتوى التقرير بتنسيق مستند رسمي مع بيانات التدقيق والوقت واسم الموظف
    reportContainer.innerHTML = `
      <div style="border-bottom: 2px solid #0d9488; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="margin: 0; color: #0d9488; font-size: 24px; font-weight: bold;">ContractMind Legal AI</h1>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Enterprise Legal Workspace - Analysis Report</p>
        </div>
        <div style="text-align: right;">
          <span style="background: #f3f4f6; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: bold; color: #374151;">Report ID: #${contractData.contractId || contractData.id || 'N/A'}</span>
        </div>
      </div>

      <div style="margin-bottom: 25px; background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
        <h3 style="margin-top: 0; color: #1f2937; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Document & Audit Metadata</h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 35%;">Document Name:</td>
            <td style="padding: 8px 0; color: #111827; font-weight: bold;">${contractData.fileName || 'Legal Contract Document'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Upload Date:</td>
            <td style="padding: 8px 0; color: #374151;">${contractData.createdAt ? new Date(contractData.createdAt).toLocaleString() : 'Just now'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">AI Risk Assessment:</td>
            <td style="padding: 8px 0;">
              <span style="padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 12px; background: ${(contractData.riskScore || 0) <= 50 ? '#d1fae5' : '#fee2e2'}; color: ${(contractData.riskScore || 0) <= 50 ? '#065f46' : '#991b1b'};">
                ${(contractData.riskScore || 0) <= 50 ? 'Low Risk' : 'High Risk'} (${contractData.riskScore || 0}%)
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Generated By:</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 500;">${this.userName()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Generation Time:</td>
            <td style="padding: 8px 0; color: #374151;">${generationTime}</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 30px;">
        <h3 style="color: #0d9488; font-size: 16px; margin-bottom: 10px;">🤖 AI Executive Summary</h3>
        <div dir="auto" style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #0d9488; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap;">
          ${contractData.summary || 'No summary available for this contract.'}
        </div>
      </div>

      <div style="margin-top: 50px; border-top: 1px solid #e5e7eb; padding-top: 15px; text-align: center; color: #9ca3af; font-size: 12px;">
        Generated automatically by ContractMind Enterprise Workspace • Confidential Legal Document
      </div>
    `;

    document.body.appendChild(reportContainer);

    // تحويل المستند النظيف إلى PDF عالي الجودة وتنزيله
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

      const contractId = contractData.contractId || contractData.id || 'Report';
      pdf.save(`Contract-Report-${contractId}.pdf`);
    });
   }
}