import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnInit, signal } from '@angular/core';
import { UploadModal } from '../upload-modal/upload-modal';
import { Theme } from '../../services/theme';
import { Language } from '../../services/language';
import { Contract } from '../../services/contract';
import { Auth } from '../../services/auth';
import { ContractReport } from '../contract-report/contract-report';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule,UploadModal,ContractReport],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
    protected readonly title = signal('contract-mind-frontend');
    public themeService=inject(Theme);
    public languageService=inject(Language);
    private authService=inject(Auth);
    private contractService = inject(Contract);
    private router = inject(Router);

  contracts = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  isModalOpen = signal<boolean>(false);
  userName=this.authService.userName;


  ngOnInit() {
    this.loadContracts();
  }
 
  showUploadModal = signal(false);

  toggleTheme() {
  this.themeService.toggleTheme();
  }

  onUploadClick(){
    this.showUploadModal.set(true);
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

  handleUploadSuccess(newContract: any) {
   this.loadContracts();  
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
}
