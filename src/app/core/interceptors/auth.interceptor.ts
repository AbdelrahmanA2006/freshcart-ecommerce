import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API } from '../api';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/** Adds the `token` header the FreshCart API expects, and logs out on an expired token. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const toast = inject(ToastService);
  const token = auth.token();
  const authed = !!token && req.url.startsWith(API);

  return next(authed ? req.clone({ setHeaders: { token: token! } }) : req).pipe(
    catchError((err) => {
      const msg: string = err?.error?.message ?? '';
      if (authed && err.status === 401 && /token|log ?in/i.test(msg)) {
        auth.logout();
        toast.error('Your session has expired. Please sign in again.');
      }
      return throwError(() => err);
    }),
  );
};
