import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/models/user';

@Component({
  selector: 'app-admin-users',
  templateUrl: './users.html',
  standalone: false,
  styleUrl: './users.scss',
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  loading = true;
  error = '';
  page = 1;
  pages = 1;
  total = 0;
  keyword = '';
  statusFilter = '';
  showCreate = false;
  creating = false;
  createForm: FormGroup;

  constructor(
    private admin: AdminService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {
    this.createForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      emailOrMobile: ['', Validators.required],
      password: [''],
      status: ['active'],
    });
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.admin
      .getUsers({ page: this.page, keyword: this.keyword, status: this.statusFilter })
      .subscribe({
        next: (res) => {
          this.users = res.data;
          this.pages = res.pagination.pages;
          this.total = res.pagination.total;
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to load users';
          this.loading = false;
        },
      });
  }

  onSearch() {
    this.page = 1;
    this.load();
  }

  onPageChange(p: number) {
    this.page = p;
    this.load();
  }

  createUser() {
    if (this.createForm.invalid) {
      this.toast.error('Name and email/mobile are required');
      return;
    }
    this.creating = true;
    this.admin.createUser(this.createForm.value).subscribe({
      next: (res) => {
        this.creating = false;
        this.showCreate = false;
        this.createForm.reset({ status: 'active' });
        this.load();
        this.toast.success(
          res.generatedPassword
            ? `User created. Generated password: ${res.generatedPassword}`
            : 'User created successfully'
        );
      },
      error: (err) => {
        this.creating = false;
        this.toast.error(err?.error?.message || 'Failed to create user');
      },
    });
  }

  block(u: User) {
    this.admin.blockUser(u._id).subscribe({
      next: (res) => {
        Object.assign(u, res.data);
        this.toast.success('User blocked');
      },
      error: (err) => this.toast.error(err?.error?.message || 'Failed'),
    });
  }

  activate(u: User) {
    this.admin.activateUser(u._id).subscribe({
      next: (res) => {
        Object.assign(u, res.data);
        this.toast.success('User activated');
      },
      error: (err) => this.toast.error(err?.error?.message || 'Failed'),
    });
  }

  resetPassword(u: User) {
    const password = prompt('Enter a new password (leave empty to auto-generate):', '');
    if (password === null) return;
    this.admin.resetPassword(u._id, password || undefined).subscribe({
      next: (res) => {
        this.toast.success(res.newPassword ? `Password reset. New: ${res.newPassword}` : res.message);
      },
      error: (err) => this.toast.error(err?.error?.message || 'Failed'),
    });
  }

  remove(u: User) {
    if (!confirm(`Delete user "${u.name}"? This cannot be undone.`)) return;
    this.admin.deleteUser(u._id).subscribe({
      next: (res) => {
        this.users = this.users.filter((x) => x._id !== u._id);
        this.toast.success(res.message || 'User deleted');
      },
      error: (err) => this.toast.error(err?.error?.message || 'Failed'),
    });
  }
}