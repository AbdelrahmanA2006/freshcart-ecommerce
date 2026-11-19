import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { filter } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { CartService } from '../core/services/cart.service';
import { WishlistService } from '../core/services/wishlist.service';
import { I } from '../shared/icons';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <header class="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div class="container-x flex h-16 items-center gap-4">
        <a routerLink="/" class="flex items-center gap-2 text-xl font-extrabold text-gray-900" aria-label="FreshCart home">
          <span class="flex size-9 items-center justify-center rounded-lg bg-brand-500 text-white">
            <lucide-icon [img]="I.ShoppingCart" [size]="19" />
          </span>
          Fresh<span class="-ml-2 text-brand-500">Cart</span>
        </a>

        <nav class="ml-6 hidden items-center gap-1 lg:flex" aria-label="Main">
          @for (l of links; track l.path) {
            <a [routerLink]="l.path" routerLinkActive="text-brand-600 bg-brand-50" [routerLinkActiveOptions]="{ exact: l.path === '/' }"
              class="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:text-brand-600">{{ l.label }}</a>
          }
        </nav>

        <form class="ml-auto hidden max-w-xs flex-1 md:block" (submit)="search($event, q.value)" role="search">
          <label class="relative block">
            <span class="sr-only">Search products</span>
            <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400"><lucide-icon [img]="I.Search" [size]="16" /></span>
            <input #q type="search" placeholder="Search products…" class="input py-2 pl-9" />
          </label>
        </form>

        <div class="ml-auto flex items-center gap-1 md:ml-2">
          @if (auth.isLoggedIn()) {
            <a routerLink="/wishlist" class="relative flex size-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-brand-600" aria-label="Wishlist">
              <lucide-icon [img]="I.Heart" [size]="20" />
              @if (wishlist.count()) { <span class="badge">{{ wishlist.count() }}</span> }
            </a>
            <a routerLink="/cart" class="relative flex size-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-brand-600" aria-label="Cart">
              <lucide-icon [img]="I.ShoppingCart" [size]="20" />
              @if (cart.count()) { <span class="badge">{{ cart.count() }}</span> }
            </a>
            <div class="relative hidden lg:block">
              <button (click)="userMenu.set(!userMenu())" class="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100" [attr.aria-expanded]="userMenu()" aria-haspopup="menu">
                <span class="flex size-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">{{ initial() }}</span>
                <span class="max-w-24 truncate text-sm font-medium">{{ auth.user()?.name }}</span>
              </button>
              @if (userMenu()) {
                <div class="absolute right-0 mt-2 w-52 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg" role="menu">
                  <a routerLink="/profile" class="menu-item" role="menuitem"><lucide-icon [img]="I.User" [size]="16" /> My profile</a>
                  <a routerLink="/allorders" class="menu-item" role="menuitem"><lucide-icon [img]="I.Package" [size]="16" /> My orders</a>
                  <a routerLink="/change-password" class="menu-item" role="menuitem"><lucide-icon [img]="I.KeyRound" [size]="16" /> Change password</a>
                  <hr class="my-1 border-gray-100" />
                  <button (click)="auth.logout()" class="menu-item w-full text-red-600" role="menuitem"><lucide-icon [img]="I.LogOut" [size]="16" /> Sign out</button>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/login" class="btn-outline hidden py-2 sm:inline-flex">Sign in</a>
            <a routerLink="/register" class="btn-primary hidden py-2 sm:inline-flex">Register</a>
          }
          <button class="flex size-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 lg:hidden" (click)="mobile.set(!mobile())"
            [attr.aria-expanded]="mobile()" aria-label="Menu">
            <lucide-icon [img]="mobile() ? I.X : I.Menu" [size]="22" />
          </button>
        </div>
      </div>

      @if (mobile()) {
        <div class="border-t border-gray-200 bg-white lg:hidden">
          <div class="container-x space-y-1 py-3">
            <form (submit)="search($event, mq.value)" role="search" class="mb-2 md:hidden">
              <input #mq type="search" placeholder="Search products…" class="input" aria-label="Search products" />
            </form>
            @for (l of links; track l.path) {
              <a [routerLink]="l.path" class="block rounded-lg px-3 py-2.5 font-medium hover:bg-gray-50">{{ l.label }}</a>
            }
            <hr class="border-gray-100" />
            @if (auth.isLoggedIn()) {
              <a routerLink="/profile" class="block rounded-lg px-3 py-2.5 font-medium hover:bg-gray-50">My profile</a>
              <a routerLink="/allorders" class="block rounded-lg px-3 py-2.5 font-medium hover:bg-gray-50">My orders</a>
              <a routerLink="/change-password" class="block rounded-lg px-3 py-2.5 font-medium hover:bg-gray-50">Change password</a>
              <button (click)="auth.logout()" class="block w-full rounded-lg px-3 py-2.5 text-left font-medium text-red-600 hover:bg-red-50">Sign out</button>
            } @else {
              <div class="grid grid-cols-2 gap-2 pt-2">
                <a routerLink="/login" class="btn-outline">Sign in</a>
                <a routerLink="/register" class="btn-primary">Register</a>
              </div>
            }
          </div>
        </div>
      }
    </header>
  `,
  styles: `
    @reference "../../styles.css";
    .badge { @apply absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-white; }
    .menu-item { @apply flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50; }
  `,
})
export class Navbar {
  protected readonly auth = inject(AuthService);
  protected readonly cart = inject(CartService);
  protected readonly wishlist = inject(WishlistService);
  private router = inject(Router);
  protected readonly I = I;

  protected readonly mobile = signal(false);
  protected readonly userMenu = signal(false);
  protected readonly links = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
    { path: '/categories', label: 'Categories' },
    { path: '/brands', label: 'Brands' },
  ];

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.mobile.set(false);
      this.userMenu.set(false);
    });
  }

  protected initial() {
    return (this.auth.user()?.name ?? '?').charAt(0).toUpperCase();
  }

  protected search(event: Event, value: string) {
    event.preventDefault();
    const q = value.trim();
    this.router.navigate(['/products'], { queryParams: q ? { q } : {} });
  }
}
