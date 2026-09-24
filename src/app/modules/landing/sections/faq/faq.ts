import { Component } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.html',
  standalone: false,
  styleUrl: './faq.scss',
})
export class FaqSection {
  faqs = [
    {
      q: 'How does Solai Matrimony work?',
      a: 'Register your account, browse verified matrimonial profiles, send an enquiry for profiles you like, and our admin team will guide the connection process between families.',
    },
    {
      q: 'Who creates matrimonial profiles?',
      a: 'Profiles are created and managed by our trained admin team. This ensures every profile is verified for authenticity, safety and quality before it is published.',
    },
    {
      q: 'Can I contact a profile directly?',
      a: 'For your safety, contact details are not publicly exposed. Our admin team facilitates contact between families once an enquiry is approved.',
    },
    {
      q: 'How do I send an enquiry?',
      a: 'Simply click "Send Enquiry" on any profile, add a short message, and our team will review it. You can track your enquiry status from your dashboard.',
    },
    {
      q: 'How is my information protected?',
      a: 'Your personal information is encrypted, stored securely, and only shared with families after mutual consent. We follow strict privacy guidelines and never publish private contact details.',
    },
  ];

  openIndex = 0;

  toggle(i: number) {
    this.openIndex = this.openIndex === i ? -1 : i;
  }
}