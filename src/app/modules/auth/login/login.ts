import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  standalone: false,
  styleUrl: './login.scss',
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  showPassword = false;
  siteName = 'Solai Matrimony';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toast: ToastService,
    private router: Router,
    private settings: SettingsService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      emailOrMobile: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });

    if (this.auth.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    }

    this.settings.getPublic().subscribe({
      next: (res) => (this.siteName = (res.data['site_name'] as string) || this.siteName),
      error: () => {},
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.auth.login(this.form.value).subscribe({
      next: () => {
        this.toast.success('Welcome back!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err?.error?.message || 'Login failed. Please try again.');
      },
    });
  }
}