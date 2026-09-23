import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn =
  (request, next) => {

    const authService =
      inject(AuthService);

    const router =
      inject(Router);

    const token =
      authService.getToken();

    const isAuthRequest =
      request.url.includes('/api/auth/');

    let requestToSend = request;

    if (
      token &&
      !isAuthRequest
    ) {
      requestToSend = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next(requestToSend).pipe(
      catchError(
        (error: HttpErrorResponse) => {

          if (
            error.status === 401 &&
            !isAuthRequest
          ) {
            authService.logout();

            router.navigate([
              '/login'
            ]);
          }

          return throwError(
            () => error
          );
        }
      )
    );
  };