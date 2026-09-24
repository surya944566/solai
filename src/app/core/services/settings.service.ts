import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SiteSettings } from '../models/models';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private base = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getPublic(): Observable<{ success: boolean; data: SiteSettings }> {
    return this.http.get<{ success: boolean; data: SiteSettings }>(`${this.base}/admin/settings/public`);
  }

  getAll(): Observable<{ success: boolean; data: SiteSettings }> {
    return this.http.get<{ success: boolean; data: SiteSettings }>(`${this.base}/admin/settings`);
  }

  update(payload: Record<string, unknown>): Observable<{ success: boolean; data: SiteSettings }> {
    return this.http.put<{ success: boolean; data: SiteSettings }>(`${this.base}/admin/settings`, payload);
  }
}