import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../services/user';

export interface UserModel {
  userId?: number;
  fullName: string;
  email: string;
  passwordHash?: string;
  role: 'Admin' | 'Manager' | 'User';
  createdAt?: string;
}

type Role = UserModel['role'];

@Component({
  selector: 'app-user-managemente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-managemente.html',
  styleUrl: './user-managemente.css',
})
export class UserManagemente implements OnInit {

  private userService = inject(User);

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
  formError = signal<string | null>(null);
  deleteError = signal<string | null>(null);

  // What each role can do in the app today
  readonly roleKey: { role: Role; description: string }[] = [
    { role: 'Admin', description: 'Everything, including deleting contracts, clearing the audit log and managing users.' },
    { role: 'Manager', description: 'Uploads contracts and asks the AI, and can export and print the audit log.' },
    { role: 'User', description: 'Uploads contracts, reads reports and asks the AI assistant.' },
  ];

  private counts = computed(() => {
    const counts: Record<Role, number> = { Admin: 0, Manager: 0, User: 0 };
    for (const u of this.users()) {
      if (u.role in counts) counts[u.role]++;
    }
    return counts;
  });

  countFor(role: Role): number {
    return this.counts()[role];
  }

  summaryLine = computed(() => {
    const total = this.users().length;
    if (this.isLoading() && total === 0) return 'People who can sign in to ContractMind.';
    if (total === 0) return 'Nobody has access yet.';
    const admins = this.counts().Admin;
    const people = `${total} ${total === 1 ? 'person has' : 'people have'} access.`;
    return `${people} ${admins} ${admins === 1 ? 'is an admin' : 'are admins'}.`;
  });

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

  initialsOf(name: string): string {
    return (name || '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join('') || '?';
  }

  clearFilters() {
    this.searchTerm.set('');
    this.selectedRoleFilter.set('ALL');
  }

  loadUsers() {
    this.clearFilters();
    this.isLoading.set(true);
    return this.userService.loadUsers().subscribe({
      next: (data) => {
        this.users.set(data || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.isLoading.set(false);
      }
    });
  }

  openAddModal(): void {
    this.formError.set(null);
    this.isEditMode.set(false);
    this.currentUserForm.set({ fullName: '', email: '', passwordHash: '', role: 'User' });
    this.isFormModalOpen.set(true);
  }

  openEditModal(user: UserModel): void {
    this.formError.set(null);
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
    this.formError.set(null);

    if (!formData.fullName || formData.fullName.trim() === '') {
      this.formError.set('Enter the full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      this.formError.set('Enter a valid email address, like name@company.com.');
      return;
    }

    if (!this.isEditMode() && (!formData.passwordHash || formData.passwordHash.trim() === '')) {
      this.formError.set('Enter a password for the new user.');
      return;
    }

    if (formData.passwordHash && formData.passwordHash.trim() !== '' && formData.passwordHash.length < 8) {
      this.formError.set('The password needs at least 8 characters.');
      return;
    }

    if (this.isEditMode() && formData.userId) {
      this.userService.updateUser(formData.userId, formData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeFormModal();
        },
        error: (err) => {
          console.error('Error updating user:', err);
          this.formError.set(err.error?.message || "Couldn't save the changes. Try again.");
        }
      });
    } else {
      this.userService.createUser(formData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeFormModal();
        },
        error: (err) => {
          console.error('Error creating user:', err);
          this.formError.set(err.error?.message || "Couldn't add the user. Try again.");
        }
      });
    }
  }

  openDeleteModal(user: UserModel): void {
    this.deleteError.set(null);
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
      error: (err) => {
        console.error('Error deleting user:', err);
        this.deleteError.set(err.error?.message || "Couldn't remove the user. Try again.");
      }
    });
  }
}
