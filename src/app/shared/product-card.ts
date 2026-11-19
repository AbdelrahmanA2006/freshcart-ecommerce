import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { apiError } from '../core/api';
import { Product } from '../core/models';
import { AuthService } from '../core/services/auth.service';
import { CartService } from '../core/services/cart.service';
import { ToastService } from '../core/services/toast.service';
import { WishlistService } from '../core/services/wishlist.service';
import { EgpPipe } from './egp.pipe';
import { I } from './icons';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, LucideAngularModule, EgpPipe],
  template: `
    @let p = product();
    <article class="group card relative flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg hover:shadow-gray-200/70">
      <button type="button" (click)="toggleWishlist()" [disabled]="wishBusy()"
        class="absolute right-2.5 top-2.5 z-10 flex size-9 items-center justify-center rounded-full bg-white/95 shadow-sm transition-colors hover:text-red-500"
        [class.text-red-500]="inWishlist()" [class.text-gray-500]="!inWishlist()"
        [attr.aria-label]="inWishlist() ? 'Remove from wishlist' : 'Add to wishlist'" [attr.aria-pressed]="inWishlist()">
        <lucide-icon [img]="I.Heart" [size]="17" [class.fill-red-500]="inWishlist()" />
      </button>
      @if (p.priceAfterDiscount) {
        <span class="absolute left-2.5 top-2.5 z-10 rounded-md bg-red-500 px-2 py-0.5 text-xs font-bold text-white">-{{ discount() }}%</span>
      }
      <a [routerLink]="['/products', p._id]" class="block aspect-square overflow-hidden bg-gray-100">
        <img [src]="p.imageCover" [alt]="p.title" loading="lazy" class="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
      </a>
      <div class="flex flex-1 flex-col p-3.5">
        <a [routerLink]="['/categories', p.category._id]" class="text-xs font-medium text-brand-600 hover:underline">{{ p.category.name }}</a>
        <a [routerLink]="['/products', p._id]" class="mt-1 line-clamp-2 min-h-10 text-sm font-semibold text-gray-900 hover:text-brand-600">{{ p.title }}</a>
        <div class="mt-2 flex items-center gap-1 text-xs text-gray-500">
          <lucide-icon [img]="I.Star" [size]="13" class="fill-amber-400 text-amber-400" />
          <span class="font-medium text-gray-700">{{ p.ratingsAverage }}</span>
          <span>({{ p.ratingsQuantity }})</span>
        </div>
        <div class="mt-auto flex items-end justify-between gap-2 pt-3">
          <div class="leading-tight">
            @if (p.priceAfterDiscount) {
              <p class="text-base font-bold text-gray-900">{{ p.priceAfterDiscount | egp }}</p>
              <p class="text-xs text-gray-400 line-through">{{ p.price | egp }}</p>
            } @else {
              <p class="text-base font-bold text-gray-900">{{ p.price | egp }}</p>
            }
          </div>
          <button type="button" (click)="addToCart()" [disabled]="cartBusy()"
            class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
            [attr.aria-label]="'Add ' + p.title + ' to cart'">
            @if (cartBusy()) { <lucide-icon [img]="I.LoaderCircle" [size]="18" class="animate-spin" /> }
            @else { <lucide-icon [img]="I.Plus" [size]="18" /> }
          </button>
        </div>
      </div>
    </article>
  `,
})
export class ProductCard {
  readonly product = input.required<Product>();

  private auth = inject(AuthService);
  private cart = inject(CartService);
  private wishlist = inject(WishlistService);
  private toast = inject(ToastService);
  private router = inject(Router);

  protected readonly I = I;
  protected readonly cartBusy = signal(false);
  protected readonly wishBusy = signal(false);
  protected readonly inWishlist = computed(() => this.wishlist.ids().has(this.product()._id));
  protected readonly discount = computed(() => {
    const p = this.product();
    return p.priceAfterDiscount ? Math.round((1 - p.priceAfterDiscount / p.price) * 100) : 0;
  });

  private requireLogin(): boolean {
    if (this.auth.isLoggedIn()) return true;
    this.toast.info('Sign in to save items and shop');
    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
    return false;
  }

  addToCart() {
    if (!this.requireLogin()) return;
    this.cartBusy.set(true);
    this.cart.add(this.product()._id).subscribe({
      next: () => { this.toast.success('Added to cart'); this.cartBusy.set(false); },
      error: (e) => { this.toast.error(apiError(e)); this.cartBusy.set(false); },
    });
  }

  toggleWishlist() {
    if (!this.requireLogin()) return;
    const id = this.product()._id;
    const removing = this.inWishlist();
    this.wishBusy.set(true);
    (removing ? this.wishlist.remove(id) : this.wishlist.add(id)).subscribe({
      next: () => { this.toast.success(removing ? 'Removed from wishlist' : 'Added to wishlist'); this.wishBusy.set(false); },
      error: (e) => { this.toast.error(apiError(e)); this.wishBusy.set(false); },
    });
  }
}
