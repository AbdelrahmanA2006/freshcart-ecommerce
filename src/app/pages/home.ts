import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { map } from 'rxjs';
import { CatalogService } from '../core/services/catalog.service';
import { I } from '../shared/icons';
import { ProductGrid } from '../shared/product-grid';
import { SkeletonGrid } from '../shared/skeleton-grid';

@Component({
  selector: 'app-home',
  imports: [RouterLink, LucideAngularModule, ProductGrid, SkeletonGrid],
  template: `
    <!-- Hero slider -->
    <section class="container-x pt-6">
      <div class="grid gap-4 lg:grid-cols-3">
        <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-emerald-800 text-white lg:col-span-2">
          @for (s of slides; track s.title; let i = $index) {
            <div class="grid min-h-80 items-center gap-6 p-8 transition-opacity duration-700 sm:grid-cols-2 sm:p-12"
              [class]="i === slide() ? 'relative opacity-100' : 'pointer-events-none absolute inset-0 opacity-0'" [attr.aria-hidden]="i !== slide()">
              <div>
                <p class="text-sm font-semibold uppercase tracking-wider text-brand-100">{{ s.kicker }}</p>
                <h1 class="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">{{ s.title }}</h1>
                <p class="mt-3 text-brand-50/90">{{ s.text }}</p>
                <a [routerLink]="s.link" class="btn mt-6 bg-white text-brand-700 hover:bg-brand-50">{{ s.cta }} <lucide-icon [img]="I.ArrowRight" [size]="16" /></a>
              </div>
              @if (heroImages()[i]; as img) {
                <img [src]="img" alt="" class="mx-auto hidden max-h-64 rounded-xl object-cover shadow-2xl sm:block" />
              }
            </div>
          }
          <div class="absolute bottom-5 left-8 flex gap-2 sm:left-12">
            @for (s of slides; track s.title; let i = $index) {
              <button (click)="goTo(i)" class="h-2 rounded-full transition-all" [class]="i === slide() ? 'w-7 bg-white' : 'w-2 bg-white/50'" [attr.aria-label]="'Slide ' + (i + 1)"></button>
            }
          </div>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <a routerLink="/products" [queryParams]="{ sort: '-sold' }" class="group flex flex-col justify-between rounded-2xl bg-amber-100 p-6">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-amber-700">Trending now</p>
              <h2 class="mt-2 text-xl font-bold text-gray-900">Best sellers this week</h2>
            </div>
            <span class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-800 group-hover:gap-2 transition-all">Shop now <lucide-icon [img]="I.ArrowRight" [size]="15" /></span>
          </a>
          <a routerLink="/brands" class="group flex flex-col justify-between rounded-2xl bg-sky-100 p-6">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-sky-700">Top brands</p>
              <h2 class="mt-2 text-xl font-bold text-gray-900">Shop by your favourite brand</h2>
            </div>
            <span class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-800 group-hover:gap-2 transition-all">Explore brands <lucide-icon [img]="I.ArrowRight" [size]="15" /></span>
          </a>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="container-x mt-8">
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        @for (f of features; track f.title) {
          <div class="card flex items-center gap-3 p-4">
            <span class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><lucide-icon [img]="f.icon" [size]="20" /></span>
            <div>
              <p class="text-sm font-semibold text-gray-900">{{ f.title }}</p>
              <p class="text-xs text-gray-500">{{ f.text }}</p>
            </div>
          </div>
        }
      </div>
    </section>

    <!-- Categories -->
    <section class="container-x mt-14">
      <div class="mb-5 flex items-end justify-between">
        <h2 class="text-xl font-bold text-gray-900 sm:text-2xl">Shop by category</h2>
        <a routerLink="/categories" class="text-sm font-semibold text-brand-600 hover:underline">View all</a>
      </div>
      <div class="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
        @if (categories.hasValue()) {
          @for (c of categories.value(); track c._id) {
            <a [routerLink]="['/categories', c._id]" class="group w-32 shrink-0 snap-start sm:w-auto">
              <div class="aspect-square overflow-hidden rounded-xl bg-gray-100">
                <img [src]="c.image" [alt]="c.name" loading="lazy" class="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              <p class="mt-2 text-center text-sm font-semibold text-gray-800 group-hover:text-brand-600">{{ c.name }}</p>
            </a>
          }
        } @else {
          @for (i of [1,2,3,4,5]; track i) { <div class="aspect-square w-32 shrink-0 animate-pulse rounded-xl bg-gray-200 sm:w-auto"></div> }
        }
      </div>
    </section>

    <!-- Best sellers -->
    <section class="container-x mt-14">
      <div class="mb-5 flex items-end justify-between">
        <h2 class="text-xl font-bold text-gray-900 sm:text-2xl">Best sellers</h2>
        <a routerLink="/products" [queryParams]="{ sort: '-sold' }" class="text-sm font-semibold text-brand-600 hover:underline">View all</a>
      </div>
      @if (bestSellers.hasValue()) { <app-product-grid [products]="bestSellers.value()" /> }
      @else if (bestSellers.error()) { <p class="text-sm text-red-600">Couldn't load products. Refresh the page to try again.</p> }
      @else { <app-skeleton-grid [count]="10" /> }
    </section>

    <!-- Brands -->
    <section class="container-x mt-14">
      <div class="mb-5 flex items-end justify-between">
        <h2 class="text-xl font-bold text-gray-900 sm:text-2xl">Popular brands</h2>
        <a routerLink="/brands" class="text-sm font-semibold text-brand-600 hover:underline">View all</a>
      </div>
      <div class="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        @for (b of topBrands(); track b._id) {
          <a [routerLink]="['/brands', b._id]" class="card flex aspect-[4/3] items-center justify-center p-3 transition-shadow hover:shadow-md" [attr.aria-label]="b.name">
            <img [src]="b.image" [alt]="b.name" loading="lazy" class="max-h-full object-contain" />
          </a>
        }
      </div>
    </section>

    <!-- Top rated -->
    <section class="container-x mt-14">
      <div class="mb-5 flex items-end justify-between">
        <h2 class="text-xl font-bold text-gray-900 sm:text-2xl">Top rated</h2>
        <a routerLink="/products" [queryParams]="{ sort: '-ratingsAverage' }" class="text-sm font-semibold text-brand-600 hover:underline">View all</a>
      </div>
      @if (topRated.hasValue()) { <app-product-grid [products]="topRated.value()" /> }
      @else { <app-skeleton-grid [count]="5" /> }
    </section>
  `,
})
export class Home {
  private catalog = inject(CatalogService);
  protected readonly I = I;

  protected readonly categories = rxResource({ stream: () => this.catalog.getCategories() });
  protected readonly brands = rxResource({ stream: () => this.catalog.getBrands() });
  protected readonly bestSellers = rxResource({ stream: () => this.catalog.getProducts({ sort: '-sold', limit: 10 }).pipe(map((r) => r.data)) });
  protected readonly topRated = rxResource({ stream: () => this.catalog.getProducts({ sort: '-ratingsAverage', limit: 5 }).pipe(map((r) => r.data)) });

  protected readonly topBrands = computed(() => (this.brands.value() ?? []).slice(0, 16));
  protected readonly heroImages = computed(() => (this.bestSellers.value() ?? []).slice(0, 3).map((p) => p.imageCover));

  protected readonly slides = [
    { kicker: 'Fresh every day', title: 'Everything you need, delivered fast', text: 'Thousands of products across fashion, electronics, and the supermarket.', cta: 'Start shopping', link: '/products' },
    { kicker: 'Customer favourites', title: 'Our best sellers, all in one place', text: 'See what thousands of shoppers keep coming back for.', cta: 'See best sellers', link: '/products' },
    { kicker: 'Explore', title: 'Find exactly what you are looking for', text: 'Browse by category to discover something new.', cta: 'Browse categories', link: '/categories' },
  ];

  protected readonly features = [
    { icon: I.Truck, title: 'Fast delivery', text: 'Across all of Egypt' },
    { icon: I.ShieldCheck, title: 'Secure payment', text: 'Card or cash on delivery' },
    { icon: I.RotateCcw, title: 'Easy returns', text: 'Within 14 days' },
    { icon: I.Headphones, title: '24/7 support', text: 'We are here to help' },
  ];

  protected readonly slide = signal(0);
  private timer = setInterval(() => this.slide.update((s) => (s + 1) % this.slides.length), 5000);

  constructor() {
    inject(DestroyRef).onDestroy(() => clearInterval(this.timer));
  }

  goTo(i: number) {
    this.slide.set(i);
    clearInterval(this.timer);
    this.timer = setInterval(() => this.slide.update((s) => (s + 1) % this.slides.length), 5000);
  }
}
