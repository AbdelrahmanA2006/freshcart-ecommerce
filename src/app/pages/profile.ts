import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { apiError } from '../core/api';
import { AuthService } from '../core/services/auth.service';
import { OrdersService } from '../core/services/orders.service';
import { ToastService } from '../core/services/toast.service';
import { FieldError } from '../shared/field-error';
import { I } from '../shared/icons';
import { EG_PHONE, PHONE_HINT } from '../shared/validators';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule, FieldError],
  template: `
    <div class="container-x py-8">
      <h1 class="page-title">My profile</h1>
      <div class="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside class="card h-fit p-5">
          <div class="flex items-center gap-3">
            <span class="flex size-12 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">{{ (auth.user()?.name ?? '?').charAt(0) }}</span>
            <div class="min-w-0">
              <p class="truncate font-semibold">{{ auth.user()?.name }}</p>
              <p class="truncate text-sm text-gray-500">{{ auth.profile()?.email }}</p>
            </div>
          </div>
          <nav class="mt-5 space-y-1 text-sm">
            <a routerLink="/allorders" class="side-link"><lucide-icon [img]="I.Package" [size]="16" /> My orders</a>
            <a routerLink="/wishlist" class="side-link"><lucide-icon [img]="I.Heart" [size]="16" /> Wishlist</a>
            <a routerLink="/change-password" class="side-link"><lucide-icon [img]="I.KeyRound" [size]="16" /> Change password</a>
            <button (click)="auth.logout()" class="side-link w-full text-red-600"><lucide-icon [img]="I.LogOut" [size]="16" /> Sign out</button>
          </nav>
        </aside>

        <div class="space-y-6">
          <section class="card p-5">
            <h2 class="font-semibold text-gray-900">Personal information</h2>
            <form [formGroup]="info" (ngSubmit)="saveInfo()" class="mt-4 grid gap-4 sm:grid-cols-2" novalidate>
              <div>
                <label class="label" for="name">Full name</label>
                <input id="name" class="input" formControlName="name" autocomplete="name" />
                <app-field-error [control]="info.controls.name" label="Name" />
              </div>
              <div>
                <label class="label" for="email">Email</label>
                <input id="email" type="email" class="input" formControlName="email" autocomplete="email" />
                <app-field-error [control]="info.controls.email" label="Email" />
              </div>
              <div>
                <label class="label" for="phone">Phone</label>
                <input id="phone" type="tel" class="input" formControlName="phone" autocomplete="tel" placeholder="01012345678" />
                <app-field-error [control]="info.controls.phone" label="Phone" [hint]="phoneHint" />
              </div>
              <div class="flex items-end">
                <button class="btn-primary" [disabled]="savingInfo()">
                  @if (savingInfo()) { <lucide-icon [img]="I.LoaderCircle" [size]="16" class="animate-spin" /> } Save changes
                </button>
              </div>
            </form>
          </section>

          <section class="card p-5">
            <h2 class="font-semibold text-gray-900">Saved addresses</h2>
            @if (addresses.value()?.length) {
              <ul class="mt-4 grid gap-3 sm:grid-cols-2">
                @for (a of addresses.value(); track a._id) {
                  <li class="flex items-start justify-between gap-3 rounded-lg border border-gray-200 p-3.5 text-sm">
                    <div>
                      <p class="font-semibold">{{ a.name }}</p>
                      <p class="text-gray-600">{{ a.details }}, {{ a.city }}</p>
                      <p class="text-gray-500">{{ a.phone }}</p>
                    </div>
                    <button class="text-gray-400 hover:text-red-600" (click)="removeAddress(a._id, a.name)" [attr.aria-label]="'Delete address ' + a.name">
                      <lucide-icon [img]="I.Trash2" [size]="16" />
                    </button>
                  </li>
                }
              </ul>
            } @else if (!addresses.isLoading()) {
              <p class="mt-2 text-sm text-gray-500">No saved addresses yet. Add one to check out faster.</p>
            }

            <form [formGroup]="address" (ngSubmit)="addAddress()" class="mt-5 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2" novalidate>
              <div>
                <label class="label" for="aname">Label</label>
                <input id="aname" class="input" formControlName="name" placeholder="Home, Work…" />
                <app-field-error [control]="address.controls.name" label="Label" />
              </div>
              <div>
                <label class="label" for="acity">City</label>
                <input id="acity" class="input" formControlName="city" autocomplete="address-level2" />
                <app-field-error [control]="address.controls.city" label="City" />
              </div>
              <div class="sm:col-span-2">
                <label class="label" for="adetails">Street address</label>
                <input id="adetails" class="input" formControlName="details" autocomplete="street-address" />
                <app-field-error [control]="address.controls.details" label="Street address" />
              </div>
              <div>
                <label class="label" for="aphone">Phone</label>
                <input id="aphone" type="tel" class="input" formControlName="phone" placeholder="01012345678" />
                <app-field-error [control]="address.controls.phone" label="Phone" [hint]="phoneHint" />
              </div>
              <div class="flex items-end">
                <button class="btn-outline" [disabled]="savingAddress()"><lucide-icon [img]="I.Plus" [size]="16" /> Add address</button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: `
    @reference "../../styles.css";
    .side-link { @apply flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-50; }
  `,
})
export class Profile {
  protected readonly auth = inject(AuthService);
  private orders = inject(OrdersService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder).nonNullable;
  protected readonly I = I;
  protected readonly phoneHint = PHONE_HINT;
  protected readonly savingInfo = signal(false);
  protected readonly savingAddress = signal(false);

  protected readonly addresses = rxResource({ stream: () => this.orders.getAddresses() });

  protected readonly info = this.fb.group({
    name: [this.auth.user()?.name ?? '', [Validators.required, Validators.minLength(3)]],
    email: [this.auth.profile()?.email ?? '', [Validators.required, Validators.email]],
    phone: ['', EG_PHONE],
  });

  protected readonly address = this.fb.group({
    name: ['', Validators.required],
    details: ['', [Validators.required, Validators.minLength(5)]],
    city: ['', Validators.required],
    phone: ['', EG_PHONE],
  });

  saveInfo() {
    this.info.markAllAsTouched();
    if (this.info.invalid) return;
    this.savingInfo.set(true);
    this.auth.updateMe(this.info.getRawValue()).subscribe({
      next: () => { this.toast.success('Profile updated'); this.savingInfo.set(false); },
      error: (e) => { this.toast.error(apiError(e)); this.savingInfo.set(false); },
    });
  }

  addAddress() {
    this.address.markAllAsTouched();
    if (this.address.invalid) return;
    this.savingAddress.set(true);
    this.orders.addAddress(this.address.getRawValue()).subscribe({
      next: (list) => {
        this.addresses.set(list);
        this.address.reset();
        this.toast.success('Address saved');
        this.savingAddress.set(false);
      },
      error: (e) => { this.toast.error(apiError(e)); this.savingAddress.set(false); },
    });
  }

  removeAddress(id: string, name: string) {
    if (!confirm(`Delete the address "${name}"?`)) return;
    this.orders.removeAddress(id).subscribe({
      next: (list) => { this.addresses.set(list); this.toast.success('Address deleted'); },
      error: (e) => this.toast.error(apiError(e)),
    });
  }
}
