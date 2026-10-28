import { Component, inject, signal } from '@angular/core';
import { Theme } from '../../services/theme';
import { Language } from '../../services/language';
import { Auth } from '../../services/auth';
import { Contract } from '../../services/contract';
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
  userRole = this.authService.userRole;

  showUploadModal = signal(false);
  isModalUploading = signal(false);
  isSidebarOpen = signal<boolean>(false);

  toggleSidebar() {
    this.isSidebarOpen.update(value => !value);
  }

  closeSidebarOnMobile() {
    if (window.innerWidth <= 768) {
      this.isSidebarOpen.set(false);
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  onUploadClick() {
    this.showUploadModal.set(true);
  }

  // يستقبل حالة الرفع من المودل
  onUploadingChange(value: boolean) {
    this.isModalUploading.set(value);
  }

  // أي محاولة إغلاق أثناء الرفع تُتجاهل
  onModalCloseAttempt() {
    if (this.isModalUploading()) {
      return;
    }
    this.showUploadModal.set(false);
  }

  handleUploadSuccess(newContract: any) {
  this.isModalUploading.set(false);
  this.showUploadModal.set(false);
  this.contractService.nodifyContractAdded(newContract);
}

  logout() {
    return this.authService.logout();
  }
}