import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';
import { Notification } from '../../../core/models/models';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.html',
  standalone: false,
  styleUrl: './notifications.scss',
})
export class NotificationsComponent implements OnInit {
  items: Notification[] = [];
  loading = true;
  error = '';
  unread = 0;
  page = 1;
  pages = 1;
  total = 0;

  constructor(
    private notifSvc: NotificationService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.notifSvc.get(this.page).subscribe({
      next: (res) => {
        this.items = res.data;
        this.unread = res.unread;
        const p = res.pagination as { page: number; pages: number; total: number };
        if (p) {
          this.page = p.page;
          this.pages = p.pages;
          this.total = p.total;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load notifications';
        this.loading = false;
      },
    });
  }

  onPageChange(p: number) {
    if (p < 1 || p > this.pages || p === this.page) return;
    this.page = p;
    this.load();
  }

  pageNumbers(): number[] {
    return Array.from({ length: this.pages }, (_v, i) => i + 1);
  }

  open(n: Notification) {
    if (!n.read) {
      this.notifSvc.markRead(n._id).subscribe({
        next: () => {
          n.read = true;
          this.unread = Math.max(0, this.unread - 1);
        },
        error: () => {},
      });
    }
    if (n.link) this.router.navigateByUrl(n.link);
  }

  markAll() {
    this.notifSvc.markAllRead().subscribe({
      next: () => {
        this.items.forEach((n) => (n.read = true));
        this.unread = 0;
        this.toast.success('All notifications marked as read');
      },
      error: () => this.toast.error('Failed to update'),
    });
  }

  iconFor(type: string): string {
    switch (type) {
      case 'enquiry':
        return 'bi-chat-heart';
      case 'support':
        return 'bi-headset';
      case 'profile':
        return 'bi-person-badge';
      default:
        return 'bi-bell';
    }
  }

  timeAgo(d?: Date): string {
    if (!d) return '';
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(d).toLocaleDateString();
  }
}