import { Component } from '@angular/core';

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.html',
  standalone: false,
  styleUrl: './testimonials.scss',
})
export class TestimonialsSection {
  testimonials = [
    {
      name: 'Suresh & Meena',
      relation: 'Married on Solai Matrimony',
      text: 'We found each other through Solai Matrimony! The admin team was supportive throughout and guided our families at every step. Forever grateful.',
      initials: 'SM',
      color: '#7b1e3a',
    },
    {
      name: 'R. Lakshmi',
      relation: 'Parent of a member',
      text: 'As a parent, I felt completely safe. The profiles were verified, enquiries were handled with care, and we found a wonderful match for our daughter.',
      initials: 'RL',
      color: '#a03154',
    },
    {
      name: 'Karthik Raja',
      relation: 'Active member',
      text: 'A genuinely trusted matrimony service. The enquiry system is clean and the real-time support chat made everything so easy. Highly recommended.',
      initials: 'KR',
      color: '#c9a227',
    },
  ];
}