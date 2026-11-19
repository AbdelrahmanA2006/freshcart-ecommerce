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
  selector: 'app-brand-details',
  imports: [RouterLink, ProductGrid, SkeletonGrid, EmptyState, Spinner, Pagination],
  template: `
    <div class="container-x py-8">
      @if (brand.error()) {
        <app-empty-state [icon]="I.CircleAlert" title="Brand not found" text="It may have been removed." actionLabel="All brands" actionLink="/brands" />
      } @else if (brand.value(); as b) {
        <nav class="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
          <a routerLink="/" class="hover:text-brand-600">Home</a> / <a routerLink="/brands" class="hover:text-brand-600">Brands</a> / <span class="text-gray-800">{{ b.name }}</span>
        </nav>
        <div class="card flex items-center gap-5 p-5">
          <div class="flex h-20 w-28 items-center justify-center rounded-xl border border-gray-100 p-2"><img [src]="b.image" [alt]="b.name" class="max-h-full object-contain" /></div>
          <div>
            <h1 class="page-title">{{ b.name }}</h1>
            @if (products.hasValue()) { <p class="mt-1 text-sm text-gray-500">{{ products.value().results }} products</p> }
          </div>
        </div>
        <div class="mt-8">
          @if (products.isLoading()) { <app-skeleton-grid [count]="10" /> }
          @else if (products.value()?.data?.length) {
            <app-product-grid [products]="products.value()!.data" />
            <app-pagination [page]="page()" [pages]="products.value()!.metadata.numberOfPages" (change)="goPage($event)" />
          } @else {
            <app-empty-state [icon]="I.Package" title="No products from this brand yet" text="Check back soon or explore other brands." actionLabel="All brands" actionLink="/brands" />
          }
        </div>
      } @else {
        <app-spinner />
      }
    </div>
  `,
})
export class BrandDetails {
  readonly id = input.required<string>();
  readonly p = input<string>();
  private catalog = inject(CatalogService);
  private router = inject(Router);
  protected readonly I = I;
  protected page = () => Math.max(1, Number(this.p()) || 1);

  protected readonly brand = rxResource({ params: () => this.id(), stream: ({ params }) => this.catalog.getBrand(params) });
  protected readonly products = rxResource({
    params: () => ({ id: this.id(), page: this.page() }),
    stream: ({ params }) => this.catalog.getProducts({ brand: params.id, page: params.page, limit: 20 }),
  });

  constructor() {
    const title = inject(Title);
    effect(() => {
      const b = this.brand.value();
      if (b) title.setTitle(`${b.name} | FreshCart`);
    });
  }

  goPage(p: number) {
    this.router.navigate([], { queryParams: { p }, queryParamsHandling: 'merge' });
  }
}
