import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { SocketService } from '../../../core/services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.html',
  standalone: false,
  styleUrl: './admin-layout.scss',
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  adminName = '';
  currentTitle = 'Dashboard';
  mobileOpen = false;
  unreadChats = 0;

  private timer?: ReturnType<typeof setInterval>;
  private routerSub?: Subscription;
  private onNewConversation = () => {
    this.unreadChats += 1;
    this.toast.info('New support conversation started');
  };
  private onNewMessage = () => {
    this.unreadChats += 1;
  };

  constructor(
    private auth: AuthService,
    public router: Router,
    private socket: SocketService,
    private toast: ToastService
  ) {}

  get menu() {
    return [
      { path: '/admin/dashboard', icon: 'bi-grid', label: 'Dashboard' },
      { path: '/admin/users', icon: 'bi-people', label: 'Users' },
      { path: '/admin/profiles', icon: 'bi-person-badge', label: 'Profiles' },
      { path: '/admin/enquiries', icon: 'bi-chat-heart', label: 'Enquiries' },
      { path: '/admin/support', icon: 'bi-headset', label: 'Support', badge: this.unreadChats },
      { path: '/admin/reports', icon: 'bi-file-earmark-bar-graph', label: 'Reports' },
      { path: '/admin/settings', icon: 'bi-gear', label: 'Settings' },
    ];
  }

  ngOnInit() {
    const admin = this.auth.admin;
    this.adminName = admin?.name || admin?.email || 'Admin';

    this.routerSub = this.router.events.subscribe(() => {
      const path = this.router.url;
      if (path.endsWith('/users')) this.currentTitle = 'User Management';
      else if (path.endsWith('/profiles')) this.currentTitle = 'Profile Management';
      else if (path.endsWith('/enquiries')) this.currentTitle = 'Enquiries';
      else if (path.endsWith('/support')) this.currentTitle = 'Support Chat';
      else if (path.endsWith('/reports')) this.currentTitle = 'Reports & Export';
      else if (path.endsWith('/settings')) this.currentTitle = 'Settings';
      else this.currentTitle = 'Dashboard';
    });

    this.socket.connectAdmin();
    this.socket.on('support:new_conversation', this.onNewConversation);
    this.socket.on('support:new_message', this.onNewMessage);
  }

  logout() {
    this.auth.adminLogout();
    this.toast.success('Logged out');
    this.router.navigate(['/admin/login']);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
    this.routerSub?.unsubscribe();
    this.socket.off('support:new_conversation', this.onNewConversation);
    this.socket.off('support:new_message', this.onNewMessage);
    this.socket.disconnect();
  }
}