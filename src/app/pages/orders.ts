import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { map } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { CartService } from '../core/services/cart.service';
import { OrdersService } from '../core/services/orders.service';
import { EgpPipe } from '../shared/egp.pipe';
import { EmptyState } from '../shared/empty-state';
import { I } from '../shared/icons';
import { Spinner } from '../shared/spinner';

@Component({
  selector: 'app-orders',
  imports: [RouterLink, LucideAngularModule, EgpPipe, EmptyState, Spinner, DatePipe],
  template: `
    <div class="container-x py-8">
      <h1 class="page-title">My orders</h1>
      @if (orders.isLoading()) {
        <app-spinner label="Loading your orders…" />
      } @else if (orders.error()) {
        <div class="mt-6"><app-empty-state [icon]="I.CircleAlert" title="Couldn't load your orders" text="Refresh the page to try again." /></div>
      } @else if (!orders.value()?.length) {
        <div class="mt-6"><app-empty-state [icon]="I.Package" title="No orders yet" text="When you place an order, you can track it here." actionLabel="Start shopping" /></div>
      } @else {
        <p class="mt-1 text-sm text-gray-500">{{ orders.value()!.length }} orders</p>
        <ul class="mt-6 space-y-4">
          @for (o of orders.value(); track o._id) {
            <li class="card overflow-hidden">
              <button class="flex w-full flex-wrap items-center gap-x-6 gap-y-2 bg-gray-50 px-5 py-4 text-left text-sm" (click)="toggle(o._id)" [attr.aria-expanded]="open().has(o._id)">
                <div><p class="text-xs text-gray-500">Order</p><p class="font-semibold">#{{ o.id }}</p></div>
                <div><p class="text-xs text-gray-500">Placed</p><p class="font-medium">{{ o.createdAt | date: 'mediumDate' }}</p></div>
                <div><p class="text-xs text-gray-500">Total</p><p class="font-semibold">{{ o.totalOrderPrice | egp }}</p></div>
                <div class="ml-auto flex flex-wrap gap-2">
                  <span class="pill" [class]="o.isPaid ? 'bg-brand-100 text-brand-700' : 'bg-amber-100 text-amber-800'">{{ o.isPaid ? 'Paid' : 'Unpaid' }}</span>
                  <span class="pill" [class]="o.isDelivered ? 'bg-brand-100 text-brand-700' : 'bg-sky-100 text-sky-800'">{{ o.isDelivered ? 'Delivered' : 'On the way' }}</span>
                  <span class="pill bg-gray-200 text-gray-700">{{ o.paymentMethodType === 'card' ? 'Card' : 'Cash' }}</span>
                </div>
                <lucide-icon [img]="I.ChevronRight" [size]="18" class="text-gray-400 transition-transform" [class.rotate-90]="open().has(o._id)" />
              </button>

              <div class="flex gap-2 overflow-x-auto px-5 py-3" [class.hidden]="open().has(o._id)">
                @for (item of o.cartItems; track item._id) {
                  <img [src]="item.product.imageCover" [alt]="item.product.title" class="size-14 shrink-0 rounded-md object-cover" />
                }
              </div>

              @if (open().has(o._id)) {
                <div class="grid gap-6 p-5 md:grid-cols-[1fr_260px]">
                  <ul class="divide-y divide-gray-100">
                    @for (item of o.cartItems; track item._id) {
                      <li class="flex items-center gap-3 py-3 text-sm">
                        <img [src]="item.product.imageCover" alt="" class="size-14 rounded-md object-cover" />
                        <a [routerLink]="['/products', item.product._id || item.product.id]" class="line-clamp-2 flex-1 font-medium hover:text-brand-600">{{ item.product.title }}</a>
                        <span class="text-gray-500">× {{ item.count }}</span>
                        <span class="w-24 text-right font-semibold">{{ item.price * item.count | egp }}</span>
                      </li>
                    }
                  </ul>
                  <div class="space-y-4 text-sm">
                    @if (o.shippingAddress) {
                      <div>
                        <h3 class="font-semibold text-gray-900">Shipping to</h3>
                        <p class="mt-1 text-gray-600">{{ o.shippingAddress.details }}, {{ o.shippingAddress.city }}</p>
                        <p class="text-gray-500">{{ o.shippingAddress.phone }}</p>
                      </div>
                    }
                    <dl class="space-y-1.5 border-t border-gray-100 pt-4">
                      <div class="flex justify-between"><dt class="text-gray-500">Shipping</dt><dd>{{ o.shippingPrice | egp }}</dd></div>
                      <div class="flex justify-between"><dt class="text-gray-500">Tax</dt><dd>{{ o.taxPrice | egp }}</dd></div>
                      <div class="flex justify-between font-semibold"><dt>Total</dt><dd>{{ o.totalOrderPrice | egp }}</dd></div>
                    </dl>
                  </div>
                </div>
              }
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: `
    @reference "../../styles.css";
    .pill { @apply rounded-full px-2.5 py-0.5 text-xs font-semibold; }
  `,
})
export class Orders {
  private auth = inject(AuthService);
  private service = inject(OrdersService);
  protected readonly I = I;
  protected readonly open = signal(new Set<string>());

  protected readonly orders = rxResource({
    params: () => this.auth.user()?.id,
    stream: ({ params: id }) =>
      this.service.getUserOrders(id!).pipe(map((list) => [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)))),
  });

  constructor() {
    // Arriving here from Stripe means the cart was just paid for; refresh it.
    const cart = inject(CartService);
    cart.load().subscribe({ error: () => cart.reset() });
  }

  toggle(id: string) {
    this.open.update((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
}

