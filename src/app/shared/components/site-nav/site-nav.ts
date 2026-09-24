import { Component, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SettingsService } from '../../../core/services/settings.service';
import { User } from '../../../core/models/user';

@Component({
  selector: 'app-site-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="site-nav" [class.scrolled]="scrolled" [class.shrunk]="shrunk">
      <div class="container-xl">
        <div class="nav-inner">
          <a class="brand" routerLink="/">
            <span class="brand-mark"><i class="bi bi-heart-fill"></i></span>
            <span class="brand-text">
              <span class="brand-name">{{ siteName }}</span>
              <span class="brand-tag">Matrimony</span>
            </span>
          </a>

          <ul class="nav-links">
            <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a></li>
            <li><a href="/#about">About Us</a></li>
            <li><a routerLink="/browse">Browse Profiles</a></li>
            <li><a href="/#how-it-works">How It Works</a></li>
            <li><a href="/#contact">Contact</a></li>
          </ul>

          <div class="nav-actions">
            @if (user) {
              <a routerLink="/dashboard" class="btn btn-soft btn-sm me-2"><i class="bi bi-person-circle me-1"></i>Dashboard</a>
              <span class="nav-avatar d-none d-sm-inline-flex" title="{{ user.name }}">
                {{ init(user.name) }}
              </span>
            } @else {
              <a routerLink="/login" class="nav-login">Login</a>
              <a routerLink="/register" class="btn btn-gold btn-sm">Register</a>
            }
          </div>

          <button class="nav-burger" (click)="menuOpen = !menuOpen" aria-label="Menu">
            <i [class]="menuOpen ? 'bi bi-x-lg' : 'bi bi-list'"></i>
          </button>
        </div>

        <div class="nav-mobile" [class.open]="menuOpen">
          <a routerLink="/" (click)="menuOpen = false">Home</a>
          <a href="/#about" (click)="menuOpen = false">About Us</a>
          <a routerLink="/browse" (click)="menuOpen = false">Browse Profiles</a>
          <a href="/#how-it-works" (click)="menuOpen = false">How It Works</a>
          <a href="/#contact" (click)="menuOpen = false">Contact</a>
          @if (user) {
            <a routerLink="/dashboard" (click)="menuOpen = false">Dashboard</a>
            <button class="btn btn-outline-gold mt-2" (click)="logout()">Logout</button>
          } @else {
            <div class="d-flex gap-2 mt-3">
              <a routerLink="/login" class="btn btn-soft flex-fill" (click)="menuOpen = false">Login</a>
              <a routerLink="/register" class="btn btn-gold flex-fill" (click)="menuOpen = false">Register</a>
            </div>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [
    `
      .site-nav {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1030;
        background: rgba(255, 250, 245, 0.92);
        backdrop-filter: blur(12px);
        transition: all 0.35s ease;
        border-bottom: 1px solid transparent;
      }
      .site-nav.scrolled {
        background: rgba(255, 255, 255, 0.97);
        box-shadow: 0 6px 24px rgba(123, 30, 58, 0.08);
        border-bottom-color: var(--border-color);
      }
      .nav-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 78px;
        transition: height 0.35s ease;
      }
      .site-nav.shrunk .nav-inner {
        height: 64px;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        text-decoration: none;
      }
      .brand-mark {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
        color: #fff;
        font-size: 1.2rem;
        box-shadow: 0 4px 12px rgba(123, 30, 58, 0.25);
      }
      .brand-text {
        display: flex;
        flex-direction: column;
        line-height: 1.1;
      }
      .brand-name {
        font-family: var(--font-primary);
        font-weight: 700;
        font-size: 1.25rem;
        color: var(--primary-color);
      }
      .brand-tag {
        font-size: 0.6rem;
        letter-spacing: 4px;
        text-transform: uppercase;
        color: var(--secondary-dark);
        font-weight: 700;
      }
      .nav-links {
        display: flex;
        gap: 1.6rem;
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .nav-links a {
        position: relative;
        color: var(--text-color);
        font-weight: 600;
        font-size: 0.92rem;
        text-decoration: none;
        padding: 0.3rem 0;
      }
      .nav-links a::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        height: 2px;
        width: 0;
        background: var(--secondary-color);
        transition: width 0.3s ease;
      }
      .nav-links a:hover::after,
      .nav-links a.active::after {
        width: 100%;
      }
      .nav-links a:hover {
        color: var(--primary-color);
      }
      .nav-login {
        color: var(--primary-color);
        font-weight: 700;
        text-decoration: none;
        margin-right: 1rem;
      }
      .nav-avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: var(--primary-color);
        color: #fff;
        align-items: center;
        justify-content: center;
        font-weight: 700;
      }
      .nav-burger {
        display: none;
        background: transparent;
        border: none;
        font-size: 1.6rem;
        color: var(--primary-color);
        padding: 0.2rem;
      }
      .nav-mobile {
        display: none;
        flex-direction: column;
        padding: 0 0 1.2rem;
        gap: 0.75rem;
      }
      .nav-mobile a {
        color: var(--text-color);
        text-decoration: none;
        font-weight: 600;
        padding: 0.4rem 0.4rem;
        border-radius: 8px;
      }
      .nav-mobile a:hover {
        background: color-mix(in srgb, var(--primary-color) 7%, #fff);
        color: var(--primary-color);
      }
      @media (max-width: 991.98px) {
        .nav-links,
        .nav-actions .nav-login,
        .nav-actions .btn,
        .nav-actions .nav-avatar {
          display: none !important;
        }
        .nav-burger {
          display: block;
        }
        .nav-mobile.open {
          display: flex;
        }
      }
    `,
  ],
})
export class SiteNavComponent implements OnInit {
  @HostListener('window:scroll', []) onScroll() {
    this.scrolled = window.scrollY > 30;
    this.shrunk = window.scrollY > 120;
  }

  scrolled = false;
  shrunk = false;
  menuOpen = false;
  siteName = 'Solai Kulalar';
  user: User | null = null;

  constructor(
    private auth: AuthService,
    private settings: SettingsService
  ) {}

  ngOnInit() {
    this.auth.user$.subscribe((u) => (this.user = u));
    this.settings.getPublic().subscribe({
      next: (res) => {
        const name = res.data['site_name'] as string | undefined;
        if (name) {
          const parts = name.split(' ');
          this.siteName = parts[0] || 'Solai';
        }
      },
      error: () => {},
    });
  }

  init(name: string): string {
    return name?.trim().charAt(0).toUpperCase() || 'S';
  }

  logout() {
    this.auth.logout();
    location.href = '/';
  }
}