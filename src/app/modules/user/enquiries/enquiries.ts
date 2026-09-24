import { Component, OnInit } from '@angular/core';
import { EnquiryService } from '../../../core/services/enquiry.service';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';
import { Enquiry } from '../../../core/models/models';

@Component({
  selector: 'app-my-enquiries',
  templateUrl: './enquiries.html',
  standalone: false,
  styleUrl: './enquiries.scss',
})
export class MyEnquiriesComponent implements OnInit {
  enquiries: Enquiry[] = [];
  loading = true;
  error = '';
  openDetail: string | null = null;

  constructor(
    private enquirySvc: EnquiryService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.enquirySvc.getMy().subscribe({
      next: (res) => {
        this.enquiries = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load enquiries';
        this.loading = false;
      },
    });
  }

  goBrowse() {
    this.router.navigate(['/browse']);
  }

  cancel(id: string) {
    this.enquirySvc.cancel(id).subscribe({
      next: () => {
        const enq = this.enquiries.find((e) => e._id === id);
        if (enq) enq.status = 'cancelled';
        this.toast.success('Enquiry cancelled');
      },
      error: (err) => this.toast.error(err?.error?.message || 'Could not cancel'),
    });
  }

  canCancel(enq: Enquiry): boolean {
    return ['pending', 'contacted', 'in_progress'].includes(enq.status);
  }

  profileName(enq: Enquiry): string {
    const p = enq.profile;
    if (typeof p === 'object' && p && p.name) return p.name;
    return 'Profile';
  }

  profileId(enq: Enquiry): string {
    const p = enq.profile;
    if (typeof p === 'object' && p && (p as { profileId?: string }).profileId) return (p as { profileId: string }).profileId;
    return '';
  }

  profilePhoto(enq: Enquiry): string {
    const p = enq.profile;
    if (typeof p === 'object' && p && p.profilePhoto) return p.profilePhoto;
    return '';
  }

  gender(enq: Enquiry): string {
    const p = enq.profile;
    return typeof p === 'object' && p?.gender ? p.gender : '';
  }

  education(enq: Enquiry): string {
    const p = enq.profile;
    return typeof p === 'object' && p?.education ? p.education : '';
  }

  linkId(enq: Enquiry): string {
    const p = enq.profile;
    return typeof p === 'object' && p?._id ? p._id : '';
  }

  statusLabel(s: string): string {
    return s.replace('_', ' ').toUpperCase();
  }

  toggleDetail(id: string) {
    this.openDetail = this.openDetail === id ? null : id;
  }
}