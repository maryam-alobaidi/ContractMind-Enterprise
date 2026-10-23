import { Component, OnInit, signal, inject ,AfterViewChecked, ElementRef, ViewChild, effect} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectContractModal } from '../select-contract-modal/select-contract-modal';
import { Contract } from '../../services/contract';
import { ContractChat } from '../../services/contract-chat';

@Component({
  selector: 'app-ai-legal-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectContractModal],
  templateUrl: './ai-legal-assistant.html',
  styleUrl: './ai-legal-assistant.css'
})
export class AiLegalAssistant implements OnInit, AfterViewChecked {
 
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private contractService=inject(Contract);
  private contractChatService=inject(ContractChat);

  
  contractId = signal<number | null>(null);
  contractText = signal<string>('');
  messages = signal<any[]>([]);
  suggestedQuestions = signal<string[]>([
    "What are the termination conditions?",
    "Are there any financial penalties?",
    "What is the duration of this contract?"
  ]);
  
  userQuery = signal<string>('');
  isTyping = signal<boolean>(false);
  showSelectModal = signal<boolean>(false);

  private shouldScroll = true;

  constructor() {
    effect(() => {
     
      this.messages();
      this.isTyping();
      this.scrollToBottom();
    });
  }

 ngOnInit(): void {
 
  const idParam = this.route.snapshot.paramMap.get('id');
  

  if (idParam && idParam !== 'null' && idParam !== 'undefined') {
    const contractIdNum = Number(idParam);
    this.contractId.set(contractIdNum);
    this.showSelectModal.set(false); // إخفاء المودال لوجود عقد
    this.loadContractDetails(contractIdNum);
     this.loadContractChatHistory(contractIdNum);
  } else {
    
    this.contractId.set(null);
    this.showSelectModal.set(true);
  }
}

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
    }
  }

  scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        const element = this.scrollContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error(err);
    }
  }


  sendMessage() {
  const query = this.userQuery().trim();
  const contractId = this.contractId();

 
  if (!query || contractId === null) {
    console.warn('Please select a contract and enter a message.');
    return;
  }


 let detectedLanguage = 'en';

  const isArabic = /[\u0600-\u06FF]/.test(query);
 
  const isSpanish = /[¿¡ñáéíóúü]|(\b(el|la|los|las|un|una|y|que|por|para|con)\b)/i.test(query);

  if (isArabic) {
    detectedLanguage = 'ar';
  } else if (isSpanish) {
    detectedLanguage = 'es';
  } else {
    detectedLanguage = 'en';
  }
  const userMsg = {
    messageId: Date.now(),
    sender: 'User',
    messageText: query,
    timestamp: new Date()
  };
  

  this.messages.update(msgs => [...msgs, userMsg]);
  this.userQuery.set('');      // تفريغ حقل الإدخال
  this.isTyping.set(true);     // إظهار مؤشر الكتابة (جاري الرد...)

 
  this.contractChatService.chatWithContract(contractId, query,detectedLanguage).subscribe({
    next: (res: any) => {
    
      const aiMsg = {
        messageId: Date.now() + 1,
        sender: 'Assistant',
        messageText: res.response || 'No response received.',
        timestamp: new Date()
      };

      this.messages.update(msgs => [...msgs, aiMsg]);
      this.isTyping.set(false); // إيقاف مؤشر الكتابة
    },
    error: (err) => {
      console.error('Error communicating with AI:', err);

      // في حال حدث خطأ (مثل 404 Contract not found أو 500)، نظهر رسالة الخطأ القادمة من الباك إن إن وجدت
      const errorMsg = {
        messageId: Date.now() + 1,
        sender: 'Assistant',
        messageText: err.error?.message || 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };

      this.messages.update(msgs => [...msgs, errorMsg]);
      this.isTyping.set(false); // إيقاف مؤشر الكتابة
    }
  });
  }

  
  onContractSelected(selectedId: number) {
    this.contractId.set(selectedId);
    this.showSelectModal.set(false);
    this.loadContractDetails(selectedId);
    this.loadContractChatHistory(selectedId);
    
   
    this.router.navigate(['/ai-legal-assistant', selectedId], { replaceUrl: true });
  }


  handleModalClose() {
    if (!this.contractId()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.showSelectModal.set(false);
    }
  }

  loadContractDetails(id: number) {
   this.contractText.set('Loading contract text...');
    this.contractService.getContractById(id).subscribe(res => this.contractText.set(res.extractedText));
    
    this.loadContractChatHistory(id);
  }


  loadContractChatHistory(contractId: number) {
  this.contractService.getChatHistory(contractId).subscribe({
    next: (history: any[]) => {
    
      const formattedMessages = history.map(record => ({
        messageId: record.messageId || record.MessageId,
        sender: record.sender || record.Sender,
        messageText: record.messageText || record.MessageText,
        timestamp: new Date(record.timestamp || record.Timestamp)
      }));

     
      this.messages.set(formattedMessages);
      this.scrollToBottom(); 
    },
    error: (err) => {
      console.error('Error loading chat history:', err);
      this.messages.set([]); 
    }
  });
 }


  sendPresetQuery(question: string) {
    this.userQuery.set(question);
    this.sendMessage();
  }


openSelectContractModal(){
  this.showSelectModal.set(true);
  this.messages.set([]);
  
}

}