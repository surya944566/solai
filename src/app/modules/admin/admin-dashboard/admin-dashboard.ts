import { Component, OnInit } from '@angular/core';
import { AdminService, AdminDashboard } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.html',
  standalone: false,
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboardComponent implements OnInit {
  data: AdminDashboard | null = null;
  loading = true;
  error = '';

  constructor(private admin: AdminService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.admin.getDashboard().subscribe({
      next: (res) => {
        this.data = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load dashboard';
        this.loading = false;
      },
    });
  }

  percent(count: number, total: number): number {
    return total ? Math.round((count / total) * 100) : 0;
  }

  maxMonthly(): number {
    if (!this.data?.charts.monthlyRegistrations.length) return 1;
    return Math.max(...this.data.charts.monthlyRegistrations.map((m) => m.count), 1);
  }

  nameOf(v: Record<string, unknown>): string {
    const n = v['name'] || v['profileId'];
    return typeof n === 'string' ? n : '—';
  }

  statusOf(v: unknown): string {
    return String(v);
  }

  labelOf(key: string): string {
    return key.replace(/_/g, ' ').toUpperCase();
  }
}