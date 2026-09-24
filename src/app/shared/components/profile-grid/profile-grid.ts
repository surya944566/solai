import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatrimonialProfile } from '../../../core/models/profile';
import { ProfileCardComponent } from '../profile-card/profile-card';
import { EmptyStateComponent } from '../empty-state/empty-state';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-grid',
  standalone: true,
  imports: [CommonModule, ProfileCardComponent, EmptyStateComponent],
  template: `
    @if (loading) {
      <div class="row g-4">
        @for (i of skeletonItems; track i) {
          <div class="col-6 col-md-4 col-lg-3">
            <div class="skeleton-card">
              <div class="skeleton" style="aspect-ratio: 1/1.05; border-radius: 14px 14px 0 0"></div>
              <div class="p-3">
                <div class="skeleton mb-2" style="height: 14px; width: 60%"></div>
                <div class="skeleton mb-2" style="height: 12px;"></div>
                <div class="skeleton" style="height: 12px; width: 80%"></div>
              </div>
            </div>
          </div>
        }
      </div>
    } @else if (error) {
      <div class="empty-state">
        <span class="empty-icon"><i class="bi bi-exclamation-triangle"></i></span>
        <h5>Something went wrong</h5>
        <p>{{ error }}</p>
        <button class="btn btn-primary-custom mt-3" (click)="retry.emit()">Try Again</button>
      </div>
    } @else if (!profiles.length) {
      <app-empty-state [title]="emptyTitle" [message]="emptyMessage" [icon]="emptyIcon" (action)="retry.emit()"></app-empty-state>
    } @else {
      <div class="row g-4">
        @for (profile of profiles; track profile._id) {
          <div class="col-6 col-md-4 col-lg-3">
            <app-profile-card
              [profile]="profile"
              [showActions]="showActions"
              [showEnquiry]="showEnquiry"
              (onSave)="save.emit($event)"
              (onEnquiry)="enquiry.emit($event)"
            ></app-profile-card>
          </div>
        }
      </div>
    }
  `,
  styles: [
    `
      .skeleton-card {
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: var(--radius);
        overflow: hidden;
      }
    `,
  ],
})
export class ProfileGridComponent {
  @Input() profiles: MatrimonialProfile[] = [];
  @Input() loading = false;
  @Input() error = '';
  @Input() showActions = true;
  @Input() showEnquiry = true;
  @Input() emptyTitle = 'No profiles found';
  @Input() emptyMessage = 'There are no profiles to display right now.';
  @Input() emptyIcon = 'bi-inbox';
  @Input() skeletonCount = 8;
  @Output() retry = new EventEmitter<void>();
  @Output() save = new EventEmitter<MatrimonialProfile>();
  @Output() enquiry = new EventEmitter<MatrimonialProfile>();

  get skeletonItems(): number[] {
    return Array.from({ length: this.skeletonCount }, (_, i) => i);
  }
}