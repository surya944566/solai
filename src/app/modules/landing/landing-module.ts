import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SiteNavComponent } from '../../shared/components/site-nav/site-nav';
import { SiteFooterComponent } from '../../shared/components/site-footer/site-footer';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { ProfileImgComponent } from '../../shared/components/profile-img/profile-img';
import { TitleCasePipe } from '../../shared/pipes/title-case.pipe';
import { ProfileCardComponent } from '../../shared/components/profile-card/profile-card';

import { Landing } from './landing';
import { HeroSection } from './sections/hero/hero';
import { StatsSection } from './sections/stats/stats';
import { ProfilesPreviewSection } from './sections/profiles-preview/profiles-preview';
import { FeaturesSection } from './sections/features/features';
import { HowItWorksSection } from './sections/how-it-works/how-it-works';
import { ShowcaseSection } from './sections/showcase/showcase';
import { TestimonialsSection } from './sections/testimonials/testimonials';
import { FaqSection } from './sections/faq/faq';
import { CtaSection } from './sections/cta/cta';

const routes: Routes = [{ path: '', component: Landing }];

@NgModule({
  declarations: [
    Landing,
    HeroSection,
    StatsSection,
    ProfilesPreviewSection,
    FeaturesSection,
    HowItWorksSection,
    ShowcaseSection,
    TestimonialsSection,
    FaqSection,
    CtaSection,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SiteNavComponent,
    SiteFooterComponent,
    RevealDirective,
    ProfileImgComponent,
    TitleCasePipe,
    ProfileCardComponent,
  ],
})
export class LandingModule {}