import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatrimonialProfile } from '../../../core/models/profile';
import { ProfileImgComponent } from '../profile-img/profile-img';
import { TitleCasePipe } from '../../pipes/title-case.pipe';

@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [CommonModule, RouterModule, ProfileImgComponent, TitleCasePipe],
  template: `
    <div class="profile-card" [ngClass]="{ 'is-saved': profile.saved }">
      <div class="card-media">
        <a [routerLink]="['/browse/profile', profile._id]">
          <app-profile-img [src]="profile.profilePhoto || ''" [name]="profile.name" className="card-img-fill"></app-profile-img>
        </a>
        @if (profile.isFeatured || profile.status === 'featured') {
          <span class="featured-badge"><i class="bi bi-star-fill"></i> Featured</span>
        }
        <span class="gender-badge" [class.female]="profile.gender === 'female'">
          {{ profile.gender === 'female' ? 'Female' : profile.gender === 'male' ? 'Male' : 'Other' }}
        </span>
      </div>

      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div>
            <span class="profile-id">#{{ profile.profileId }}</span>
            <h5 class="profile-name">{{ profile.name }}</h5>
          </div>
          @if (showActions) {
            <button
              class="btn-save"
              [class.saved]="profile.saved"
              (click)="onSave.emit(profile)"
              [attr.aria-label]="profile.saved ? 'Unsave' : 'Save'"
            >
              <i [class]="profile.saved ? 'bi bi-heart-fill' : 'bi bi-heart'"></i>
            </button>
          }
        </div>

        @if (profile.age) {
          <div class="meta-row"><i class="bi bi-calendar3"></i> {{ profile.age }} yrs</div>
        }
        @if (profile.location) {
          <div class="meta-row"><i class="bi bi-geo-alt"></i> {{ profile.location }}{{ profile.state ? ', ' + profile.state : '' }}</div>
        }
        @if (profile.education) {
          <div class="meta-row"><i class="bi bi-mortarboard"></i> {{ profile.education }}</div>
        }
        @if (profile.occupation) {
          <div class="meta-row"><i class="bi bi-briefcase"></i> {{ profile.occupation }}</div>
        }

        <div class="marital-row">
          <span class="badge-status {{ profile.maritalStatus }}">{{ profile.maritalStatus | titleCase }}</span>
        </div>

        <div class="card-actions">
          <a [routerLink]="['/browse/profile', profile._id]" class="btn btn-primary-custom btn-sm w-100">
            View Profile
          </a>
          @if (showEnquiry) {
            <button class="btn btn-outline-gold btn-sm w-100 mt-1" (click)="onEnquiry.emit(profile)">
              <i class="bi bi-chat-heart me-1"></i> Send Enquiry
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .profile-card {
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: var(--radius);
        overflow: hidden;
        box-shadow: var(--shadow-sm);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .profile-card:hover {
        transform: translateY(-6px);
        box-shadow: var(--shadow-lg);
      }
      .card-media {
        position: relative;
        aspect-ratio: 1 / 1.05;
        overflow: hidden;
        background: #f3e9e3;
      }
      .card-media :is(img, .avatar-placeholder) {
        transition: transform 0.5s ease;
      }
      .profile-card:hover .card-media :is(img, .avatar-placeholder) {
        transform: scale(1.07);
      }
      .featured-badge {
        position: absolute;
        top: 10px;
        left: 10px;
        background: linear-gradient(135deg, var(--secondary-color), #e6c34d);
        color: #fff;
        padding: 4px 10px;
        border-radius: 30px;
        font-size: 0.68rem;
        font-weight: 700;
        z-index: 2;
      }
      .gender-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(44, 75, 155, 0.85);
        color: #fff;
        padding: 4px 10px;
        border-radius: 30px;
        font-size: 0.68rem;
        font-weight: 600;
        z-index: 2;
      }
      .gender-badge.female {
        background: rgba(196, 62, 96, 0.88);
      }
      .card-body {
        padding: 1rem;
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .profile-id {
        font-size: 0.72rem;
        color: var(--secondary-dark);
        font-weight: 700;
        letter-spacing: 0.5px;
      }
      .profile-name {
        font-size: 1.12rem;
        font-weight: 700;
        margin: 0.1rem 0 0.5rem;
      }
      .btn-save {
        border: 1px solid var(--border-color);
        background: #fff;
        border-radius: 50%;
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-muted);
        transition: all 0.2s ease;
        flex-shrink: 0;
      }
      .btn-save.saved {
        background: color-mix(in srgb, var(--primary-color) 12%, #fff);
        color: var(--primary-color);
        border-color: color-mix(in srgb, var(--primary-color) 30%, transparent);
      }
      .meta-row {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.84rem;
        color: var(--text-muted);
        margin-bottom: 0.3rem;
      }
      .meta-row i {
        color: var(--primary-color);
        opacity: 0.7;
      }
      .marital-row {
        margin-top: 0.5rem;
      }
      .card-actions {
        margin-top: auto;
        padding-top: 0.85rem;
      }
      @media (max-width: 575.98px) {
        .card-actions .btn {
          padding: 0.4rem 0.9rem;
          font-size: 0.8rem;
          line-height: 1.35;
          white-space: nowrap;
        }
      }
    `,
  ],
})
export class ProfileCardComponent {
  @Input() profile!: MatrimonialProfile;
  @Input() showActions = true;
  @Input() showEnquiry = true;
  @Output() onSave = new EventEmitter<MatrimonialProfile>();
  @Output() onEnquiry = new EventEmitter<MatrimonialProfile>();
}