import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { MatrimonialProfile } from '../../../core/models/profile';

@Component({
  selector: 'app-admin-profiles',
  templateUrl: './profiles.html',
  standalone: false,
  styleUrl: './profiles.scss',
})
export class AdminProfilesComponent implements OnInit {
  profiles: MatrimonialProfile[] = [];
  loading = true;
  error = '';
  page = 1;
  pages = 1;
  total = 0;
  keyword = '';
  statusFilter = '';
  editing: MatrimonialProfile | null = null;
  showForm = false;
  saving = false;
  form: FormGroup;
  photoFile?: File;
  photoPreview = '';

  constructor(
    private admin: AdminService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      name: [''],
      gender: ['male'],
      dateOfBirth: [''],
      maritalStatus: ['single'],
      height: [''],
      education: [''],
      occupation: [''],
      salary: [''],
      location: [''],
      district: [''],
      state: [''],
      religion: [''],
      community: [''],
      familyDetails: [''],
      about: [''],
      partnerExpectations: [''],
      contactVisibility: ['admin_only'],
      phone: [''],
      email: [''],
      status: ['published'],
    });
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.admin
      .getProfiles({ page: this.page, keyword: this.keyword, status: this.statusFilter })
      .subscribe({
        next: (res) => {
          this.profiles = res.data;
          this.pages = res.pagination.pages;
          this.total = res.pagination.total;
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to load profiles';
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

  openNew() {
    this.editing = null;
    this.form.reset({ gender: 'male', maritalStatus: 'single', contactVisibility: 'admin_only', status: 'published' });
    this.photoFile = undefined;
    this.photoPreview = '';
    this.showForm = true;
  }

  openEdit(p: MatrimonialProfile) {
    this.editing = p;
    this.form.patchValue({
      name: p.name,
      gender: p.gender,
      dateOfBirth: p.dateOfBirth || '',
      maritalStatus: p.maritalStatus,
      height: p.height || '',
      education: p.education || '',
      occupation: p.occupation || '',
      salary: p.salary || '',
      location: p.location || '',
      district: p.district || '',
      state: p.state || '',
      religion: p.religion || '',
      community: p.community || '',
      familyDetails: p.familyDetails || '',
      about: p.about || '',
      partnerExpectations: p.partnerExpectations || '',
      contactVisibility: p.contactVisibility,
      phone: p.phone || '',
      email: p.email || '',
      status: p.status === 'featured' ? 'published' : p.status,
    });
    this.photoFile = undefined;
    this.photoPreview = p.profilePhoto || p.photos?.find((ph) => ph.isPrimary)?.url || '';
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onPhotoSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.photoFile = file;
    const reader = new FileReader();
    reader.onload = () => (this.photoPreview = String(reader.result));
    reader.readAsDataURL(file);
  }

  saveProfile() {
    const payload = new FormData();
    const value = this.form.value;
    Object.keys(value).forEach((key) => {
      if (value[key] !== undefined && value[key] !== null && value[key] !== '') payload.append(key, value[key]);
    });
    if (this.photoFile) payload.append('photos', this.photoFile);

    this.saving = true;
    const obs = this.editing
      ? this.admin.updateProfile(this.editing._id, payload)
      : this.admin.createProfile(payload);
    obs.subscribe({
      next: () => {
        this.saving = false;
        this.showForm = false;
        this.load();
        this.toast.success(this.editing ? 'Profile updated' : 'Profile created');
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err?.error?.message || 'Failed to save profile');
      },
    });
  }

  togglePublish(p: MatrimonialProfile) {
    this.admin.togglePublish(p._id).subscribe({
      next: (res) => {
        Object.assign(p, res.data);
        this.toast.success(res.data.status === 'published' ? 'Profile published' : 'Profile unpublished');
      },
      error: (err) => this.toast.error(err?.error?.message || 'Failed'),
    });
  }

  toggleFeature(p: MatrimonialProfile) {
    this.admin.toggleFeature(p._id).subscribe({
      next: (res) => {
        Object.assign(p, res.data);
        this.toast.success(p.isFeatured ? 'Profile marked as featured' : 'Feature removed');
      },
      error: (err) => this.toast.error(err?.error?.message || 'Failed'),
    });
  }

  block(p: MatrimonialProfile) {
    if (!confirm(`Block profile "${p.name}"?`)) return;
    this.admin.blockProfile(p._id).subscribe({
      next: (res) => {
        Object.assign(p, res.data);
        this.toast.success('Profile blocked');
      },
      error: (err) => this.toast.error(err?.error?.message || 'Failed'),
    });
  }

  remove(p: MatrimonialProfile) {
    if (!confirm(`Delete profile "${p.name}" permanently?`)) return;
    this.admin.deleteProfile(p._id).subscribe({
      next: (res) => {
        this.profiles = this.profiles.filter((x) => x._id !== p._id);
        this.toast.success(res.message || 'Profile deleted');
      },
      error: (err) => this.toast.error(err?.error?.message || 'Failed'),
    });
  }
}