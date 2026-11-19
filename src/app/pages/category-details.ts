import { Component, effect, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { CatalogService } from '../core/services/catalog.service';
import { EmptyState } from '../shared/empty-state';
import { I } from '../shared/icons';
import { Pagination } from '../shared/pagination';
import { ProductGrid } from '../shared/product-grid';
import { SkeletonGrid } from '../shared/skeleton-grid';
import { Spinner } from '../shared/spinner';

@Component({
  selector: 'app-category-details',
  imports: [RouterLink, ProductGrid, SkeletonGrid, EmptyState, Spinner, Pagination],
  template: `
    <div class="container-x py-8">
      @if (category.error()) {
        <app-empty-state [icon]="I.CircleAlert" title="Category not found" text="It may have been removed." actionLabel="All categories" actionLink="/categories" />
      } @else if (category.value(); as c) {
        <nav class="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
          <a routerLink="/" class="hover:text-brand-600">Home</a> / <a routerLink="/categories" class="hover:text-brand-600">Categories</a> / <span class="text-gray-800">{{ c.name }}</span>
        </nav>
        <div class="card flex items-center gap-5 p-5">
          <img [src]="c.image" [alt]="c.name" class="size-20 rounded-xl object-cover sm:size-24" />
          <div>
            <h1 class="page-title">{{ c.name }}</h1>
            @if (products.hasValue()) { <p class="mt-1 text-sm text-gray-500">{{ products.value().results }} products</p> }
          </div>
        </div>

        @if (subcategories.value()?.length) {
          <div class="mt-6">
            <h2 class="mb-3 text-sm font-semibold text-gray-900">Subcategories</h2>
            <div class="flex flex-wrap gap-2">
              <button class="chip" [class.active]="!subcategory()" (click)="pickSub('')">All</button>
              @for (s of subcategories.value(); track s._id) {
                <button class="chip" [class.active]="subcategory() === s._id" (click)="pickSub(s._id)">{{ s.name }}</button>
              }
            </div>
          </div>
        }

        <div class="mt-8">
          @if (products.isLoading()) { <app-skeleton-grid [count]="10" /> }
          @else if (products.value()?.data?.length) {
            <app-product-grid [products]="products.value()!.data" />
            <app-pagination [page]="page()" [pages]="products.value()!.metadata.numberOfPages" (change)="goPage($event)" />
          } @else {
            <app-empty-state [icon]="I.Package" title="No products here yet" text="Check back soon or explore other categories." actionLabel="Browse all products" />
          }
        </div>
      } @else {
        <app-spinner />
      }
    </div>
  `,
  styles: `
    @reference "../../styles.css";
    .chip { @apply rounded-full border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 hover:border-brand-500; }
    .chip.active { @apply border-brand-500 bg-brand-500 text-white; }
  `,
})
export class CategoryDetails {
  readonly id = input.required<string>();
  readonly sub = input<string>();
  readonly p = input<string>();

  private catalog = inject(CatalogService);
  private router = inject(Router);
  protected readonly I = I;

  protected subcategory = () => this.sub() ?? '';
  protected page = () => Math.max(1, Number(this.p()) || 1);

  protected readonly category = rxResource({ params: () => this.id(), stream: ({ params }) => this.catalog.getCategory(params) });
  protected readonly subcategories = rxResource({ params: () => this.id(), stream: ({ params }) => this.catalog.getSubcategories(params) });
  protected readonly products = rxResource({
    params: () => ({ id: this.id(), sub: this.subcategory(), page: this.page() }),
    stream: ({ params }) =>
      this.catalog.getProducts(params.sub ? { subcategory: params.sub, page: params.page, limit: 20 } : { category: params.id, page: params.page, limit: 20 }),
  });

  constructor() {
    const title = inject(Title);
    effect(() => {
      const c = this.category.value();
      if (c) title.setTitle(`${c.name} | FreshCart`);
    });
  }

  pickSub(id: string) {
    this.router.navigate([], { queryParams: { sub: id || null, p: null }, queryParamsHandling: 'merge' });
  }

  goPage(p: number) {
    this.router.navigate([], { queryParams: { p }, queryParamsHandling: 'merge' });
  }
}

