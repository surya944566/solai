import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification } from '../models/models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private base = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  get(page = 1): Observable<{ success: boolean; data: Notification[]; unread: number; pagination: unknown }> {
    return this.http.get<{ success: boolean; data: Notification[]; unread: number; pagination: unknown }>(this.base, {
      params: { page: String(page) },
    });
  }

  getUnreadCount(): Observable<{ success: boolean; count: number }> {
    return this.http.get<{ success: boolean; count: number }>(`${this.base}/unread-count`);
  }

  markRead(id: string): Observable<{ success: boolean; data: Notification }> {
    return this.http.put<{ success: boolean; data: Notification }>(`${this.base}/${id}/read`, {});
  }

  markAllRead(): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${this.base}/read-all`, {});
  }
}