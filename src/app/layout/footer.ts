import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { I } from '../shared/icons';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, LucideAngularModule],
  template: `
    <footer class="mt-20 border-t border-gray-200 bg-white">
      <div class="container-x grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <a routerLink="/" class="flex items-center gap-2 text-xl font-extrabold text-gray-900">
            <span class="flex size-9 items-center justify-center rounded-lg bg-brand-500 text-white"><lucide-icon [img]="I.ShoppingCart" [size]="19" /></span>
            Fresh<span class="-ml-2 text-brand-500">Cart</span>
          </a>
          <p class="mt-4 text-sm leading-relaxed text-gray-500">Groceries, fashion, electronics and more, delivered fresh to your door anywhere in Egypt.</p>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-900">Shop</h3>
          <ul class="mt-4 space-y-2.5 text-sm text-gray-500">
            <li><a routerLink="/products" class="hover:text-brand-600">All products</a></li>
            <li><a routerLink="/categories" class="hover:text-brand-600">Categories</a></li>
            <li><a routerLink="/brands" class="hover:text-brand-600">Brands</a></li>
          </ul>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-900">Account</h3>
          <ul class="mt-4 space-y-2.5 text-sm text-gray-500">
            <li><a routerLink="/cart" class="hover:text-brand-600">Cart</a></li>
            <li><a routerLink="/wishlist" class="hover:text-brand-600">Wishlist</a></li>
            <li><a routerLink="/allorders" class="hover:text-brand-600">Orders</a></li>
          </ul>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-900">Contact</h3>
          <ul class="mt-4 space-y-2.5 text-sm text-gray-500">
            <li class="flex items-center gap-2"><lucide-icon [img]="I.Phone" [size]="15" /> 19999</li>
            <li class="flex items-center gap-2"><lucide-icon [img]="I.Mail" [size]="15" /> support&#64;freshcart.com</li>
            <li class="flex items-center gap-2"><lucide-icon [img]="I.MapPin" [size]="15" /> Cairo, Egypt</li>
          </ul>
        </div>
      </div>
      <div class="border-t border-gray-100 py-5 text-center text-xs text-gray-400">© {{ year }} FreshCart. All rights reserved.</div>
    </footer>
  `,
})
export class Footer {
  protected readonly I = I;
  protected readonly year = new Date().getFullYear();
}
