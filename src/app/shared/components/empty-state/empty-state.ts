import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-state">
      <span class="empty-icon">
        @if (icon) {
          <i class="bi {{ icon }}"></i>
        } @else {
          <i class="bi bi-inbox"></i>
        }
      </span>
      <h5>{{ title }}</h5>
      <p class="mb-0">{{ message }}</p>
      @if (actionLabel) {
        <button class="btn btn-primary-custom mt-3" (click)="action.emit()">{{ actionLabel }}</button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() title = 'Nothing here yet';
  @Input() message = 'No items found.';
  @Input() icon = 'bi-inbox';
  @Input() actionLabel = '';
  @Output() action = new EventEmitter<void>();
}