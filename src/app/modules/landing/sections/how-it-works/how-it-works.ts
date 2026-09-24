import { Component } from '@angular/core';

@Component({
  selector: 'app-how-it-works',
  templateUrl: './how-it-works.html',
  standalone: false,
  styleUrl: './how-it-works.scss',
})
export class HowItWorksSection {
  steps = [
    {
      icon: 'bi-person-plus-fill',
      title: 'Create Your Account',
      text: 'Register with us using your basic contact details. Our admin team can also create your account for you.',
    },
    {
      icon: 'bi-search-heart-fill',
      title: 'Browse Matrimonial Profiles',
      text: 'Explore verified profiles filtered by your preferences - gender, age, location, education and more.',
    },
    {
      icon: 'bi-chat-heart-fill',
      title: 'Send an Enquiry',
      text: 'Send an enquiry for a profile you are interested in. Our team reviews it and gets back to you.',
    },
    {
      icon: 'bi-people-fill',
      title: 'Connect Through Admin',
      text: 'Once approved, our admin team facilitates the connection between families in a safe, guided way.',
    },
  ];
}