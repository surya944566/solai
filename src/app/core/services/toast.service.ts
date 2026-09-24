import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new Subject<Toast>();
  toasts$ = this.toastsSubject.asObservable();

  success(message: string) {
    this.toastsSubject.next({ message, type: 'success' });
  }

  error(message: string) {
    this.toastsSubject.next({ message, type: 'error' });
  }

  warning(message: string) {
    this.toastsSubject.next({ message, type: 'warning' });
  }

  info(message: string) {
    this.toastsSubject.next({ message, type: 'info' });
  }
}