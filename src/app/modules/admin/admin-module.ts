import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AdminGuard } from '../../core/guards/admin.guard';

import { AdminLoginComponent } from './admin-login/admin-login';
import { AdminLayoutComponent } from './admin-layout/admin-layout';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard';
import { AdminUsersComponent } from './users/users';
import { AdminProfilesComponent } from './profiles/profiles';
import { AdminEnquiriesComponent } from './enquiries/enquiries';
import { AdminSupportComponent } from './support/support';
import { AdminSettingsComponent } from './settings/settings';
import { AdminReportsComponent } from './reports/reports';

import { SiteNavComponent } from '../../shared/components/site-nav/site-nav';
import { SiteFooterComponent } from '../../shared/components/site-footer/site-footer';
import { ProfileImgComponent } from '../../shared/components/profile-img/profile-img';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { SpinnerComponent } from '../../shared/components/spinner/spinner';
import { ToasterComponent } from '../../shared/components/toaster/toaster';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { SafeImagePipe } from '../../shared/pipes/safe-image.pipe';
import { TitleCasePipe } from '../../shared/pipes/title-case.pipe';

const routes: Routes = [
  { path: 'login', component: AdminLoginComponent },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'profiles', component: AdminProfilesComponent },
      { path: 'enquiries', component: AdminEnquiriesComponent },
      { path: 'support', component: AdminSupportComponent },
      { path: 'settings', component: AdminSettingsComponent },
      { path: 'reports', component: AdminReportsComponent },
    ],
  },
];

@NgModule({
  declarations: [
    AdminLoginComponent,
    AdminLayoutComponent,
    AdminDashboardComponent,
    AdminUsersComponent,
    AdminProfilesComponent,
    AdminEnquiriesComponent,
    AdminSupportComponent,
    AdminSettingsComponent,
    AdminReportsComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    SiteNavComponent,
    SiteFooterComponent,
    ProfileImgComponent,
    EmptyStateComponent,
    SpinnerComponent,
    ToasterComponent,
    PaginationComponent,
    SafeImagePipe,
    TitleCasePipe,
  ],
})
export class AdminModule {}