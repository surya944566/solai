import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SettingsService } from '../../../core/services/settings.service';
import { SiteSettings } from '../../../core/models/models';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [RouterModule],
  template: `
    <footer class="site-footer">
      <div class="container-xl">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="brand-row">
              <span class="brand-mark"><i class="bi bi-heart-fill"></i></span>
              <span class="brand-name">{{ settings['site_name'] || 'Solai Matrimony' }}</span>
            </div>
            <p>{{ settings['footer_text'] || 'Find your perfect life partner with trust and care.' }}</p>
            <div class="socials">
              @if (settings['facebook']) {
                <a [href]="settings['facebook']" target="_blank" rel="noopener" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
              }
              @if (settings['twitter']) {
                <a [href]="settings['twitter']" target="_blank" rel="noopener" aria-label="Twitter / X"><i class="bi bi-twitter-x"></i></a>
              }
              @if (settings['instagram']) {
                <a [href]="settings['instagram']" target="_blank" rel="noopener" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
              }
              @if (settings['youtube']) {
                <a [href]="settings['youtube']" target="_blank" rel="noopener" aria-label="YouTube"><i class="bi bi-youtube"></i></a>
              }
            </div>
          </div>

          <div class="footer-col">
            <h6>Quick Links</h6>
            <a routerLink="/">Home</a>
            <a href="/#about">About Us</a>
            <a routerLink="/browse">Browse Profiles</a>
            <a href="/#how-it-works">How It Works</a>
            <a href="/#faq">FAQ</a>
          </div>

          <div class="footer-col">
            <h6>Profiles</h6>
            <a routerLink="/browse" [queryParams]="{ category: 'male' }">Male Profiles</a>
            <a routerLink="/browse" [queryParams]="{ category: 'female' }">Female Profiles</a>
            <a routerLink="/browse" [queryParams]="{ category: 'married' }">Married Profiles</a>
            <a routerLink="/browse" [queryParams]="{ category: 'featured' }">Featured Profiles</a>
            <a routerLink="/browse" [queryParams]="{ category: 'recent' }">Recently Added</a>
          </div>

          <div class="footer-col">
            <h6>Contact</h6>
            <div class="contact-line"><i class="bi bi-building"></i> {{ settings['office_name'] || 'Solai Matrimony' }}</div>
            <div class="contact-line"><i class="bi bi-geo-alt"></i> {{ settings['office_address'] || '' }}</div>
            <div class="contact-line"><i class="bi bi-telephone"></i> {{ settings['office_phone'] || '' }}</div>
            <div class="contact-line"><i class="bi bi-envelope"></i> {{ settings['office_email'] || '' }}</div>
          </div>
        </div>

        <div class="footer-bottom">
          <span>&copy; {{ year }} {{ settings['site_name'] || 'Solai Matrimony' }}. All rights reserved.</span>
          <span class="footer-links">
            <a href="/#policy">Privacy Policy</a>
            <a href="/#terms">Terms &amp; Conditions</a>
          </span>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      .site-footer {
        background: var(--footer-bg);
        color: var(--footer-text);
        margin-top: 4rem;
      }
      .footer-grid {
        display: grid;
        grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
        gap: 2.5rem;
        padding: 3.5rem 0 2rem;
      }
      .brand-row {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        margin-bottom: 1rem;
      }
      .brand-mark {
        width: 40px;
        height: 40px;
        border-radius: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--primary-light), var(--secondary-color));
        color: #fff;
      }
      .brand-name {
        font-family: var(--font-primary);
        font-size: 1.3rem;
        font-weight: 700;
        color: #fff;
      }
      .footer-brand p {
        font-size: 0.9rem;
        opacity: 0.8;
        max-width: 320px;
      }
      .socials {
        display: flex;
        gap: 0.7rem;
        margin-top: 0.4rem;
      }
      .socials a {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
        text-decoration: none;
        transition: all 0.25s ease;
      }
      .socials a:hover {
        background: var(--secondary-color);
        transform: translateY(-3px);
      }
      .footer-col h6 {
        color: #fff;
        font-size: 1rem;
        margin-bottom: 1rem;
        position: relative;
        padding-bottom: 0.5rem;
      }
      .footer-col h6::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        width: 30px;
        height: 2px;
        background: var(--secondary-color);
      }
      .footer-col a {
        display: block;
        color: var(--footer-text);
        font-size: 0.9rem;
        text-decoration: none;
        padding: 0.25rem 0;
        opacity: 0.85;
        transition: opacity 0.2s ease, padding-left 0.2s ease;
      }
      .footer-col a:hover {
        opacity: 1;
        padding-left: 6px;
        color: #fff;
      }
      .contact-line {
        display: flex;
        align-items: flex-start;
        gap: 0.55rem;
        font-size: 0.88rem;
        margin-bottom: 0.6rem;
        opacity: 0.88;
      }
      .contact-line i {
        color: var(--secondary-color);
        margin-top: 2px;
      }
      .footer-bottom {
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding: 1.2rem 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.5rem;
        font-size: 0.82rem;
        opacity: 0.75;
      }
      .footer-links a {
        color: var(--footer-text);
        text-decoration: none;
        margin-left: 1.2rem;
      }
      .footer-links a:hover {
        color: #fff;
      }
      @media (max-width: 991.98px) {
        .footer-grid {
          grid-template-columns: 1fr 1fr;
        }
      }
      @media (max-width: 575.98px) {
        .footer-grid {
          grid-template-columns: 1fr;
          gap: 1.6rem;
        }
        .footer-bottom {
          flex-direction: column;
          text-align: center;
        }
      }
    `,
  ],
})
export class SiteFooterComponent implements OnInit {
  settings: SiteSettings = {};
  year = new Date().getFullYear();

  constructor(private settingsService: SettingsService) {}

  ngOnInit() {
    this.settingsService.getPublic().subscribe({
      next: (res) => (this.settings = res.data),
      error: () => {},
    });
  }
}