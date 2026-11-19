import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API } from '../api';
import { AuthResponse, AuthUser } from '../models';

const TOKEN_KEY = 'userToken';
const PROFILE_KEY = 'userProfile';

function decodeToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return { id: payload.id, name: payload.name, role: payload.role };
  } catch {
    return null;
  }
}

function read(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly token = signal<string | null>(null);
  readonly profile = signal<{ name: string; email: string } | null>(null);
  readonly user = computed(() => {
    const t = this.token();
    return t ? decodeToken(t) : null;
  });
  readonly isLoggedIn = computed(() => this.user() !== null);

  constructor() {
    const stored = read(TOKEN_KEY);
    if (stored && decodeToken(stored)) {
      this.token.set(stored);
      const p = read(PROFILE_KEY);
      if (p) this.profile.set(JSON.parse(p));
    } else if (stored) {
      this.clear();
    }
  }

  register(body: { name: string; email: string; phone: string; password: string; rePassword: string }) {
    return this.http.post<AuthResponse>(`${API}/auth/signup`, body).pipe(tap((r) => this.store(r.token, r.user)));
  }

  login(body: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${API}/auth/signin`, body).pipe(tap((r) => this.store(r.token, r.user)));
  }

  /** Step 1: emails a 6-digit reset code. */
  forgotPassword(email: string) {
    return this.http.post<{ statusMsg: string; message: string }>(`${API}/auth/forgotPasswords`, { email });
  }

  /** Step 2: checks the code from the email. */
  verifyResetCode(resetCode: string) {
    return this.http.post<{ status: string }>(`${API}/auth/verifyResetCode`, { resetCode });
  }

  /** Step 3: sets the new password and signs the user in. */
  resetPassword(email: string, newPassword: string): Observable<{ token: string }> {
    return this.http
      .put<{ token: string }>(`${API}/auth/resetPassword`, { email, newPassword })
      .pipe(tap((r) => this.store(r.token, { name: decodeToken(r.token)?.name ?? '', email })));
  }

  changePassword(body: { currentPassword: string; password: string; rePassword: string }) {
    return this.http
      .put<{ message: string; token: string; user: { name: string; email: string } }>(`${API}/users/changeMyPassword`, body)
      .pipe(tap((r) => this.store(r.token, r.user)));
  }

  updateMe(body: { name: string; email: string; phone: string }) {
    return this.http
      .put<{ message: string; user: { name: string; email: string } }>(`${API}/users/updateMe/`, body)
      .pipe(tap((r) => this.saveProfile(r.user)));
  }

  verifyToken() {
    return this.http.get<{ message: string; decoded: AuthUser }>(`${API}/auth/verifyToken`);
  }

  logout(redirect = true) {
    this.clear();
    if (redirect) this.router.navigate(['/login']);
  }

  private store(token: string, user: { name: string; email: string }) {
    try { localStorage.setItem(TOKEN_KEY, token); } catch { /* storage unavailable */ }
    this.token.set(token);
    this.saveProfile(user);
  }

  private saveProfile(user: { name: string; email: string }) {
    const profile = { name: user.name, email: user.email };
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch { /* ignore */ }
    this.profile.set(profile);
  }

  private clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(PROFILE_KEY);
    } catch { /* ignore */ }
    this.token.set(null);
    this.profile.set(null);
  }
}
