import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';

interface Activity {
  action: string;
  module: string;
  description: string;
  createdAt: string;
  admin?: string | { name?: string; email?: string };
}

@Component({
  selector: 'app-admin-reports',
  templateUrl: './reports.html',
  standalone: false,
  styleUrl: './reports.scss',
})
export class AdminReportsComponent implements OnInit {
  reports = [
    { key: 'users', label: 'Users', icon: 'bi-people', desc: 'All registered users with contact and status' },
    { key: 'profiles', label: 'Profiles', icon: 'bi-person-badge', desc: 'All matrimonial profiles with category and status' },
    { key: 'enquiries', label: 'Enquiries', icon: 'bi-chat-heart', desc: 'All member enquiries with current status' },
    { key: 'activity', label: 'Activity Log', icon: 'bi-activity', desc: 'Recent admin activity events' },
  ];
  downloading = '';
  activity: Activity[] = [];
  activityLoading = false;
  activityError = '';

  constructor(
    private admin: AdminService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadActivity();
  }

  download(key: string) {
    this.downloading = key;
    this.admin.downloadReport(key).subscribe({
      next: (blob) => {
        this.downloading = '';
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `solai-${key}-report.csv`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        a.remove();
        this.toast.success('Report downloaded');
      },
      error: (err) => {
        this.downloading = '';
        this.toast.error(err?.error?.message || 'Download failed');
      },
    });
  }

  loadActivity() {
    this.activityLoading = true;
    this.activityError = '';
    this.admin.getActivity().subscribe({
      next: (res) => {
        this.activity = res.data;
        this.activityLoading = false;
      },
      error: (err) => {
        this.activityError = err?.error?.message || 'Failed to load activity';
        this.activityLoading = false;
      },
    });
  }

  adminName(a: Activity): string {
    if (!a.admin) return 'System';
    if (typeof a.admin === 'string') return a.admin;
    return a.admin.name || a.admin.email || 'System';
  }
}