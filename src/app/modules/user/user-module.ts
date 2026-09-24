import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout';
import { OverviewComponent } from './overview/overview';
import { SavedProfilesComponent } from './saved/saved';
import { MyEnquiriesComponent } from './enquiries/enquiries';
import { NotificationsComponent } from './notifications/notifications';
import { SupportChatComponent } from './support/support';
import { SettingsComponent } from './settings/settings';

import { SiteNavComponent } from '../../shared/components/site-nav/site-nav';
import { ProfileGridComponent } from '../../shared/components/profile-grid/profile-grid';
import { ProfileCardComponent } from '../../shared/components/profile-card/profile-card';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { ProfileImgComponent } from '../../shared/components/profile-img/profile-img';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { SpinnerComponent } from '../../shared/components/spinner/spinner';
import { ToasterComponent } from '../../shared/components/toaster/toaster';
import { TitleCasePipe } from '../../shared/pipes/title-case.pipe';

const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: '', component: OverviewComponent },
      { path: 'saved', component: SavedProfilesComponent },
      { path: 'enquiries', component: MyEnquiriesComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'support', component: SupportChatComponent },
      { path: 'settings', component: SettingsComponent },
    ],
  },
];

@NgModule({
  declarations: [
    DashboardLayoutComponent,
    OverviewComponent,
    SavedProfilesComponent,
    MyEnquiriesComponent,
    NotificationsComponent,
    SupportChatComponent,
    SettingsComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    SiteNavComponent,
    ProfileGridComponent,
    ProfileCardComponent,
    PaginationComponent,
    ProfileImgComponent,
    EmptyStateComponent,
    SpinnerComponent,
    ToasterComponent,
    TitleCasePipe,
  ],
})
export class UserModule {}