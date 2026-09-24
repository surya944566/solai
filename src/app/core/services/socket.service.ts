import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;

  constructor(private auth: AuthService) {}

  connectUser(): Socket | null {
    const token = this.auth.token;
    if (!token) return null;
    return this.connect(token);
  }

  connectAdmin(): Socket | null {
    const token = this.auth.adminToken;
    if (!token) return null;
    return this.connect(token);
  }

  private connect(token: string): Socket {
    if (this.socket?.connected) return this.socket;
    this.socket = io(environment.socketUrl, { auth: { token } });
    return this.socket;
  }

  get connection(): Socket | null {
    return this.socket;
  }

  on(event: string, cb: (data: unknown) => void) {
    if (this.socket) this.socket.on(event, cb);
  }

  off(event: string, cb?: (data: unknown) => void) {
    if (!this.socket) return;
    if (cb) this.socket.off(event, cb);
    else this.socket.off(event);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}