import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Enquiry } from '../models/models';

@Injectable({ providedIn: 'root' })
export class EnquiryService {
  private base = `${environment.apiUrl}/enquiries`;

  constructor(private http: HttpClient) {}

  create(payload: { profile: string; message?: string }): Observable<{ success: boolean; data: Enquiry }> {
    return this.http.post<{ success: boolean; data: Enquiry }>(this.base, payload);
  }

  getMy(): Observable<{ success: boolean; data: Enquiry[] }> {
    return this.http.get<{ success: boolean; data: Enquiry[] }>(`${this.base}/my`);
  }

  getById(id: string): Observable<{ success: boolean; data: Enquiry }> {
    return this.http.get<{ success: boolean; data: Enquiry }>(`${this.base}/${id}`);
  }

  cancel(id: string): Observable<{ success: boolean; data: Enquiry }> {
    return this.http.put<{ success: boolean; data: Enquiry }>(`${this.base}/${id}/cancel`, {});
  }
}