import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.html',
  standalone: false,
  styleUrl: './admin-login.scss',
})
export class AdminLoginComponent {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toast: ToastService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  login() {
    if (this.form.invalid) {
      this.toast.error('Please enter email and password');
      return;
    }
    this.loading = true;
    this.auth.adminLogin(this.form.value).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('Welcome back, Admin!');
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err?.error?.message || 'Login failed. Check your credentials.');
      },
    });
  }
}