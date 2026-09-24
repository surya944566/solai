import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { StorageService } from './storage.service';
import { AdminLoginResponse, AdminUser, LoginResponse, User } from '../models/user';
import { environment } from '../../../environments/environment';

export interface AdminContact {
  officeName: string;
  officePhone: string;
  officeAddress: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  private adminSubject = new BehaviorSubject<AdminUser | null>(null);
  private contactSubject = new BehaviorSubject<AdminContact | null>(null);

  user$ = this.userSubject.asObservable();
  admin$ = this.adminSubject.asObservable();
  contact$ = this.contactSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {
    const user = storage.user as User | null;
    if (user) this.userSubject.next(user);
    const admin = storage.admin as AdminUser | null;
    if (admin) this.adminSubject.next(admin);
  }

  get user(): User | null {
    return this.userSubject.value;
  }

  get admin(): AdminUser | null {
    return this.adminSubject.value;
  }

  get token(): string | null {
    return this.storage.token;
  }

  get adminToken(): string | null {
    return this.storage.adminToken;
  }

  get isAuthenticated(): boolean {
    return !!this.storage.token;
  }

  get isAdminAuthenticated(): boolean {
    return !!this.storage.adminToken;
  }

  register(payload: {
    name: string;
    emailOrMobile: string;
    password: string;
    confirmPassword: string;
  }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/register`, payload).pipe(
      tap((res) => {
        this.storage.token = res.token;
        this.storage.user = res.user;
        this.userSubject.next(res.user);
        this.contactSubject.next(res.adminContact || null);
      })
    );
  }

  login(payload: { emailOrMobile: string; password: string; rememberMe?: boolean }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, payload).pipe(
      map((res) => {
        this.storage.setRemember(!!payload.rememberMe);
        return res;
      }),
      tap((res) => {
        this.storage.token = res.token;
        this.storage.user = res.user;
        this.userSubject.next(res.user);
        this.contactSubject.next(res.adminContact || null);
      })
    );
  }

  logout() {
    this.storage.clearAuth();
    this.userSubject.next(null);
    this.contactSubject.next(null);
  }

  adminLogin(payload: { email: string; password: string }): Observable<AdminLoginResponse> {
    return this.http.post<AdminLoginResponse>(`${environment.apiUrl}/admin/auth/login`, payload).pipe(
      tap((res) => {
        this.storage.adminToken = res.token;
        this.storage.admin = res.admin;
        this.adminSubject.next(res.admin);
      })
    );
  }

  adminLogout() {
    this.storage.clearAdminAuth();
    this.adminSubject.next(null);
  }

  changePassword(payload: { currentPassword: string; newPassword: string }): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${environment.apiUrl}/auth/change-password`, payload);
  }

  updateProfile(payload: { name?: string; mobile?: string }): Observable<{ success: boolean; user: User }> {
    return this.http.put<{ success: boolean; user: User }>(`${environment.apiUrl}/auth/me`, payload).pipe(
      tap((res) => {
        this.storage.user = res.user;
        this.userSubject.next(res.user);
      })
    );
  }

  getAdminContact(): Observable<{ success: boolean; adminContact: AdminContact }> {
    return this.http.get<{ success: boolean; adminContact: AdminContact }>(`${environment.apiUrl}/auth/admin-contact`).pipe(
      tap((res) => this.contactSubject.next(res.adminContact))
    );
  }
}