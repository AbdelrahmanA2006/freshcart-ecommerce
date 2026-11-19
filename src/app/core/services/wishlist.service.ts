import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { API } from '../api';
import { Product } from '../models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly items = signal<Product[]>([]);
  readonly ids = signal<Set<string>>(new Set());
  readonly count = computed(() => this.ids().size);

  constructor() {
    effect(() => {
      if (this.auth.isLoggedIn()) this.load().subscribe({ error: () => this.reset() });
      else this.reset();
    });
  }

  load() {
    return this.http.get<{ count: number; data: Product[] }>(`${API}/wishlist`).pipe(
      tap((r) => {
        this.items.set(r.data);
        this.ids.set(new Set(r.data.map((p) => p._id)));
      }),
    );
  }

  has(productId: string) { return this.ids().has(productId); }

  add(productId: string) {
    return this.http
      .post<{ message: string; data: string[] }>(`${API}/wishlist`, { productId })
      .pipe(tap((r) => this.ids.set(new Set(r.data))));
  }

  remove(productId: string) {
    return this.http.delete<{ message: string; data: string[] }>(`${API}/wishlist/${productId}`).pipe(
      tap((r) => {
        this.ids.set(new Set(r.data));
        this.items.update((list) => list.filter((p) => p._id !== productId));
      }),
    );
  }

  private reset() {
    this.items.set([]);
    this.ids.set(new Set());
  }
}
