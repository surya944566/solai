import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SupportConversation, SupportMessage } from '../models/models';

@Injectable({ providedIn: 'root' })
export class SupportService {
  private base = `${environment.apiUrl}/support`;

  constructor(private http: HttpClient) {}

  getConversations(): Observable<{ success: boolean; data: SupportConversation[] }> {
    return this.http.get<{ success: boolean; data: SupportConversation[] }>(`${this.base}/conversations`);
  }

  openConversation(subject?: string): Observable<{ success: boolean; data: SupportConversation }> {
    return this.http.post<{ success: boolean; data: SupportConversation }>(`${this.base}/conversations`, { subject });
  }

  getMessages(conversationId: string): Observable<{ success: boolean; data: { conversation: SupportConversation; messages: SupportMessage[] } }> {
    return this.http.get<{ success: boolean; data: { conversation: SupportConversation; messages: SupportMessage[] } }>(
      `${this.base}/conversations/${conversationId}/messages`
    );
  }

  sendMessage(conversationId: string, body: string): Observable<{ success: boolean; data: SupportMessage }> {
    return this.http.post<{ success: boolean; data: SupportMessage }>(`${this.base}/conversations/${conversationId}/messages`, { body });
  }
}