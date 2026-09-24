import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SettingsService } from '../../../../core/services/settings.service';
import { SiteSettings } from '../../../../core/models/models';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.html',
  standalone: false,
  styleUrl: './hero.scss',
})
export class HeroSection implements OnInit {
  settings: SiteSettings = {};
  title = 'Find Your Perfect Life Partner';
  subtitle = 'Discover meaningful connections with trusted matrimonial profiles.';
  primaryBtn = 'Browse Profiles';
  secondaryBtn = 'Get Started';

  constructor(private settingsService: SettingsService) {}

  ngOnInit() {
    this.settingsService.getPublic().subscribe({
      next: (res) => {
        this.settings = res.data;
        this.title = (res.data['hero_title'] as string) || this.title;
        this.subtitle = (res.data['hero_subtitle'] as string) || this.subtitle;
        this.primaryBtn = (res.data['hero_primary_button'] as string) || this.primaryBtn;
        this.secondaryBtn = (res.data['hero_secondary_button'] as string) || this.secondaryBtn;
      },
      error: () => {},
    });
  }
}