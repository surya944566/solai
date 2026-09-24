import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { BrowseComponent } from './browse/browse';
import { ProfileDetailComponent } from './profile-detail/profile-detail';
import { SiteNavComponent } from '../../shared/components/site-nav/site-nav';
import { SiteFooterComponent } from '../../shared/components/site-footer/site-footer';
import { ProfileGridComponent } from '../../shared/components/profile-grid/profile-grid';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { ProfileImgComponent } from '../../shared/components/profile-img/profile-img';
import { TitleCasePipe } from '../../shared/pipes/title-case.pipe';

const routes: Routes = [
  { path: '', component: BrowseComponent },
  { path: 'profile/:id', component: ProfileDetailComponent },
];

@NgModule({
  declarations: [BrowseComponent, ProfileDetailComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    SiteNavComponent,
    SiteFooterComponent,
    ProfileGridComponent,
    PaginationComponent,
    ProfileImgComponent,
    TitleCasePipe,
  ],
})
export class BrowseModule {}