import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { EnquiryService } from '../../../core/services/enquiry.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MatrimonialProfile } from '../../../core/models/profile';
import { Enquiry, Notification } from '../../../core/models/models';

@Component({
  selector: 'app-dashboard-overview',
  templateUrl: './overview.html',
  standalone: false,
  styleUrl: './overview.scss',
})
export class OverviewComponent implements OnInit {
  user: { name: string; email?: string; mobile?: string } | null = null;
  saved: MatrimonialProfile[] = [];
  savedCount = 0;
  enquiries: Enquiry[] = [];
  enquiryCount = 0;
  notifications: Notification[] = [];
  unreadCount = 0;
  latestProfiles: MatrimonialProfile[] = [];
  loading = true;

  constructor(
    private auth: AuthService,
    private profileSvc: ProfileService,
    private enquirySvc: EnquiryService,
    private notifSvc: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.auth.user;
    this.loadAll();
  }

  private loadAll() {
    this.loading = true;
    this.profileSvc.getSavedProfiles().subscribe({
      next: (res) => {
        this.saved = res.data;
        this.savedCount = res.data.length;
      },
      error: () => {},
    });
    this.enquirySvc.getMy().subscribe({
      next: (res) => {
        this.enquiryCount = res.data.length;
        this.enquiries = res.data.slice(0, 5);
      },
      error: () => {},
    });
    this.notifSvc.get(1).subscribe({
      next: (res) => {
        this.unreadCount = res.unread;
        this.notifications = res.data.slice(0, 5);
      },
      error: () => {},
    });
    this.profileSvc.getLatest().subscribe({
      next: (res) => (this.latestProfiles = res.data.slice(0, 4)),
      error: () => {},
    });
    this.loading = false;
  }

  go(path: string) {
    this.router.navigate([path]);
  }

  statusLabel(s: string): string {
    return s.replace('_', ' ').toUpperCase();
  }

  unreadOf(n: Notification): string {
    return n.read ? 'text-muted' : 'fw-bold';
  }
}