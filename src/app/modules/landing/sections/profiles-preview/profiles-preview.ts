import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../../../core/services/profile.service';
import { MatrimonialProfile } from '../../../../core/models/profile';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';

type TabKey = 'featured' | 'male' | 'female' | 'married';

@Component({
  selector: 'app-profiles-preview',
  templateUrl: './profiles-preview.html',
  standalone: false,
  styleUrl: './profiles-preview.scss',
})
export class ProfilesPreviewSection implements OnInit {
  tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'featured', label: 'Featured', icon: 'bi-star-fill' },
    { key: 'male', label: 'Male Profiles', icon: 'bi-gender-male' },
    { key: 'female', label: 'Female Profiles', icon: 'bi-gender-female' },
    { key: 'married', label: 'Married Profiles', icon: 'bi-heart-fill' },
  ];

  active: TabKey = 'featured';
  profiles: MatrimonialProfile[] = [];
  loading = true;
  error = '';

  constructor(
    private profileService: ProfileService,
    private toast: ToastService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.load();
  }

  selectTab(key: TabKey) {
    this.active = key;
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    const fn =
      this.active === 'featured'
        ? this.profileService.getFeatured()
        : this.active === 'male'
          ? this.profileService.getMale()
          : this.active === 'female'
            ? this.profileService.getFemale()
            : this.profileService.getMarried();

    fn.subscribe({
      next: (res) => {
        this.profiles = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load profiles';
        this.loading = false;
      },
    });
  }

  toggleSave(profile: MatrimonialProfile) {
    if (!this.auth.isAuthenticated) {
      this.toast.info('Please log in to save profiles');
      this.router.navigate(['/login']);
      return;
    }
    if (profile.saved) {
      this.profileService.unSaveProfile(profile._id).subscribe({
        next: () => {
          profile.saved = false;
          this.toast.success('Removed from saved profiles');
        },
        error: () => this.toast.error('Failed to remove profile'),
      });
    } else {
      this.profileService.saveProfile(profile._id).subscribe({
        next: () => {
          profile.saved = true;
          this.toast.success('Profile saved successfully');
        },
        error: () => this.toast.error('Failed to save profile'),
      });
    }
  }
}