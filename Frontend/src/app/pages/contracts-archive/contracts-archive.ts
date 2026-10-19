import { Component, inject, OnInit, signal,computed } from '@angular/core';
import { Contract } from '../../services/contract';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

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

     ngOnInit() {
   
    this.loadContracts();
  }

   loadContracts() {
    this.isLoading.set(true);
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
     console.log('Contract :', contract);
    this.router.navigate(['/contract-report', id]);

  } else {
    console.error('Contract ID is missing or undefined:', contract);
  }
  }

  //signal for filters 

  searchTerm=signal<string>('');
  selectedRisk=signal<string>('');
  startDate=signal<string>('');
  endDate=signal<string>('');

  //work on filters
   
  filteredContracts=computed(()=>{
    const allContracts=this.contracts();
    const search=this.searchTerm().toLowerCase();
    const risk=this.selectedRisk();
    const start=this.startDate();
    const end=this.endDate();


    return allContracts.filter(c=>{

      const matchesSearch=!search|| c.fileName?.toLowerCase().includes(search);

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

    })
  })
}
