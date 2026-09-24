import { Component, OnDestroy, OnInit } from '@angular/core';
import { SettingsService } from '../../../../core/services/settings.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.html',
  standalone: false,
  styleUrl: './stats.scss',
})
export class StatsSection implements OnInit, OnDestroy {
  stats = [
    { label: 'Trusted Profiles', value: 2500, icon: 'bi-person-check' },
    { label: 'Active Members', value: 1200, icon: 'bi-people' },
    { label: 'Successful Connections', value: 950, icon: 'bi-heart-fill' },
    { label: 'Years of Service', value: 15, icon: 'bi-trophy' },
  ];

  displayed = [0, 0, 0, 0];
  private observer?: IntersectionObserver;
  private animated = false;
  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor(private settingsService: SettingsService) {}

  ngOnInit() {
    this.settingsService.getPublic().subscribe({
      next: (res) => {
        const s = res.data as Record<string, number>;
        this.stats[0].value = s['trusted_profiles'] || this.stats[0].value;
        this.stats[1].value = s['active_members'] || this.stats[1].value;
        this.stats[2].value = s['successful_connections'] || this.stats[2].value;
        this.stats[3].value = s['years_of_service'] || this.stats[3].value;
      },
      error: () => {},
    });
  }

  ngAfterViewInit() {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.animated) {
          this.animated = true;
          this.animateCounters();
        }
      },
      { threshold: 0.3 }
    );
    const el = document.getElementById('stats-section');
    if (el) this.observer.observe(el);
  }

  private animateCounters() {
    this.stats.forEach((stat, i) => {
      const duration = 1600;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        this.displayed[i] = Math.round(eased * stat.value);
        if (p < 1) {
          this.timers.push(setTimeout(() => tick(performance.now()), 16));
        }
      };
      tick(start);
    });
  }

  ngOnDestroy() {
    this.observer?.disconnect();
    this.timers.forEach((t) => clearTimeout(t));
  }
}