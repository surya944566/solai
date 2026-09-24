import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const storage = inject(StorageService);
  const router = inject(Router);
  const toast = inject(ToastService);
  const auth = inject(AuthService);

  const path = req.url.startsWith('http') ? new URL(req.url).pathname : req.url;
  const isAdminRequest = path.startsWith('/api/admin');
  const token = isAdminRequest ? storage.adminToken : storage.token;

  let headers = req.headers;
  if (token) headers = headers.set('Authorization', `Bearer ${token}`);

  const authReq = req.clone({ headers, url: resolveUrl(req.url) });

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        const url = router.url;
        if (url.startsWith('/admin')) {
          storage.clearAdminAuth();
          auth.adminLogout();
          router.navigate(['/admin/login']);
        } else {
          storage.clearAuth();
          auth.logout();
          if (!url.includes('/login') && !url.includes('/register')) {
            toast.warning('Session expired. Please log in again.');
            router.navigate(['/login']);
          }
        }
      } else if (err.status === 403) {
        const url = router.url;
        if (url.startsWith('/admin')) {
          storage.clearAdminAuth();
          auth.adminLogout();
          if (!url.includes('/login')) {
            toast.error(err.error?.message || 'Admin access revoked. Please log in again.');
            router.navigate(['/admin/login']);
          }
        } else {
          toast.error(err.error?.message || 'You do not have permission to perform this action.');
        }
      }
      return throwError(() => err);
    })
  );
};

function resolveUrl(url: string): string {
  if (url.startsWith('http')) return url;
  if (url.startsWith('/api')) return url;
  const env = (window as unknown as { __env?: { apiUrl?: string } }).__env;
  const base = env?.apiUrl ?? 'http://localhost:5000/api';
  return base + url;
}