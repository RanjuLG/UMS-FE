import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  // Don't add token to auth endpoints
  if (req.url.includes('/api/auth/login') || 
      req.url.includes('/api/auth/register') || 
      req.url.includes('/api/auth/refresh')) {
    return next(req);
  }

  // Get token from localStorage
  const token = localStorage.getItem('accessToken');

  // Clone request and add Authorization header with Bearer token
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle response errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Try to refresh token
        const refreshToken = authService.getRefreshToken();
        
        if (refreshToken && !req.url.includes('/api/auth/')) {
          // Attempt token refresh
          return authService.refreshToken(refreshToken).pipe(
            switchMap((tokenResponse) => {
              // Retry the failed request with new token
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${tokenResponse.accessToken}`
                }
              });
              return next(retryReq);
            }),
            catchError((refreshError) => {
              // Refresh failed - clear storage and redirect to login
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              router.navigate(['/login'], {
                queryParams: { returnUrl: router.url }
              });
              return throwError(() => refreshError);
            })
          );
        } else {
          // No refresh token - clear storage and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          router.navigate(['/login'], {
            queryParams: { returnUrl: router.url }
          });
        }
      }
      return throwError(() => error);
    })
  );
};
