import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div class="spinner-wrapper">
      <div class="spinner-border" style="color: var(--primary-color)" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      @if (label) {
        <div class="spinner-label">{{ label }}</div>
      }
    </div>
  `,
})
export class SpinnerComponent {
  @Input() label = 'Loading...';
}