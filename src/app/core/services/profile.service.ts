import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MatrimonialProfile, ProfileListResponse, ProfileQuery } from '../models/profile';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private base = `${environment.apiUrl}/profiles`;

  constructor(private http: HttpClient) {}

  getList(query: ProfileQuery = {}): Observable<ProfileListResponse> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<ProfileListResponse>(this.base, { params });
  }

  getFeatured(): Observable<{ success: boolean; data: MatrimonialProfile[] }> {
    return this.http.get<{ success: boolean; data: MatrimonialProfile[] }>(`${this.base}/featured`);
  }

  getMale(): Observable<{ success: boolean; data: MatrimonialProfile[] }> {
    return this.http.get<{ success: boolean; data: MatrimonialProfile[] }>(`${this.base}/male`);
  }

  getFemale(): Observable<{ success: boolean; data: MatrimonialProfile[] }> {
    return this.http.get<{ success: boolean; data: MatrimonialProfile[] }>(`${this.base}/female`);
  }

  getMarried(): Observable<{ success: boolean; data: MatrimonialProfile[] }> {
    return this.http.get<{ success: boolean; data: MatrimonialProfile[] }>(`${this.base}/married`);
  }

  getLatest(): Observable<{ success: boolean; data: MatrimonialProfile[] }> {
    return this.http.get<{ success: boolean; data: MatrimonialProfile[] }>(`${this.base}/latest`);
  }

  getById(id: string): Observable<{ success: boolean; data: MatrimonialProfile }> {
    return this.http.get<{ success: boolean; data: MatrimonialProfile }>(`${this.base}/${id}`);
  }

  saveProfile(id: string): Observable<{ success: boolean; saved: boolean }> {
    return this.http.post<{ success: boolean; saved: boolean }>(`${this.base}/${id}/save`, {});
  }

  unSaveProfile(id: string): Observable<{ success: boolean; saved: boolean }> {
    return this.http.delete<{ success: boolean; saved: boolean }>(`${this.base}/${id}/save`);
  }

  getSavedProfiles(): Observable<{ success: boolean; data: Array<MatrimonialProfile & { savedAt?: string }> }> {
    return this.http.get<{ success: boolean; data: Array<MatrimonialProfile & { savedAt?: string }> }>(`${this.base}/saved`);
  }

  reportProfile(id: string, note: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.base}/${id}/report`, { note });
  }
}