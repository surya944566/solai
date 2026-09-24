import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminUser, User } from '../models/user';
import { MatrimonialProfile } from '../models/profile';
import { Enquiry, SupportConversation, SupportMessage } from '../models/models';

export interface AdminDashboard {
  stats: {
    totalUsers: number;
    activeUsers: number;
    blockedUsers: number;
    pendingUsers: number;
    totalMale: number;
    totalFemale: number;
    marriedProfiles: number;
    featuredProfiles: number;
    draftProfiles: number;
    pendingEnquiries: number;
    unreadSupportMessages: number;
  };
  charts: {
    monthlyRegistrations: Array<{ _id: string; count: number }>;
    genderDistribution: Array<{ _id: string; count: number }>;
    statusDistribution: Array<{ _id: string; count: number }>;
    categoryDistribution: Array<{ _id: string; count: number }>;
    enquiryStats: Array<{ _id: string; count: number }>;
  };
  recent: {
    users: User[];
    profiles: MatrimonialProfile[];
    enquiries: Enquiry[];
    conversations: SupportConversation[];
  };
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<{ success: boolean; data: AdminDashboard }> {
    return this.http.get<{ success: boolean; data: AdminDashboard }>(`${this.base}/dashboard`);
  }

  /* ---------- Users ---------- */
  getUsers(params: Record<string, unknown> = {}): Observable<Paginated<User>> {
    const httpParams = this.toParams(params);
    return this.http.get<Paginated<User>>(`${this.base}/users`, { params: httpParams });
  }

  createUser(payload: { name: string; emailOrMobile: string; password?: string; status?: string }): Observable<{ success: boolean; data: User; generatedPassword?: string }> {
    return this.http.post<{ success: boolean; data: User; generatedPassword?: string }>(`${this.base}/users`, payload);
  }

  updateUser(id: string, payload: Partial<User>): Observable<{ success: boolean; data: User }> {
    return this.http.put<{ success: boolean; data: User }>(`${this.base}/users/${id}`, payload);
  }

  deleteUser(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.base}/users/${id}`);
  }

  blockUser(id: string): Observable<{ success: boolean; data: User }> {
    return this.http.put<{ success: boolean; data: User }>(`${this.base}/users/${id}/block`, {});
  }

  activateUser(id: string): Observable<{ success: boolean; data: User }> {
    return this.http.put<{ success: boolean; data: User }>(`${this.base}/users/${id}/activate`, {});
  }

  resetPassword(id: string, password?: string): Observable<{ success: boolean; message: string; newPassword?: string }> {
    return this.http.put<{ success: boolean; message: string; newPassword?: string }>(`${this.base}/users/${id}/reset-password`, { password });
  }

  getUserLoginHistory(id: string): Observable<{ success: boolean; data: User }> {
    return this.http.get<{ success: boolean; data: User }>(`${this.base}/users/${id}/login-history`);
  }

  /* ---------- Profiles ---------- */
  getProfiles(params: Record<string, unknown> = {}): Observable<Paginated<MatrimonialProfile>> {
    return this.http.get<Paginated<MatrimonialProfile>>(`${this.base}/profiles`, { params: this.toParams(params) });
  }

  createProfile(payload: FormData): Observable<{ success: boolean; data: MatrimonialProfile }> {
    return this.http.post<{ success: boolean; data: MatrimonialProfile }>(`${this.base}/profiles`, payload);
  }

  updateProfile(id: string, payload: FormData): Observable<{ success: boolean; data: MatrimonialProfile }> {
    return this.http.put<{ success: boolean; data: MatrimonialProfile }>(`${this.base}/profiles/${id}`, payload);
  }

  deleteProfile(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.base}/profiles/${id}`);
  }

  togglePublish(id: string): Observable<{ success: boolean; data: MatrimonialProfile }> {
    return this.http.put<{ success: boolean; data: MatrimonialProfile }>(`${this.base}/profiles/${id}/publish`, {});
  }

  toggleFeature(id: string): Observable<{ success: boolean; data: MatrimonialProfile }> {
    return this.http.put<{ success: boolean; data: MatrimonialProfile }>(`${this.base}/profiles/${id}/feature`, {});
  }

  blockProfile(id: string): Observable<{ success: boolean; data: MatrimonialProfile }> {
    return this.http.put<{ success: boolean; data: MatrimonialProfile }>(`${this.base}/profiles/${id}/block`, {});
  }

  /* ---------- Enquiries ---------- */
  getEnquiries(params: Record<string, unknown> = {}): Observable<Paginated<Enquiry>> {
    return this.http.get<Paginated<Enquiry>>(`${this.base}/enquiries`, { params: this.toParams(params) });
  }

  getEnquiry(id: string): Observable<{ success: boolean; data: Enquiry }> {
    return this.http.get<{ success: boolean; data: Enquiry }>(`${this.base}/enquiries/${id}`);
  }

  updateEnquiry(id: string, payload: { status?: string; adminReply?: string; internalNotes?: string }): Observable<{ success: boolean; data: Enquiry }> {
    return this.http.put<{ success: boolean; data: Enquiry }>(`${this.base}/enquiries/${id}`, payload);
  }

  deleteEnquiry(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.base}/enquiries/${id}`);
  }

  /* ---------- Support ---------- */
  getConvos(params: Record<string, unknown> = {}): Observable<Paginated<SupportConversation>> {
    return this.http.get<Paginated<SupportConversation>>(`${this.base}/support`, { params: this.toParams(params) });
  }

  getConvo(id: string): Observable<{ success: boolean; data: { conversation: SupportConversation; messages: SupportMessage[] } }> {
    return this.http.get<{ success: boolean; data: { conversation: SupportConversation; messages: SupportMessage[] } }>(`${this.base}/support/${id}`);
  }

  sendSupportMessage(id: string, body: string): Observable<{ success: boolean; data: SupportMessage }> {
    return this.http.post<{ success: boolean; data: SupportMessage }>(`${this.base}/support/${id}/messages`, { body });
  }

  closeConvo(id: string): Observable<{ success: boolean; data: SupportConversation }> {
    return this.http.put<{ success: boolean; data: SupportConversation }>(`${this.base}/support/${id}/close`, {});
  }

  blockConvo(id: string): Observable<{ success: boolean; data: SupportConversation }> {
    return this.http.put<{ success: boolean; data: SupportConversation }>(`${this.base}/support/${id}/block`, {});
  }

  setConvoNotes(id: string, notes: string): Observable<{ success: boolean; data: SupportConversation }> {
    return this.http.put<{ success: boolean; data: SupportConversation }>(`${this.base}/support/${id}/notes`, { notes });
  }

  /* ---------- Reports ---------- */
  downloadReport(report: string): Observable<Blob> {
    return this.http.get(`${this.base}/reports/${report}`, { responseType: 'blob' });
  }

  getActivity(): Observable<{ success: boolean; data: Array<{ action: string; module: string; description: string; createdAt: string; admin?: string | { name?: string; email?: string } }> }> {
    return this.http.get<{ success: boolean; data: Array<{ action: string; module: string; description: string; createdAt: string; admin?: string | { name?: string; email?: string } }> }>(`${this.base}/reports/activity`);
  }

  private toParams(obj: Record<string, unknown>): HttpParams {
    let params = new HttpParams();
    Object.entries(obj).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return params;
  }
}