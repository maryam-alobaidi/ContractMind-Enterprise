import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contract } from '../../services/contract';
import { Auth } from '../../services/auth';
import { Language } from '../../services/language';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-upload-modal',
  imports: [CommonModule,FormsModule],
  templateUrl: './upload-modal.html',
  styleUrl: './upload-modal.css',
})
export class UploadModal {

private contractService = inject(Contract);
private authService=inject(Auth);
private langService = inject(Language);

  @Output() close = new EventEmitter<void>();
  @Output() uploadSuccess = new EventEmitter<any>();

  selectedFile = signal<File | null>(null);
  selectedLanguage =signal<string>( this.langService.currentLanguage());
  isUploading = signal(false);
  uploadProgress = signal(0);
  errorMessage = signal<string | null>(null);

  userId = this.authService.userName;

  closeModal() {
    this.close.emit();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
      this.errorMessage.set(null);
    }
  }

 onUpload() {
    const file = this.selectedFile();
    if (!file) return;

    this.isUploading.set(true);
    this.uploadProgress.set(0);
    this.errorMessage.set(null);

    // استخدام اللغة المختارة من أزرار المودال (selectedLanguage) مباشرة
    const language = this.selectedLanguage(); 
     const userId = this.authService.userId ? this.authService.userId() : null;
    this.contractService.uploadAndAnalyze(file, userId, language).subscribe({
      next: (response) => {
        this.isUploading.set(false);
        this.uploadSuccess.emit(response); 
        this.closeModal(); 
      },
      error: (err) => {
        this.isUploading.set(false);
        this.errorMessage.set(err.error?.message || 'An error occurred while uploading and analyzing the file.');
      }
    });
  }
}