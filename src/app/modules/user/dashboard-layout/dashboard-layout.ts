import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ToastService } from '../../../core/services/toast.service';
import { SocketService } from '../../../core/services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.html',
  standalone: false,
  styleUrl: './dashboard-layout.scss',
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  unread = 0;
  userInitials = 'U';
  userName = '';
  mobileOpen = false;
  currentTitle = 'Dashboard';

  private sub?: Subscription;
  private timeouts: ReturnType<typeof setTimeout>[] = [];
  private onNotification = () => this.refreshUnread();
  private onSupportMessage = () => this.refreshUnread();

  constructor(
    private auth: AuthService,
    public router: Router,
    private notifications: NotificationService,
    private socket: SocketService,
    private toast: ToastService
  ) {
    this.sub = this.router.events.subscribe(() => {
      const path = this.router.url;
      if (path.endsWith('/saved')) this.currentTitle = 'Saved Profiles';
      else if (path.endsWith('/enquiries')) this.currentTitle = 'My Enquiries';
      else if (path.endsWith('/notifications')) this.currentTitle = 'Notifications';
      else if (path.endsWith('/support')) this.currentTitle = 'Support Chat';
      else if (path.endsWith('/settings')) this.currentTitle = 'Settings';
      else this.currentTitle = 'Dashboard';
    });
  }

  get menuItems() {
    return [
      { path: '/dashboard', icon: 'bi-grid', label: 'Overview', end: true },
      { path: '/dashboard/saved', icon: 'bi-heart', label: 'Saved Profiles' },
      { path: '/dashboard/enquiries', icon: 'bi-chat-heart', label: 'My Enquiries' },
      { path: '/dashboard/notifications', icon: 'bi-bell', label: 'Notifications', badge: this.unread },
      { path: '/dashboard/support', icon: 'bi-headset', label: 'Support Chat' },
      { path: '/dashboard/settings', icon: 'bi-gear', label: 'Settings' },
    ];
  }

  ngOnInit() {
    const user = this.auth.user;
    if (user) {
      this.userName = user.name || '';
      this.userInitials = user.name
        .split(' ')
        .map((x) => x[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'U';
    }
    this.refreshUnread();
    this.scheduleUnread();
    this.socket.connectUser();
    this.socket.on('notification', this.onNotification);
    this.socket.on('support:new_message', this.onSupportMessage);
  }

  refreshUnread() {
    this.notifications.getUnreadCount().subscribe({
      next: (res) => (this.unread = res.count),
      error: () => {},
    });
  }

  private scheduleUnread() {
    this.timeouts.push(
      setInterval(() => this.refreshUnread(), 60000)
    );
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.timeouts.forEach((t) => clearInterval(t));
    this.socket.off('notification', this.onNotification);
    this.socket.off('support:new_message', this.onSupportMessage);
    this.socket.disconnect();
  }

  logout() {
    this.auth.logout();
    this.toast.success('Logged out successfully');
    this.router.navigate(['/']);
  }
}