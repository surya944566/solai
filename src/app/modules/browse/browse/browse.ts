import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { ProfileService } from '../../../core/services/profile.service';
import { MatrimonialProfile, ProfileQuery } from '../../../core/models/profile';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.html',
  standalone: false,
  styleUrl: './browse.scss',
})
export class BrowseComponent implements OnInit {
  profiles: MatrimonialProfile[] = [];
  loading = true;
  error = '';
  page = 1;
  pages = 1;
  total = 0;
  filtersOpen = false;

  filterForm!: FormGroup;
  private querySub?: Subscription;

  states = ['Tamil Nadu', 'Karnataka', 'Kerala', 'Andhra Pradesh', 'Telangana', 'Maharashtra', 'Delhi'];
  maritalStatuses = ['single', 'married', 'divorced', 'widowed'];
  categories = [
    { key: '', label: 'All Profiles' },
    { key: 'male', label: 'Male Profiles' },
    { key: 'female', label: 'Female Profiles' },
    { key: 'married', label: 'Married Profiles' },
    { key: 'featured', label: 'Featured Profiles' },
    { key: 'recent', label: 'Recently Added' },
  ];

  private routeSub?: Subscription;

  constructor(
    private profileService: ProfileService,
    private toast: ToastService,
    private auth: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.filterForm = this.fb.group({
      keyword: [''],
      category: [''],
      gender: [''],
      minAge: [''],
      maxAge: [''],
      location: [''],
      district: [''],
      state: [''],
      education: [''],
      occupation: [''],
      maritalStatus: [''],
      height: [''],
      profileId: [''],
      sort: ['newest'],
    });

    this.querySub = this.filterForm.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.page = 1;
        this.load();
      });

    this.routeSub = this.route.queryParams.subscribe((params) => {
      if (params['category']) {
        this.filterForm.patchValue({ category: params['category'] }, { emitEvent: false });
      }
      this.load();
    });
  }

  load() {
    this.loading = true;
    this.error = '';
    const raw = this.filterForm.value;
    const query: ProfileQuery = {
      page: this.page,
      limit: 12,
      keyword: raw.keyword || undefined,
      category: raw.category || undefined,
      gender: raw.gender || undefined,
      minAge: raw.minAge ? +raw.minAge : undefined,
      maxAge: raw.maxAge ? +raw.maxAge : undefined,
      location: raw.location || undefined,
      district: raw.district || undefined,
      state: raw.state || undefined,
      education: raw.education || undefined,
      occupation: raw.occupation || undefined,
      maritalStatus: raw.maritalStatus || undefined,
      height: raw.height || undefined,
      profileId: raw.profileId || undefined,
      sort: raw.sort || 'newest',
    };

    this.profileService.getList(query).subscribe({
      next: (res) => {
        this.profiles = res.data;
        this.total = res.pagination.total;
        this.pages = res.pagination.pages;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load profiles';
        this.loading = false;
      },
    });
  }

  onPageChange(p: number) {
    this.page = p;
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearFilters() {
    this.filterForm.reset({ sort: 'newest' });
  }

  hasFilters(): boolean {
    const v = this.filterForm.value;
    return !!(
      v.keyword ||
      v.gender ||
      v.minAge ||
      v.maxAge ||
      v.location ||
      v.district ||
      v.state ||
      v.education ||
      v.occupation ||
      v.maritalStatus ||
      v.height ||
      v.profileId
    );
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
          this.toast.success('Removed from saved');
        },
        error: () => this.toast.error('Failed to update'),
      });
    } else {
      this.profileService.saveProfile(profile._id).subscribe({
        next: () => {
          profile.saved = true;
          this.toast.success('Profile saved');
        },
        error: () => this.toast.error('Failed to update'),
      });
    }
  }

  openEnquiry(profile: MatrimonialProfile) {
    if (!this.auth.isAuthenticated) {
      this.toast.info('Please log in to send an enquiry');
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/dashboard/enquiries'], { queryParams: { profile: profile._id } });
  }

  ngOnDestroy() {
    this.querySub?.unsubscribe();
    this.routeSub?.unsubscribe();
  }
}