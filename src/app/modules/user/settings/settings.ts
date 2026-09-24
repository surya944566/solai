import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService, AdminContact } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.html',
  standalone: false,
  styleUrl: './settings.scss',
})
export class SettingsComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  savingProfile = false;
  savingPassword = false;
  contact: AdminContact | null = null;
  private contactSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    private toast: ToastService
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      mobile: [''],
    });
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.matchPasswords }
    );
  }

  ngOnInit() {
    const user = this.auth.user;
    if (user) {
      this.profileForm.patchValue({ name: user.name || '', mobile: user.mobile || '' });
    }
    this.contactSub = this.auth.contact$.subscribe((c) => (this.contact = c));
  }

  ngOnDestroy() {
    this.contactSub?.unsubscribe();
  }

  private matchPasswords(g: FormGroup) {
    const pw = g.get('newPassword')?.value;
    const cf = g.get('confirmPassword')?.value;
    return pw === cf ? null : { mismatch: true };
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      this.toast.error('Please fix the highlighted fields');
      return;
    }
    this.savingProfile = true;
    this.auth
      .updateProfile({
        name: this.profileForm.value.name,
        mobile: this.profileForm.value.mobile,
      })
      .subscribe({
        next: () => {
          this.savingProfile = false;
          this.toast.success('Profile updated successfully');
        },
        error: (err) => {
          this.savingProfile = false;
          this.toast.error(err?.error?.message || 'Failed to update profile');
        },
      });
  }

  changePassword() {
    if (this.passwordForm.invalid) {
      if (this.passwordForm.errors?.['mismatch']) this.toast.error('Passwords do not match');
      else this.toast.error('Please fill in all password fields');
      return;
    }
    this.savingPassword = true;
    this.auth
      .changePassword({
        currentPassword: this.passwordForm.value.currentPassword,
        newPassword: this.passwordForm.value.newPassword,
      })
      .subscribe({
        next: (res) => {
          this.savingPassword = false;
          this.passwordForm.reset();
          this.toast.success(res.message || 'Password changed successfully');
        },
        error: (err) => {
          this.savingPassword = false;
          this.toast.error(err?.error?.message || 'Failed to change password');
        },
      });
  }
}