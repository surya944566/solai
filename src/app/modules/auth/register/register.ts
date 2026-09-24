import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, AdminContact } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  standalone: false,
  styleUrl: './register.scss',
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  accepted = false;
  adminContact: AdminContact = {
    officeName: 'Solai Matrimony Office',
    officePhone: '+91 00000 00000',
    officeAddress: '123, Marriage Street, Chennai, Tamil Nadu',
  };

  validationMessages = {
    name: 'Full name is required',
    emailOrMobile: 'Email or mobile number is required',
    password: 'Password must be at least 6 characters',
    confirmPassword: 'Passwords do not match',
    terms: 'You must accept the terms and conditions',
  };

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group(
      {
        name: ['', Validators.required],
        emailOrMobile: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
        terms: [false, Validators.requiredTrue],
      },
      { validators: this.matchPasswords }
    );

    if (this.auth.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    }

    this.auth.getAdminContact().subscribe({
      next: (res) => (this.adminContact = res.adminContact),
      error: () => {},
    });
  }

  matchPasswords(group: FormGroup) {
    const pw = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pw === confirm ? null : { mismatch: true };
  }

  get workerFields() {
    return ['emailOrMobile', 'password', 'confirmPassword'];
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.form.errors) {
      this.toast.warning('Please fill in all required fields correctly');
      return;
    }

    this.loading = true;
    this.auth
      .register({
        name: this.form.value.name,
        emailOrMobile: this.form.value.emailOrMobile,
        password: this.form.value.password,
        confirmPassword: this.form.value.confirmPassword,
      })
      .subscribe({
        next: () => {
          this.toast.success('Account created! Welcome to Solai Matrimony.');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading = false;
          this.toast.error(err?.error?.message || 'Registration failed. Please try again.');
        },
      });
  }
}