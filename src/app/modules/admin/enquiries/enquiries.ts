import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { Enquiry } from '../../../core/models/models';

@Component({
  selector: 'app-admin-enquiries',
  templateUrl: './enquiries.html',
  standalone: false,
  styleUrl: './enquiries.scss',
})
export class AdminEnquiriesComponent implements OnInit {
  enquiries: Enquiry[] = [];
  loading = true;
  error = '';
  page = 1;
  pages = 1;
  total = 0;
  statusFilter = '';
  openDetail: string | null = null;
  replyForm: FormGroup;

  constructor(
    private admin: AdminService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {
    this.replyForm = this.fb.group({
      status: ['pending'],
      adminReply: [''],
      internalNotes: [''],
    });
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.admin.getEnquiries({ page: this.page, status: this.statusFilter }).subscribe({
      next: (res) => {
        this.enquiries = res.data;
        this.pages = res.pagination.pages;
        this.total = res.pagination.total;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load enquiries';
        this.loading = false;
      },
    });
  }

  onPageChange(p: number) {
    this.page = p;
    this.load();
  }

  onStatusChange() {
    this.page = 1;
    this.load();
  }

  openEnquiry(enq: Enquiry) {
    if (this.openDetail === enq._id) {
      this.openDetail = null;
      return;
    }
    this.openDetail = enq._id;
    this.replyForm.patchValue({
      status: enq.status,
      adminReply: enq.adminReply || '',
      internalNotes: enq.internalNotes || '',
    });
  }

  saveReply(enq: Enquiry) {
    const payload = {
      status: this.replyForm.value.status,
      adminReply: this.replyForm.value.adminReply || undefined,
      internalNotes: this.replyForm.value.internalNotes || undefined,
    };
    this.admin.updateEnquiry(enq._id, payload).subscribe({
      next: (res) => {
        Object.assign(enq, res.data);
        this.toast.success('Enquiry updated');
        if (payload.status !== 'pending') this.load();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Failed to update enquiry'),
    });
  }

  remove(enq: Enquiry) {
    if (!confirm(`Delete this enquiry?`)) return;
    this.admin.deleteEnquiry(enq._id).subscribe({
      next: (res) => {
        this.enquiries = this.enquiries.filter((x) => x._id !== enq._id);
        this.toast.success(res.message || 'Enquiry deleted');
      },
      error: (err) => this.toast.error(err?.error?.message || 'Failed'),
    });
  }

  userName(enq: Enquiry): string {
    const u = enq.user;
    return typeof u === 'object' && u?.name ? u.name : 'User';
  }

  userContact(enq: Enquiry): string {
    const u = enq.user;
    if (typeof u === 'object') {
      if (u.email) return u.email;
      if (u.mobile) return u.mobile;
    }
    return '—';
  }

  profileName(enq: Enquiry): string {
    const p = enq.profile;
    return typeof p === 'object' && p?.name ? p.name : 'Unknown Profile';
  }

  profileId(enq: Enquiry): string {
    const p = enq.profile;
    return typeof p === 'object' && (p as { profileId?: string }).profileId ? (p as { profileId: string }).profileId : '';
  }

  label(s: string): string {
    return s.replace(/_/g, ' ').toUpperCase();
  }
}