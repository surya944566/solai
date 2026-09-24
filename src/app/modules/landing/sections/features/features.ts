import { Component } from '@angular/core';

@Component({
  selector: 'app-features',
  templateUrl: './features.html',
  standalone: false,
  styleUrl: './features.scss',
})
export class FeaturesSection {
  features = [
    {
      icon: 'bi-person-check-fill',
      title: 'Trusted Profiles',
      text: 'Every profile is carefully screened, verified and approved by our team before being published.',
    },
    {
      icon: 'bi-clipboard-check-fill',
      title: 'Admin-Managed Profiles',
      text: 'Our dedicated admin team manages all profiles, ensuring authentic information for every member.',
    },
    {
      icon: 'bi-shield-lock-fill',
      title: 'Privacy & Security',
      text: 'Your personal details stay private. Contact information is protected and never exposed publicly.',
    },
    {
      icon: 'bi-headset-fill',
      title: 'Dedicated Support',
      text: 'Real-time chat support with our team for any questions, guidance or assistance you need.',
    },
  ];
}