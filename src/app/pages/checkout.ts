import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { apiError } from '../core/api';
import { ShippingAddress } from '../core/models';
import { CartService } from '../core/services/cart.service';
import { OrdersService } from '../core/services/orders.service';
import { ToastService } from '../core/services/toast.service';
import { EgpPipe } from '../shared/egp.pipe';
import { EmptyState } from '../shared/empty-state';
import { FieldError } from '../shared/field-error';
import { I } from '../shared/icons';
import { Spinner } from '../shared/spinner';
import { EG_PHONE, PHONE_HINT } from '../shared/validators';

@Component({
  selector: 'app-checkout',
  imports: [RouterLink, LucideAngularModule, ReactiveFormsModule, EgpPipe, EmptyState, Spinner, FieldError],
  template: `
    <div class="container-x py-8">
      <a routerLink="/cart" class="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-brand-600"><lucide-icon [img]="I.ArrowLeft" [size]="15" /> Back to cart</a>
      <h1 class="page-title mt-3">Checkout</h1>

      @if (loading()) {
        <app-spinner />
      } @else if (!cart.cart()?.data?.products?.length) {
        <div class="mt-6"><app-empty-state [icon]="I.ShoppingCart" title="Your cart is empty" text="Add some products before checking out." actionLabel="Browse products" /></div>
      } @else {
        <form class="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]" [formGroup]="form" (ngSubmit)="placeOrder()" novalidate>
          <div class="space-y-6">
            <!-- Address -->
            <section class="card p-5">
              <h2 class="flex items-center gap-2 font-semibold text-gray-900"><lucide-icon [img]="I.MapPin" [size]="18" class="text-brand-600" /> Shipping address</h2>

              @if (addresses.value()?.length) {
                <div class="mt-4 grid gap-3 sm:grid-cols-2">
                  @for (a of addresses.value(); track a._id) {
                    <label class="option" [class.selected]="selectedAddress() === a._id">
                      <input type="radio" name="addr" class="mt-1 accent-brand-500" [checked]="selectedAddress() === a._id" (change)="useAddress(a._id)" />
                      <span class="text-sm">
                        <span class="block font-semibold text-gray-900">{{ a.name }}</span>
                        <span class="block text-gray-600">{{ a.details }}, {{ a.city }}</span>
                        <span class="block text-gray-500">{{ a.phone }}</span>
                      </span>
                    </label>
                  }
                  <label class="option" [class.selected]="selectedAddress() === 'new'">
                    <input type="radio" name="addr" class="mt-1 accent-brand-500" [checked]="selectedAddress() === 'new'" (change)="useAddress('new')" />
                    <span class="text-sm font-semibold text-gray-900">Use a new address</span>
                  </label>
                </div>
              }

              @if (selectedAddress() === 'new') {
                <div class="mt-4 grid gap-4 sm:grid-cols-2">
                  <div class="sm:col-span-2">
                    <label class="label" for="details">Street address</label>
                    <input id="details" class="input" formControlName="details" autocomplete="street-address" placeholder="Building, street, area" [class.invalid]="invalid('details')" />
                    <app-field-error [control]="form.get('details')" label="Street address" />
                  </div>
                  <div>
                    <label class="label" for="city">City</label>
                    <input id="city" class="input" formControlName="city" autocomplete="address-level2" placeholder="Cairo" [class.invalid]="invalid('city')" />
                    <app-field-error [control]="form.get('city')" label="City" />
                  </div>
                  <div>
                    <label class="label" for="phone">Phone</label>
                    <input id="phone" class="input" formControlName="phone" type="tel" autocomplete="tel" placeholder="01012345678" [class.invalid]="invalid('phone')" />
                    <app-field-error [control]="form.get('phone')" label="Phone" [hint]="phoneHint" />
                  </div>
                  <label class="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
                    <input type="checkbox" formControlName="save" class="size-4 accent-brand-500" /> Save this address for next time
                  </label>
                </div>
              }
            </section>

            <!-- Payment -->
            <section class="card p-5">
              <h2 class="flex items-center gap-2 font-semibold text-gray-900"><lucide-icon [img]="I.CreditCard" [size]="18" class="text-brand-600" /> Payment method</h2>
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <label class="option" [class.selected]="form.value.payment === 'card'">
                  <input type="radio" value="card" formControlName="payment" class="mt-1 accent-brand-500" />
                  <span class="text-sm">
                    <span class="flex items-center gap-1.5 font-semibold text-gray-900"><lucide-icon [img]="I.CreditCard" [size]="16" /> Pay online</span>
                    <span class="block text-gray-500">Card payment via Stripe</span>
                  </span>
                </label>
                <label class="option" [class.selected]="form.value.payment === 'cash'">
                  <input type="radio" value="cash" formControlName="payment" class="mt-1 accent-brand-500" />
                  <span class="text-sm">
                    <span class="flex items-center gap-1.5 font-semibold text-gray-900"><lucide-icon [img]="I.Banknote" [size]="16" /> Cash on delivery</span>
                    <span class="block text-gray-500">Pay when your order arrives</span>
                  </span>
                </label>
              </div>
            </section>
          </div>

          <!-- Summary -->
          <aside class="card h-fit p-5 lg:sticky lg:top-24">
            <h2 class="font-semibold text-gray-900">Order summary</h2>
            <ul class="mt-4 max-h-64 space-y-3 overflow-y-auto">
              @for (item of cart.cart()!.data.products; track item._id) {
                <li class="flex items-center gap-3 text-sm">
                  <img [src]="item.product.imageCover" alt="" class="size-12 rounded-md object-cover" />
                  <span class="line-clamp-2 flex-1">{{ item.product.title }} <span class="text-gray-500">× {{ item.count }}</span></span>
                  <span class="font-medium">{{ item.price * item.count | egp }}</span>
                </li>
              }
            </ul>
            <div class="mt-4 flex justify-between border-t border-gray-100 pt-4 text-base">
              <span class="font-semibold">Total</span><span class="font-bold">{{ total() | egp }}</span>
            </div>
            <button type="submit" class="btn-primary mt-5 w-full" [disabled]="submitting()">
              @if (submitting()) { <lucide-icon [img]="I.LoaderCircle" [size]="16" class="animate-spin" /> }
              {{ form.value.payment === 'card' ? 'Continue to payment' : 'Place order' }}
            </button>
          </aside>
        </form>
      }
    </div>
  `,
  styles: `
    @reference "../../styles.css";
    .option { @apply flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3.5 hover:border-gray-300; }
    .option.selected { @apply border-brand-500 bg-brand-50/50 ring-1 ring-brand-500; }
  `,
})
export class Checkout {
  protected readonly cart = inject(CartService);
  private orders = inject(OrdersService);
  private toast = inject(ToastService);
  private router = inject(Router);
  protected readonly I = I;
  protected readonly phoneHint = PHONE_HINT;

  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly total = computed(() => this.cart.cart()?.data.totalCartPrice ?? 0);

  protected readonly addresses = rxResource({ stream: () => this.orders.getAddresses() });
  private readonly picked = signal<string | null>(null);
  /** Defaults to the first saved address, or the new-address form when there are none. */
  protected readonly selectedAddress = computed(() => this.picked() ?? this.addresses.value()?.[0]?._id ?? 'new');

  protected readonly form = inject(FormBuilder).nonNullable.group({
    details: ['', [Validators.required, Validators.minLength(5)]],
    city: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', EG_PHONE],
    save: [true],
    payment: ['card' as 'card' | 'cash'],
  });

  constructor() {
    this.cart.load().subscribe({ next: () => this.loading.set(false), error: () => { this.cart.cart.set(null); this.loading.set(false); } });
  }

  useAddress(id: string) { this.picked.set(id); }

  invalid(name: string) {
    const c = this.form.get(name);
    return !!c && c.invalid && c.touched;
  }

  placeOrder() {
    let address: ShippingAddress;
    const selected = this.selectedAddress();
    if (selected === 'new') {
      const { details, city, phone } = this.form.controls;
      [details, city, phone].forEach((c) => c.markAsTouched());
      if (details.invalid || city.invalid || phone.invalid) {
        this.toast.error('Please complete your shipping address.');
        return;
      }
      address = { details: details.value.trim(), city: city.value.trim(), phone: phone.value.trim() };
      if (this.form.value.save) {
        this.orders.addAddress({ name: `${address.city} address`, ...address }).subscribe({ error: () => { /* saving is optional */ } });
      }
    } else {
      const a = this.addresses.value()!.find((x) => x._id === selected)!;
      address = { details: a.details, city: a.city, phone: a.phone };
    }

    const cartId = this.cart.cart()!.cartId;
    this.submitting.set(true);

    if (this.form.value.payment === 'card') {
      // Stripe sends the user to `${url}/allorders`; use the app's base URL so this works under a sub-path (GitHub Pages).
      this.orders.createCheckoutSession(cartId, address, document.baseURI.replace(/\/$/, '')).subscribe({
        next: (url) => { window.location.href = url; },
        error: (e) => { this.toast.error(apiError(e)); this.submitting.set(false); },
      });
    } else {
      this.orders.createCashOrder(cartId, address).subscribe({
        next: () => {
          this.cart.reset();
          this.toast.success('Order placed! You will pay on delivery.');
          this.router.navigate(['/allorders']);
        },
        error: (e) => { this.toast.error(apiError(e)); this.submitting.set(false); },
      });
    }
  }
}

