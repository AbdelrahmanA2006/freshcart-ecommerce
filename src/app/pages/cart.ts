import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { apiError } from '../core/api';
import { CartItem } from '../core/models';
import { CartService } from '../core/services/cart.service';
import { ToastService } from '../core/services/toast.service';
import { EgpPipe } from '../shared/egp.pipe';
import { EmptyState } from '../shared/empty-state';
import { I } from '../shared/icons';
import { Spinner } from '../shared/spinner';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, LucideAngularModule, EgpPipe, EmptyState, Spinner],
  template: `
    <div class="container-x py-8">
      <h1 class="page-title">Shopping cart</h1>

      @if (loading()) {
        <app-spinner label="Loading your cart…" />
      } @else if (!items().length) {
        <div class="mt-6">
          <app-empty-state [icon]="I.ShoppingCart" title="Your cart is empty" text="Browse products and add what you like. It will show up here." actionLabel="Start shopping" />
        </div>
      } @else {
        <p class="mt-1 text-sm text-gray-500">{{ cart.count() }} {{ cart.count() === 1 ? 'item' : 'items' }}</p>
        <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <section class="card divide-y divide-gray-100">
            @for (item of items(); track item._id) {
              <div class="flex gap-4 p-4" [class.opacity-50]="busyId() === item.product._id">
                <a [routerLink]="['/products', item.product._id]" class="size-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <img [src]="item.product.imageCover" [alt]="item.product.title" class="size-full object-cover" />
                </a>
                <div class="flex min-w-0 flex-1 flex-col">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <a [routerLink]="['/products', item.product._id]" class="line-clamp-2 font-semibold text-gray-900 hover:text-brand-600">{{ item.product.title }}</a>
                      <p class="mt-0.5 text-xs text-gray-500">{{ item.product.category.name }}</p>
                    </div>
                    <p class="shrink-0 font-bold text-gray-900">{{ item.price * item.count | egp }}</p>
                  </div>
                  <div class="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                    <div class="flex items-center rounded-lg border border-gray-300">
                      <button class="qty-btn" (click)="setCount(item, item.count - 1)" [disabled]="busyId() !== null" aria-label="Decrease quantity">
                        <lucide-icon [img]="item.count === 1 ? I.Trash2 : I.Minus" [size]="15" />
                      </button>
                      <span class="w-9 text-center text-sm font-semibold" aria-live="polite">{{ item.count }}</span>
                      <button class="qty-btn" (click)="setCount(item, item.count + 1)" [disabled]="busyId() !== null || item.count >= item.product.quantity" aria-label="Increase quantity">
                        <lucide-icon [img]="I.Plus" [size]="15" />
                      </button>
                    </div>
                    <span class="text-xs text-gray-500">{{ item.price | egp }} each</span>
                    <button class="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:underline" (click)="remove(item)" [disabled]="busyId() !== null">
                      <lucide-icon [img]="I.Trash2" [size]="15" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            }
            <div class="flex justify-between p-4">
              <a routerLink="/products" class="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline"><lucide-icon [img]="I.ArrowLeft" [size]="15" /> Continue shopping</a>
              @if (confirmClear()) {
                <span class="flex items-center gap-2 text-sm">
                  Remove all {{ cart.count() }} items?
                  <button class="font-semibold text-red-600 hover:underline" (click)="clear()">Clear cart</button>
                  <button class="text-gray-500 hover:underline" (click)="confirmClear.set(false)">Keep</button>
                </span>
              } @else {
                <button class="text-sm font-medium text-gray-500 hover:text-red-600" (click)="confirmClear.set(true)">Clear cart</button>
              }
            </div>
          </section>

          <aside class="card h-fit p-5 lg:sticky lg:top-24">
            <h2 class="font-semibold text-gray-900">Order summary</h2>
            <dl class="mt-4 space-y-2.5 text-sm">
              <div class="flex justify-between"><dt class="text-gray-500">Subtotal</dt><dd class="font-medium">{{ total() | egp }}</dd></div>
              <div class="flex justify-between"><dt class="text-gray-500">Shipping</dt><dd class="font-medium text-brand-600">Free</dd></div>
              <div class="flex justify-between border-t border-gray-100 pt-3 text-base"><dt class="font-semibold">Total</dt><dd class="font-bold">{{ total() | egp }}</dd></div>
            </dl>
            <a routerLink="/checkout" class="btn-primary mt-5 w-full">Proceed to checkout <lucide-icon [img]="I.ArrowRight" [size]="16" /></a>
            <p class="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500"><lucide-icon [img]="I.ShieldCheck" [size]="14" /> Secure checkout · Card or cash</p>
          </aside>
        </div>
      }
    </div>
  `,
  styles: `
    @reference "../../styles.css";
    .qty-btn { @apply flex size-9 items-center justify-center text-gray-600 hover:text-brand-600 disabled:opacity-40; }
  `,
})
export class CartPage {
  protected readonly cart = inject(CartService);
  private toast = inject(ToastService);
  protected readonly I = I;

  protected readonly loading = signal(true);
  protected readonly busyId = signal<string | null>(null);
  protected readonly confirmClear = signal(false);
  protected readonly items = computed(() => this.cart.cart()?.data.products ?? []);
  protected readonly total = computed(() => this.cart.cart()?.data.totalCartPrice ?? 0);

  constructor() {
    this.cart.load().subscribe({
      next: () => this.loading.set(false),
      // A brand-new user has no cart yet; the API answers 404 in that case.
      error: () => { this.cart.cart.set(null); this.loading.set(false); },
    });
  }

  setCount(item: CartItem, count: number) {
    if (count < 1) return this.remove(item);
    this.busyId.set(item.product._id);
    this.cart.updateCount(item.product._id, count).subscribe({
      next: () => this.busyId.set(null),
      error: (e) => { this.toast.error(apiError(e)); this.busyId.set(null); },
    });
  }

  remove(item: CartItem) {
    this.busyId.set(item.product._id);
    this.cart.remove(item.product._id).subscribe({
      next: () => { this.toast.success('Item removed'); this.busyId.set(null); },
      error: (e) => { this.toast.error(apiError(e)); this.busyId.set(null); },
    });
  }

  clear() {
    this.cart.clear().subscribe({
      next: () => { this.toast.success('Cart cleared'); this.confirmClear.set(false); },
      error: (e) => this.toast.error(apiError(e)),
    });
  }
}
