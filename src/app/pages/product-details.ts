import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { map, switchMap } from 'rxjs';
import { apiError } from '../core/api';
import { AuthService } from '../core/services/auth.service';
import { CartService } from '../core/services/cart.service';
import { CatalogService } from '../core/services/catalog.service';
import { ToastService } from '../core/services/toast.service';
import { WishlistService } from '../core/services/wishlist.service';
import { EgpPipe } from '../shared/egp.pipe';
import { EmptyState } from '../shared/empty-state';
import { I } from '../shared/icons';
import { ProductGrid } from '../shared/product-grid';
import { Spinner } from '../shared/spinner';
import { Stars } from '../shared/stars';

@Component({
  selector: 'app-product-details',
  imports: [RouterLink, LucideAngularModule, EgpPipe, Spinner, Stars, ProductGrid, EmptyState, FormsModule, DatePipe],
  template: `
    <div class="container-x py-8">
      @if (product.isLoading()) {
        <app-spinner label="Loading product…" />
      } @else if (product.error()) {
        <app-empty-state [icon]="I.CircleAlert" title="Product not found" text="It may have been removed or the link is wrong." actionLabel="Back to products" />
      } @else if (product.value(); as p) {
        <nav class="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
          <a routerLink="/" class="hover:text-brand-600">Home</a> /
          <a routerLink="/products" class="hover:text-brand-600">Products</a> /
          <a [routerLink]="['/categories', p.category._id]" class="hover:text-brand-600">{{ p.category.name }}</a> /
          <span class="line-clamp-1 text-gray-800">{{ p.title }}</span>
        </nav>

        <div class="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <!-- Gallery -->
          <div>
            <div class="card aspect-square overflow-hidden">
              <img [src]="activeImage()" [alt]="p.title" class="size-full object-contain" />
            </div>
            <div class="mt-3 grid grid-cols-5 gap-2">
              @for (img of images(); track img) {
                <button (click)="activeImage.set(img)" class="aspect-square overflow-hidden rounded-lg border-2 bg-white"
                  [class]="img === activeImage() ? 'border-brand-500' : 'border-transparent hover:border-gray-300'" [attr.aria-label]="'View image ' + ($index + 1)">
                  <img [src]="img" alt="" class="size-full object-cover" />
                </button>
              }
            </div>
          </div>

          <!-- Info -->
          <div>
            <div class="flex flex-wrap gap-2">
              <a [routerLink]="['/categories', p.category._id]" class="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{{ p.category.name }}</a>
              @if (p.brand) { <a [routerLink]="['/brands', p.brand._id]" class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">{{ p.brand.name }}</a> }
            </div>
            <h1 class="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">{{ p.title }}</h1>
            <div class="mt-3 flex items-center gap-2 text-sm">
              <app-stars [rating]="p.ratingsAverage" [size]="16" />
              <span class="font-semibold">{{ p.ratingsAverage }}</span>
              <span class="text-gray-500">({{ p.ratingsQuantity }} reviews) · {{ p.sold }} sold</span>
            </div>

            <div class="mt-5 flex items-baseline gap-3">
              <span class="text-3xl font-extrabold text-gray-900">{{ (p.priceAfterDiscount ?? p.price) | egp }}</span>
              @if (p.priceAfterDiscount) { <span class="text-lg text-gray-400 line-through">{{ p.price | egp }}</span> }
            </div>
            <p class="mt-2 text-sm" [class]="p.quantity > 0 ? 'text-brand-600' : 'text-red-600'">
              {{ p.quantity > 0 ? 'In stock (' + p.quantity + ' available)' : 'Out of stock' }}
            </p>

            <p class="mt-5 whitespace-pre-line text-sm leading-relaxed text-gray-600">{{ p.description }}</p>

            <div class="mt-6 flex flex-wrap items-center gap-3">
              <div class="flex items-center rounded-lg border border-gray-300 bg-white">
                <button class="flex size-11 items-center justify-center text-gray-600 hover:text-brand-600 disabled:opacity-40" [disabled]="qty() <= 1" (click)="qty.set(qty() - 1)" aria-label="Decrease quantity">
                  <lucide-icon [img]="I.Minus" [size]="16" />
                </button>
                <span class="w-10 text-center font-semibold" aria-live="polite">{{ qty() }}</span>
                <button class="flex size-11 items-center justify-center text-gray-600 hover:text-brand-600 disabled:opacity-40" [disabled]="qty() >= p.quantity" (click)="qty.set(qty() + 1)" aria-label="Increase quantity">
                  <lucide-icon [img]="I.Plus" [size]="16" />
                </button>
              </div>
              <button class="btn-primary h-11 flex-1 sm:flex-none sm:px-8" [disabled]="adding() || p.quantity === 0" (click)="addToCart()">
                @if (adding()) { <lucide-icon [img]="I.LoaderCircle" [size]="18" class="animate-spin" /> } @else { <lucide-icon [img]="I.ShoppingCart" [size]="18" /> }
                Add to cart
              </button>
              <button class="btn-outline size-11 p-0" [class.text-red-500]="inWishlist()" (click)="toggleWishlist()" [disabled]="wishBusy()"
                [attr.aria-label]="inWishlist() ? 'Remove from wishlist' : 'Add to wishlist'" [attr.aria-pressed]="inWishlist()">
                <lucide-icon [img]="I.Heart" [size]="18" [class.fill-red-500]="inWishlist()" />
              </button>
            </div>

            <ul class="mt-8 grid gap-3 border-t border-gray-200 pt-6 text-sm text-gray-600 sm:grid-cols-2">
              <li class="flex items-center gap-2"><lucide-icon [img]="I.Truck" [size]="18" class="text-brand-600" /> Free delivery on orders over 500 EGP</li>
              <li class="flex items-center gap-2"><lucide-icon [img]="I.RotateCcw" [size]="18" class="text-brand-600" /> 14-day easy returns</li>
            </ul>
          </div>
        </div>

        <!-- Reviews -->
        <section class="mt-14 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Customer reviews</h2>
            @if (reviews.value()?.length) {
              <ul class="mt-5 space-y-4">
                @for (r of reviews.value(); track r._id) {
                  <li class="card p-4">
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2">
                        <span class="flex size-8 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">{{ r.user.name.charAt(0) }}</span>
                        <span class="text-sm font-semibold">{{ r.user.name }}</span>
                      </div>
                      <span class="text-xs text-gray-400">{{ r.createdAt | date: 'mediumDate' }}</span>
                    </div>
                    <app-stars class="mt-2 block" [rating]="r.rating" />
                    <p class="mt-2 text-sm text-gray-600">{{ r.review }}</p>
                  </li>
                }
              </ul>
            } @else if (!reviews.isLoading()) {
              <p class="mt-4 text-sm text-gray-500">No reviews yet. Be the first to share your thoughts.</p>
            }
          </div>
          <div class="card h-fit p-5">
            <h3 class="font-semibold text-gray-900">Write a review</h3>
            @if (auth.isLoggedIn()) {
              <form class="mt-4 space-y-4" (ngSubmit)="submitReview()">
                <fieldset>
                  <legend class="label">Your rating</legend>
                  <div class="flex gap-1">
                    @for (n of [1,2,3,4,5]; track n) {
                      <button type="button" (click)="rating.set(n)" [attr.aria-label]="n + ' stars'" [attr.aria-pressed]="rating() === n">
                        <lucide-icon [img]="I.Star" [size]="26" [class]="n <= rating() ? 'fill-amber-400 text-amber-400' : 'text-gray-300'" />
                      </button>
                    }
                  </div>
                </fieldset>
                <div>
                  <label class="label" for="review">Your review</label>
                  <textarea id="review" name="review" rows="3" class="input" [(ngModel)]="reviewText" placeholder="What did you like or dislike?"></textarea>
                </div>
                <button class="btn-primary w-full" [disabled]="posting() || !rating() || reviewText.trim().length < 3">
                  @if (posting()) { <lucide-icon [img]="I.LoaderCircle" [size]="16" class="animate-spin" /> } Post review
                </button>
              </form>
            } @else {
              <p class="mt-2 text-sm text-gray-500"><a routerLink="/login" class="font-semibold text-brand-600 hover:underline">Sign in</a> to write a review.</p>
            }
          </div>
        </section>

        <!-- Related -->
        @if (related.value()?.length) {
          <section class="mt-14">
            <h2 class="mb-5 text-xl font-bold text-gray-900">You may also like</h2>
            <app-product-grid [products]="related.value()!" />
          </section>
        }
      }
    </div>
  `,
})
export class ProductDetails {
  readonly id = input.required<string>();

  private catalog = inject(CatalogService);
  private cart = inject(CartService);
  private wishlist = inject(WishlistService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private title = inject(Title);
  protected readonly auth = inject(AuthService);
  protected readonly I = I;

  protected readonly product = rxResource({ params: () => this.id(), stream: ({ params }) => this.catalog.getProduct(params) });
  protected readonly reviews = rxResource({ params: () => this.id(), stream: ({ params }) => this.catalog.getReviews(params) });
  protected readonly related = rxResource({
    params: () => this.product.value(),
    stream: ({ params: p }) =>
      this.catalog.getProducts({ category: p!.category._id, limit: 11 }).pipe(map((r) => r.data.filter((x) => x._id !== p!._id).slice(0, 10))),
  });

  protected readonly images = computed(() => {
    const p = this.product.value();
    return p ? [p.imageCover, ...p.images.filter((i) => i !== p.imageCover)].slice(0, 5) : [];
  });
  protected readonly activeImage = signal('');
  protected readonly qty = signal(1);
  protected readonly adding = signal(false);
  protected readonly wishBusy = signal(false);
  protected readonly inWishlist = computed(() => this.wishlist.ids().has(this.id()));

  protected readonly rating = signal(0);
  protected reviewText = '';
  protected readonly posting = signal(false);

  constructor() {
    effect(() => {
      const p = this.product.value();
      if (p) {
        this.activeImage.set(p.imageCover);
        this.qty.set(1);
        this.title.setTitle(`${p.title} | FreshCart`);
      }
    });
  }

  private requireLogin() {
    if (this.auth.isLoggedIn()) return true;
    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
    return false;
  }

  addToCart() {
    if (!this.requireLogin()) return;
    const id = this.id();
    const qty = this.qty();
    this.adding.set(true);
    // The API adds one unit; set the chosen quantity afterwards when it is more than one.
    this.cart.add(id).pipe(
      switchMap(() => this.cart.load()),
      switchMap((c) => {
        const item = c.data.products.find((x) => x.product._id === id || x.product.id === id);
        const target = (item?.count ?? 1) + qty - 1;
        return qty > 1 ? this.cart.updateCount(id, target) : [c];
      }),
    ).subscribe({
      next: () => { this.toast.success(`Added ${qty > 1 ? qty + ' items' : ''} to cart`.replace('  ', ' ')); this.adding.set(false); },
      error: (e) => { this.toast.error(apiError(e)); this.adding.set(false); },
    });
  }

  toggleWishlist() {
    if (!this.requireLogin()) return;
    const removing = this.inWishlist();
    this.wishBusy.set(true);
    (removing ? this.wishlist.remove(this.id()) : this.wishlist.add(this.id())).subscribe({
      next: () => { this.toast.success(removing ? 'Removed from wishlist' : 'Added to wishlist'); this.wishBusy.set(false); },
      error: (e) => { this.toast.error(apiError(e)); this.wishBusy.set(false); },
    });
  }

  submitReview() {
    this.posting.set(true);
    this.catalog.addReview(this.id(), this.reviewText.trim(), this.rating()).subscribe({
      next: () => {
        this.toast.success('Thanks! Your review was posted.');
        this.reviewText = '';
        this.rating.set(0);
        this.posting.set(false);
        this.reviews.reload();
      },
      error: (e) => { this.toast.error(apiError(e)); this.posting.set(false); },
    });
  }
}
