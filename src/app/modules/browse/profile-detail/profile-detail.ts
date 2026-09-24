import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, of, Subscription } from 'rxjs';
import { ProfileService } from '../../../core/services/profile.service';
import { MatrimonialProfile } from '../../../core/models/profile';
import { EnquiryService } from '../../../core/services/enquiry.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-profile-detail',
  templateUrl: './profile-detail.html',
  standalone: false,
  styleUrl: './profile-detail.scss',
})
export class ProfileDetailComponent implements OnInit, OnDestroy {
  profile?: MatrimonialProfile;
  loading = true;
  error = '';
  activePhoto = '';
  enquiryOpen = false;
  enquiryMessage = '';
  enquirySending = false;
  reportOpen = false;
  reportNote = '';
  reportSending = false;

  private sub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private profileService: ProfileService,
    private enquiryService: EnquiryService,
    private auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.sub = this.route.params
      .pipe(
        switchMap((params) => {
          this.loading = true;
          this.error = '';
          return this.profileService.getById(params['id']);
        })
      )
      .subscribe({
        next: (res) => {
          this.profile = res.data;
          this.activePhoto = res.data.photos?.find((p) => p.isPrimary)?.url || res.data.profilePhoto || '';
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.error?.message || 'Profile not found';
          this.loading = false;
        },
      });
  }

  get initials(): string {
    if (!this.profile) return 'S';
    return this.profile.name
      .split(' ')
      .map((x) => x[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  toggleSave() {
    if (!this.auth.isAuthenticated) {
      this.toast.info('Please log in to save profiles');
      this.router.navigate(['/login']);
      return;
    }
    if (!this.profile) return;
    if (this.profile.saved) {
      this.profileService.unSaveProfile(this.profile._id).subscribe({
        next: () => {
          this.profile!.saved = false;
          this.toast.success('Removed from saved profiles');
        },
        error: () => this.toast.error('Failed to update'),
      });
    } else {
      this.profileService.saveProfile(this.profile._id).subscribe({
        next: () => {
          this.profile!.saved = true;
          this.toast.success('Profile saved successfully');
        },
        error: () => this.toast.error('Failed to update'),
      });
    }
  }

  sendEnquiry() {
    if (!this.auth.isAuthenticated) {
      this.toast.info('Please log in to send an enquiry');
      this.router.navigate(['/login']);
      return;
    }
    if (!this.profile) return;
    this.enquirySending = true;
    this.enquiryService.create({ profile: this.profile._id, message: this.enquiryMessage }).subscribe({
      next: () => {
        this.enquirySending = false;
        this.enquiryOpen = false;
        this.enquiryMessage = '';
        this.toast.success('Enquiry sent! Our team will review it shortly.');
      },
      error: (err) => {
        this.enquirySending = false;
        this.toast.error(err?.error?.message || 'Unable to send enquiry');
      },
    });
  }

  sendReport() {
    if (!this.auth.isAuthenticated) {
      this.toast.info('Please log in to report a profile');
      this.router.navigate(['/login']);
      return;
    }
    if (!this.profile) return;
    this.reportSending = true;
    this.profileService.reportProfile(this.profile._id, this.reportNote).subscribe({
      next: (res) => {
        this.reportSending = false;
        this.reportOpen = false;
        this.reportNote = '';
        this.toast.success(res.message || 'Report submitted');
      },
      error: (err) => {
        this.reportSending = false;
        this.toast.error(err?.error?.message || 'Unable to submit report');
      },
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}