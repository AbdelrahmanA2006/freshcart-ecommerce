import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API } from '../api';
import { CartResponse } from '../models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly cart = signal<CartResponse | null>(null);
  readonly count = computed(() => this.cart()?.numOfCartItems ?? 0);
  /** Product ids currently in the cart, for quick "in cart" checks. */
  readonly productIds = computed(() => new Set(this.cart()?.data.products.map((p) => p.product._id ?? p.product.id) ?? []));

  constructor() {
    // Load the cart whenever someone logs in; reset it on logout.
    effect(() => {
      if (this.auth.isLoggedIn()) this.load().subscribe({ error: () => this.cart.set(null) });
      else this.cart.set(null);
    });
  }

  load(): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${API}/cart`).pipe(tap((c) => this.cart.set(c)));
  }

  add(productId: string) {
    // POST returns products without populated details, so re-fetch the full cart.
    return this.http.post<CartResponse>(`${API}/cart`, { productId }).pipe(tap(() => this.load().subscribe()));
  }

  updateCount(productId: string, count: number) {
    return this.http.put<CartResponse>(`${API}/cart/${productId}`, { count }).pipe(tap((c) => this.cart.set(c)));
  }

  remove(productId: string) {
    return this.http.delete<CartResponse>(`${API}/cart/${productId}`).pipe(tap((c) => this.cart.set(c)));
  }

  clear() {
    return this.http.delete<{ message: string }>(`${API}/cart`).pipe(tap(() => this.cart.set(null)));
  }

  /** Called after an order is placed: the API empties the cart server-side. */
  reset() { this.cart.set(null); }
}
