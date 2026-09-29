// import { Component, Input } from '@angular/core';

// @Component({
//   selector: 'app-profile-img',
//   standalone: true,
//   template: `
//     <div class="profile-img {{ className }}">
//       @if (src) {
//         <img [src]="src" [alt]="alt" loading="lazy" />
//       } @else {
//         <div class="avatar-placeholder">
//           <span>{{ initials }}</span>
//         </div>
//       }
//     </div>
//   `,
//   styles: [
//     `
//       .profile-img {
//         width: 100%;
//         height: 100%;
//         overflow: hidden;
//       }
//       .profile-img img {
//         width: 100%;
//         height: 100%;
//         object-fit: cover;
//         display: block;
//       }
//     `,
//   ],
// })
// export class ProfileImgComponent {
//   @Input() src = '';
//   @Input() alt = 'Profile';
//   @Input() name = 'Solai';
//   @Input() className = '';

//   get initials(): string {
//     const parts = this.name.trim().split(/\s+/).filter(Boolean);
//     if (!parts.length) return 'S';
//     if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
//     return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
//   }
// }

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-profile-img',
  standalone: true,
  template: `
    <div class="profile-img {{ className }}">
      @if (imageUrl) {
        <img
          [src]="imageUrl"
          [alt]="alt"
          loading="lazy"
          (error)="imageError = true"
        />
      } @else {
        <div class="avatar-placeholder">
          <span>{{ initials }}</span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .profile-img {
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      .profile-img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
    `,
  ],
})
export class ProfileImgComponent {
  @Input() src = '';
  @Input() alt = 'Profile';
  @Input() name = 'Solai';
  @Input() className = '';

  imageError = false;

  private readonly backendUrl = 'https://solai-m2iy.onrender.com';

  get imageUrl(): string {
    if (!this.src || this.imageError) {
      return '';
    }

    if (
      this.src.startsWith('http://') ||
      this.src.startsWith('https://')
    ) {
      return this.src;
    }

    return `${this.backendUrl}${this.src.startsWith('/') ? '' : '/'}${this.src}`;
  }

  get initials(): string {
    const parts = this.name.trim().split(/\s+/).filter(Boolean);

    if (!parts.length) return 'S';

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }
}