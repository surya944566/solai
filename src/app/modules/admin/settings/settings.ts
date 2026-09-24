import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../core/services/settings.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-settings',
  templateUrl: './settings.html',
  standalone: false,
  styleUrl: './settings.scss',
})
export class AdminSettingsComponent implements OnInit {
  settings: Record<string, unknown> = {};
  loading = true;
  saving = false;
  error = '';

  constructor(
    private settingsSvc: SettingsService,
    private toast: ToastService
  ) {}

  get grouped(): Array<{ group: string; label: string; entries: Array<{ rawKey: string; key: string; value: unknown }> }> {
    const groups = new Map<string, Array<{ rawKey: string; key: string; value: unknown }>>();
    Object.entries(this.settings).forEach(([rawKey, value]) => {
      const parts = rawKey.split('.');
      const key = parts.length > 1 ? parts.slice(1).join('.') : rawKey;
      const group = parts.length > 1 ? parts[0] : 'general';
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push({ rawKey, key, value });
    });
    return Array.from(groups.entries()).map(([group, entries]) => ({
      group,
      label: this.labelOf(group),
      entries,
    }));
  }

  setValue(rawKey: string, value: unknown) {
    const current = this.settings[rawKey];
    if (typeof current === 'number') {
      if (value === '' || value === null || value === undefined) return;
      const num = typeof value === 'number' ? value : Number(value);
      this.settings[rawKey] = Number.isNaN(num) ? current : num;
      return;
    }
    if (typeof current === 'boolean') {
      this.settings[rawKey] = value === true || value === 'true';
      return;
    }
    this.settings[rawKey] = value;
  }

  isLong(value: unknown): boolean {
    return String(value).length > 80;
  }

  labelOf(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.settingsSvc.getAll().subscribe({
      next: (res) => {
        this.settings = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load settings';
        this.loading = false;
      },
    });
  }

  save() {
    this.saving = true;
    this.settingsSvc.update(this.settings).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('Settings saved successfully');
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err?.error?.message || 'Failed to save settings');
      },
    });
  }
}