import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { switchMap } from 'rxjs';
import { apiError } from '../core/api';
import { Product } from '../core/models';
import { CartService } from '../core/services/cart.service';
import { ToastService } from '../core/services/toast.service';
import { WishlistService } from '../core/services/wishlist.service';
import { EgpPipe } from '../shared/egp.pipe';
import { EmptyState } from '../shared/empty-state';
import { I } from '../shared/icons';
import { Spinner } from '../shared/spinner';

@Component({
  selector: 'app-wishlist',
  imports: [RouterLink, LucideAngularModule, EgpPipe, EmptyState, Spinner],
  template: `
    <div class="container-x py-8">
      <h1 class="page-title">My wishlist</h1>
      @if (loading()) {
        <app-spinner label="Loading your wishlist…" />
      } @else if (!wishlist.items().length) {
        <div class="mt-6"><app-empty-state [icon]="I.Heart" title="Your wishlist is empty" text="Tap the heart on any product to save it for later." actionLabel="Browse products" /></div>
      } @else {
        <p class="mt-1 text-sm text-gray-500">{{ wishlist.items().length }} saved items</p>
        <ul class="card mt-6 divide-y divide-gray-100">
          @for (p of wishlist.items(); track p._id) {
            <li class="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap" [class.opacity-50]="busyId() === p._id">
              <a [routerLink]="['/products', p._id]" class="size-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <img [src]="p.imageCover" [alt]="p.title" class="size-full object-cover" />
              </a>
              <div class="min-w-0 flex-1">
                <a [routerLink]="['/products', p._id]" class="line-clamp-2 font-semibold text-gray-900 hover:text-brand-600">{{ p.title }}</a>
                <p class="mt-0.5 text-xs text-gray-500">{{ p.category.name }}</p>
                <p class="mt-1 font-bold">{{ (p.priceAfterDiscount ?? p.price) | egp }}</p>
              </div>
              <div class="flex w-full gap-2 sm:w-auto">
                <button class="btn-primary flex-1 sm:flex-none" (click)="moveToCart(p)" [disabled]="busyId() !== null">
                  <lucide-icon [img]="I.ShoppingCart" [size]="16" /> Move to cart
                </button>
                <button class="btn-danger px-3" (click)="remove(p)" [disabled]="busyId() !== null" [attr.aria-label]="'Remove ' + p.title">
                  <lucide-icon [img]="I.Trash2" [size]="16" />
                </button>
              </div>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class WishlistPage {
  protected readonly wishlist = inject(WishlistService);
  private cart = inject(CartService);
  private toast = inject(ToastService);
  protected readonly I = I;
  protected readonly loading = signal(true);
  protected readonly busyId = signal<string | null>(null);

  constructor() {
    this.wishlist.load().subscribe({
      next: () => this.loading.set(false),
      error: (e) => { this.toast.error(apiError(e)); this.loading.set(false); },
    });
  }

  remove(p: Product) {
    this.busyId.set(p._id);
    this.wishlist.remove(p._id).subscribe({
      next: () => { this.toast.success('Removed from wishlist'); this.busyId.set(null); },
      error: (e) => { this.toast.error(apiError(e)); this.busyId.set(null); },
    });
  }

  moveToCart(p: Product) {
    this.busyId.set(p._id);
    this.cart.add(p._id).pipe(switchMap(() => this.wishlist.remove(p._id))).subscribe({
      next: () => { this.toast.success('Moved to cart'); this.busyId.set(null); },
      error: (e) => { this.toast.error(apiError(e)); this.busyId.set(null); },
    });
  }
}
