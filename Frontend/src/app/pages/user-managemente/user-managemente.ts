import { Component, OnInit, signal, computed, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { User } from '../../services/user';

Chart.register(...registerables);

export interface UserModel {
  userId?: number;
  fullName: string;
  email: string;
  passwordHash?: string;
  role: 'Admin' | 'Manager' | 'User';
  createdAt?: string;
}

@Component({
  selector: 'app-user-managemente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-managemente.html',
  styleUrl: './user-managemente.css',
})
export class UserManagemente implements OnInit, AfterViewInit {

  @ViewChild('roleChartCanvas') roleChartCanvas!: ElementRef<HTMLCanvasElement>;
  chart: Chart | null = null;

  private userService=inject(User);

  // Signals للبيانات والفلترة
  users = signal<UserModel[]>([]);
  searchTerm = signal<string>('');
  selectedRoleFilter = signal<string>('ALL');
  isLoading = signal<boolean>(false);

  isFormModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  isEditMode = signal<boolean>(false);

  currentUserForm = signal<UserModel>({
    fullName: '',
    email: '',
    passwordHash: '',
    role: 'User'
  });

  userToDelete = signal<UserModel | null>(null);

  // Computed Signals لحساب الإحصائيات والفلترة تلقائياً
  adminCount = computed(() => this.users().filter(u => u.role === 'Admin').length);
  managerCount = computed(() => this.users().filter(u => u.role === 'Manager').length);
  userCount = computed(() => this.users().filter(u => u.role === 'User').length);
  totalUsers = computed(() => this.users().length);

  filteredUsers = computed(() => {
    let result = this.users();
    const search = this.searchTerm().toLowerCase().trim();
    
    if (search) {
      result = result.filter(u => 
        u.fullName.toLowerCase().includes(search) || 
        u.email.toLowerCase().includes(search)
      );
    }

    const roleFilter = this.selectedRoleFilter();
    if (roleFilter !== 'ALL') {
      result = result.filter(u => u.role === roleFilter);
    }

    return result;
  });

 

 

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.initChart();
  }

  loadUsers() {
    this.isLoading.set(true);
   return this.userService.loadUsers().subscribe({
      next: (data) => {
        this.users.set(data || []);
        this.isLoading.set(false);
        this.updateChart();
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.isLoading.set(false);
      }
    });
  }

  initChart(): void {
    if (!this.roleChartCanvas) return;
    const ctx = this.roleChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Admin', 'Manager', 'User'],
        datasets: [{
          data: [this.adminCount(), this.managerCount(), this.userCount()],
          backgroundColor: ['#ef4444', '#3b82f6', '#10b981'],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        cutout: '75%'
      }
    });
  }

  updateChart(): void {
    if (this.chart) {
      this.chart.data.datasets[0].data = [
        this.adminCount(),
        this.managerCount(),
        this.userCount()
      ];
      this.chart.update();
    }
  }

  openAddModal(): void {
    this.isEditMode.set(false);
    this.currentUserForm.set({ fullName: '', email: '', passwordHash: '', role: 'User' });
    this.isFormModalOpen.set(true);
  }

  openEditModal(user: UserModel): void {
    this.isEditMode.set(true);
    this.currentUserForm.set({
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      passwordHash: '',
      role: user.role
    });
    this.isFormModalOpen.set(true);
  }

  closeFormModal(): void { this.isFormModalOpen.set(false); }

  saveUser(): void {
    const formData = this.currentUserForm();

    if (this.isEditMode() && formData.userId) {
      this.userService.updateUser(formData.userId, formData).subscribe({
        next: () => { this.loadUsers(); this.closeFormModal(); },
        error: (err) => console.error('Error updating user:', err)
      });
    } else {
      this.userService.createUser(formData).subscribe({
        next: () => { this.loadUsers(); this.closeFormModal(); },
        error: (err) => console.error('Error creating user:', err)
      });
    }
  }

  openDeleteModal(user: UserModel): void {
    this.userToDelete.set(user);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.userToDelete.set(null);
  }

  confirmDelete(): void {
    const user = this.userToDelete();
    if (!user || !user.userId) return;

    this.userService.deleteUser(user.userId).subscribe({
      next: () => { this.loadUsers(); this.closeDeleteModal(); },
      error: (err) => console.error('Error deleting user:', err)
    });
  }




}