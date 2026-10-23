import { Component, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { ContractChat } from '../../services/contract-chat';
import { Contract } from '../../services/contract';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-select-contract-modal',
  imports: [DatePipe],
  templateUrl: './select-contract-modal.html',
  styleUrl: './select-contract-modal.css',
})
export class SelectContractModal implements OnInit {
  private contractChatService = inject(ContractChat);
  private contractService=inject(Contract);

  @Output() onSelect = new EventEmitter<number>();
  @Output() onClose = new EventEmitter<void>();

  contracts=signal<any[]|null>(null);
  selectedContractId=signal<number | null>(null);
  isLoadingContracts=signal<boolean>(true);

  ngOnInit(): void {
    this.loadUserContracts();
  }

  loadUserContracts() {
    this.isLoadingContracts.set(true);
    
    this.contractService.getAllContracts().subscribe({
      next: (res: any) => {
        console.log('API Response:', res);
        this.contracts.set(res);
        this.isLoadingContracts.set(false);
      },
      error: (err) => {
        console.error('Error loading contracts list:', err);
        this.isLoadingContracts.set(false);
      }
    });
  }

  selectContract(id: number) {
    this.selectedContractId.set(id);
  }

  confirmSelection() {
    const selectedId = this.selectedContractId();
    
    if (selectedId !== null) {
      this.onSelect.emit(selectedId); 
    }
  }

  closeModal() {
    this.onClose.emit();
  }
}