import { Component, inject, signal } from '@angular/core';
import { Theme } from '../../services/theme';
import { Language } from '../../services/language';
import { Auth } from '../../services/auth';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UploadModal } from '../upload-modal/upload-modal'; // استدعاء مودل الرفع إذا كان يفتح من الهيدر

@Component({
  selector: 'app-main-layout',
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
  private router = inject(Router);

  userName = this.authService.userName;
  showUploadModal = signal(false); 

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  onUploadClick() {
    this.showUploadModal.set(true);
  }

 
  handleUploadSuccess(newContract: any) {
    console.log('Contract uploaded successfully from layout header');
    this.showUploadModal.set(false);
    
  }
}