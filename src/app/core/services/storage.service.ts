import { Injectable } from '@angular/core';

const KEYS = {
  token: 'solai_token',
  adminToken: 'solai_admin_token',
  user: 'solai_user',
  admin: 'solai_admin',
  remember: 'solai_remember',
};

@Injectable({ providedIn: 'root' })
export class StorageService {
  private mem = new Map<string, string>();
  private useLocal: boolean;

  constructor() {
    this.useLocal = !!localStorage?.getItem(KEYS.remember);
  }

  set(key: string, value: string, remember = false) {
    this.mem.set(key, value);
    if (remember || this.useLocal) localStorage?.setItem(key, value);
    else sessionStorage?.setItem(key, value);
  }

  get(key: string): string | null {
    if (this.mem.has(key)) return this.mem.get(key)!;
    return localStorage?.getItem(key) ?? sessionStorage?.getItem(key);
  }

  remove(key: string) {
    this.mem.delete(key);
    localStorage?.removeItem(key);
    sessionStorage?.removeItem(key);
  }

  get token() {
    return this.get(KEYS.token);
  }
  set token(v: string | null) {
    if (v) this.set(KEYS.token, v, !!localStorage.getItem(KEYS.remember));
    else this.remove(KEYS.token);
  }

  get adminToken() {
    return this.get(KEYS.adminToken);
  }
  set adminToken(v: string | null) {
    if (v) this.set(KEYS.adminToken, v, true);
    else this.remove(KEYS.adminToken);
  }

  get user() {
    const raw = this.get(KEYS.user);
    return raw ? JSON.parse(raw) : null;
  }
  set user(v: unknown | null) {
    if (v) this.set(KEYS.user, JSON.stringify(v));
    else this.remove(KEYS.user);
  }

  get admin() {
    const raw = this.get(KEYS.admin);
    return raw ? JSON.parse(raw) : null;
  }
  set admin(v: unknown | null) {
    if (v) this.set(KEYS.admin, JSON.stringify(v), true);
    else this.remove(KEYS.admin);
  }

  setRemember(remember: boolean) {
    if (remember) localStorage?.setItem(KEYS.remember, '1');
    else localStorage?.removeItem(KEYS.remember);
  }

  clearAuth() {
    this.remove(KEYS.token);
    this.remove(KEYS.user);
  }

  clearAdminAuth() {
    this.remove(KEYS.adminToken);
    this.remove(KEYS.admin);
  }
}