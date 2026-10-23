import { Component, inject, signal } from '@angular/core';
import { Theme } from '../../services/theme';
import { Language } from '../../services/language';
import { Auth } from '../../services/auth';
import { Contract } from '../../services/contract'; // استدعاء سيرفس العقود
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UploadModal } from '../upload-modal/upload-modal'; 

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,        
    RouterLink,        
    RouterLinkActive,
    UploadModal 
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  protected readonly title = signal('contract-mind-frontend');
  public themeService = inject(Theme);
  public languageService = inject(Language);
  private authService = inject(Auth);
  private contractService = inject(Contract);
  private router = inject(Router);

  userName = this.authService.userName;
  showUploadModal = signal(false); 

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  onUploadClick() {
    this.showUploadModal.set(true);
  }

  // عند نجاح عملية الرفع
  handleUploadSuccess(newContract: any) {
    this.showUploadModal.set(false);
    
    if (newContract) {
      this.contractService.nodifyContractAdded(newContract);
    }

    setTimeout(() => {
      this.contractService.nodifyContractAdded({ refreshed: true });
    }, 300);
  }

  
  handleModalClose() {
    this.showUploadModal.set(false);
   
  }
}