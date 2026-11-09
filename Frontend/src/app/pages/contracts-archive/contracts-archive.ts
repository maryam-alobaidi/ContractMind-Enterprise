import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Contract } from '../../services/contract';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { skip } from 'rxjs';

@Component({
  selector: 'app-contracts-archive',
  imports: [CommonModule],
  templateUrl: './contracts-archive.html',
  styleUrl: './contracts-archive.css',
})
export class ContractsArchive implements OnInit {
   contracts = signal<any[]>([]);
   isLoading = signal<boolean>(true);
   private contractService = inject(Contract);
   private router = inject(Router);
    authService=inject(Auth);
private destroyRef = inject(DestroyRef);




ngOnInit() {
  this.loadContracts();


  this.contractService.contracts$
    .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
    .subscribe(data => this.contracts.set(data));
}

    loadContracts(silent = false) {
  if (!silent) {
    this.isLoading.set(true);
  }
  this.contractService.getAllContracts().subscribe({
    next: (data) => {
      this.contracts.set(data);
      this.isLoading.set(false);
    },
    error: (err) => {
      console.error('Error fetching contracts:', err);
      this.isLoading.set(false);
    }
  });
    }

       viewReport(contract: any) {
     const id = contract?.contractId || contract?.id;
     if (id) {
       this.router.navigate(['/contract-report', id]);
     } else {
       console.error('Contract ID is missing or undefined:', contract);
     }
   }

   // Signals للبحث والفلاتر
   searchTerm = signal<string>('');
   selectedRisk = signal<string>('');
   startDate = signal<string>('');
   endDate = signal<string>('');

   filteredContracts = computed(() => {
     const allContracts = this.contracts();
     const search = this.searchTerm().toLowerCase();
     const risk = this.selectedRisk();
     const start = this.startDate();
     const end = this.endDate();

     return allContracts.filter(c => {
       const matchesSearch = !search || c.fileName?.toLowerCase().includes(search);

       let matchesRisk = true;
       if (risk === 'low') {
         matchesRisk = c.riskScore <= 50;
       } else if (risk === 'high') {
         matchesRisk = c.riskScore > 50;
       }

       const contractDate = c.uploadDate ? c.uploadDate.split('T')[0] : '';
       let matchesDate = true;
       
       if (start && contractDate) {
         matchesDate = matchesDate && (contractDate >= start);
       }
       if (end && contractDate) {
         matchesDate = matchesDate && (contractDate <= end);
       }

       return matchesSearch && matchesRisk && matchesDate;
     });
   });

   summaryLine = computed(() => {
     const all = this.contracts();
     if (this.isLoading()) return 'Every contract your team has uploaded, newest first.';
     if (all.length === 0) return 'Nothing uploaded yet.';
     const high = all.filter(c => c.riskScore > 50).length;
     const total = `${all.length} ${all.length === 1 ? 'contract' : 'contracts'} on file.`;
     if (high === 0) return `${total} None are marked high risk.`;
     return `${total} ${high} ${high === 1 ? 'is' : 'are'} marked high risk.`;
   });

   highRiskCount = computed(() => this.contracts().filter(c => c.riskScore > 50).length);

   averageRisk = computed(() => {
     const all = this.contracts();
     if (all.length === 0) return 0;
     return Math.round(all.reduce((sum, c) => sum + (Number(c.riskScore) || 0), 0) / all.length);
   });

   uploadedThisMonth = computed(() => {
     const now = new Date();
     return this.contracts().filter(c => {
       if (!c.uploadDate) return false;
       const d = new Date(c.uploadDate);
       return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
     }).length;
   });

   hasFilters = computed(() =>
     !!(this.searchTerm() || this.selectedRisk() || this.startDate() || this.endDate())
   );

   clearFilters() {
     this.searchTerm.set('');
     this.selectedRisk.set('');
     this.startDate.set('');
     this.endDate.set('');
   }

   // Signals للـ Toast
   showToast = signal<boolean>(false);
   toastMessage = signal<string>('Contract deleted successfully');

   triggerToast(message: string) {
     this.toastMessage.set(message);
     this.showToast.set(true);

     setTimeout(() => {
       this.showToast.set(false);
     }, 3000);
   }

   // Signals للـ Delete Modal
   showDeleteModal = signal<boolean>(false);
   contractToDelete = signal<any | null>(null);

   confirmDelete(contract: any) {
     this.contractToDelete.set(contract);
     this.showDeleteModal.set(true);
   }

   cancelDelete() {
     this.contractToDelete.set(null);
     this.showDeleteModal.set(false);
   }

   executeDelete() {
     const contract = this.contractToDelete();
     const id = contract?.contractId || contract?.id;
     if (!id) return;

     this.contractService.deleteContract(id).subscribe({
       next: () => {
        this.cancelDelete();

        
         this.contracts.update(prev => prev.filter(c => (c.contractId || c.id) !== id));

     
         this.triggerToast('Contract deleted.');


       },
       error: (err) => {
         console.error('Error deleting contract:', err);
         this.cancelDelete();
         this.triggerToast("Couldn't delete the contract. Try again.");
       }
     });
   }


   chatWithAi(contract:any){
     const id = contract?.contractId || contract?.id;
     if (id) {
       this.router.navigate(['/ai-legal-assistant', id]);
     } else {
       console.error('Contract ID is missing or undefined:', contract);
     }
   }
}