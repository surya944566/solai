import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../../../core/services/profile.service';
import { MatrimonialProfile } from '../../../../core/models/profile';

@Component({
  selector: 'app-showcase',
  templateUrl: './showcase.html',
  standalone: false,
  styleUrl: './showcase.scss',
})
export class ShowcaseSection implements OnInit {
  profile?: MatrimonialProfile;
  loading = true;
  error = '';

  constructor(private profileService: ProfileService) {}

  ngOnInit() {
    this.profileService.getFeatured().subscribe({
      next: (res) => {
        this.profile = res.data[0];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load featured profile';
        this.loading = false;
      },
    });
  }
}