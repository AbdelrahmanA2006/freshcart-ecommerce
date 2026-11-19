import { HttpErrorResponse } from '@angular/common/http';

export const API = 'https://ecommerce.routemisr.com/api/v1';

/** Pulls the human-readable message out of an API error response. */
export function apiError(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'Network error. Check your connection and try again.';
    return err.error?.errors?.msg || err.error?.message || `Request failed (${err.status}).`;
  }
  return 'Something went wrong. Please try again.';
}
