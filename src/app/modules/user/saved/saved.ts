import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from '../../../core/services/profile.service';
import { ToastService } from '../../../core/services/toast.service';
import { MatrimonialProfile } from '../../../core/models/profile';

@Component({
  selector: 'app-saved-profiles',
  templateUrl: './saved.html',
  standalone: false,
  styleUrl: './saved.scss',
})
export class SavedProfilesComponent implements OnInit {
  profiles: MatrimonialProfile[] = [];
  loading = true;
  error = '';

  constructor(
    private profileSvc: ProfileService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.load();
  }

  goBrowse() {
    this.router.navigate(['/browse']);
  }

  load() {
    this.loading = true;
    this.error = '';
    this.profileSvc.getSavedProfiles().subscribe({
      next: (res) => {
        this.profiles = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load saved profiles';
        this.loading = false;
      },
    });
  }

  remove(profile: MatrimonialProfile) {
    this.profileSvc.unSaveProfile(profile._id).subscribe({
      next: () => {
        this.profiles = this.profiles.filter((p) => p._id !== profile._id);
        this.toast.success('Removed from saved');
      },
      error: () => this.toast.error('Failed to remove'),
    });
  }
}