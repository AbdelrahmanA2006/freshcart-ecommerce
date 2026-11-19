import { Component, computed, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { map } from 'rxjs';
import { ListResponse, Product } from '../core/models';
import { CatalogService } from '../core/services/catalog.service';
import { EmptyState } from '../shared/empty-state';
import { I } from '../shared/icons';
import { Pagination } from '../shared/pagination';
import { ProductGrid } from '../shared/product-grid';
import { SkeletonGrid } from '../shared/skeleton-grid';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-products',
  imports: [LucideAngularModule, ProductGrid, SkeletonGrid, Pagination, EmptyState, RouterLink],
  template: `
    <div class="container-x py-8">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="page-title">{{ q() ? 'Results for “' + q() + '”' : 'All products' }}</h1>
          @if (products.hasValue()) { <p class="mt-1 text-sm text-gray-500">{{ products.value().results }} products</p> }
        </div>
        <div class="flex items-center gap-2">
          <button class="btn-outline lg:hidden" (click)="showFilters.set(!showFilters())" [attr.aria-expanded]="showFilters()">
            <lucide-icon [img]="I.SlidersHorizontal" [size]="16" /> Filters
          </button>
          <label class="sr-only" for="sort">Sort by</label>
          <select id="sort" class="input w-auto py-2" [value]="sort()" (change)="setParam('sort', $any($event.target).value)">
            <option value="">Recommended</option>
            <option value="-sold">Best selling</option>
            <option value="price">Price: low to high</option>
            <option value="-price">Price: high to low</option>
            <option value="-ratingsAverage">Top rated</option>
            <option value="-createdAt">Newest</option>
          </select>
        </div>
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside class="space-y-6 lg:block" [class.hidden]="!showFilters()">
          <form class="card p-4" role="search" (submit)="$event.preventDefault(); setParam('q', search.value.trim())">
            <label class="label" for="psearch">Search</label>
            <div class="flex gap-2">
              <input #search id="psearch" type="search" class="input py-2" [value]="q()" placeholder="e.g. shirt" />
              <button class="btn-primary px-3" aria-label="Search"><lucide-icon [img]="I.Search" [size]="16" /></button>
            </div>
          </form>

          <div class="card p-4">
            <h2 class="mb-3 text-sm font-semibold text-gray-900">Category</h2>
            <ul class="space-y-1 text-sm">
              <li><button class="filter-opt" [class.active]="!category()" (click)="setParam('category', '')">All categories</button></li>
              @for (c of categories.value() ?? []; track c._id) {
                <li><button class="filter-opt" [class.active]="category() === c._id" (click)="setParam('category', c._id)">{{ c.name }}</button></li>
              }
            </ul>
          </div>

          <div class="card p-4">
            <label class="mb-3 block text-sm font-semibold text-gray-900" for="brand">Brand</label>
            <select id="brand" class="input py-2" [value]="brand()" (change)="setParam('brand', $any($event.target).value)">
              <option value="">All brands</option>
              @for (b of brands.value() ?? []; track b._id) { <option [value]="b._id">{{ b.name }}</option> }
            </select>
          </div>

          <form class="card p-4" (submit)="$event.preventDefault(); applyPrice(min.value, max.value)">
            <h2 class="mb-3 text-sm font-semibold text-gray-900">Price (EGP)</h2>
            <div class="flex items-center gap-2">
              <input #min type="number" min="0" class="input py-2" placeholder="Min" [value]="minPrice() ?? ''" aria-label="Minimum price" />
              <span class="text-gray-400">–</span>
              <input #max type="number" min="0" class="input py-2" placeholder="Max" [value]="maxPrice() ?? ''" aria-label="Maximum price" />
            </div>
            <button class="btn-outline mt-3 w-full py-2">Apply price</button>
          </form>

          @if (hasFilters()) {
            <a routerLink="/products" class="btn-danger w-full"><lucide-icon [img]="I.X" [size]="15" /> Clear all filters</a>
          }
        </aside>

        <section aria-live="polite">
          @if (products.isLoading()) {
            <app-skeleton-grid [count]="10" />
          } @else if (products.error()) {
            <app-empty-state [icon]="I.CircleAlert" title="Couldn't load products" text="Check your connection and try again." />
          } @else if (products.value()?.data?.length) {
            <app-product-grid [products]="products.value()!.data" />
            <app-pagination [page]="page()" [pages]="products.value()!.metadata.numberOfPages" (change)="setParam('page', $event)" />
          } @else {
            <app-empty-state [icon]="I.Search" title="No products match" text="Try a different search term or clear some filters." actionLabel="Clear filters" actionLink="/products" />
          }
        </section>
      </div>
    </div>
  `,
  styles: `
    @reference "../../styles.css";
    .filter-opt { @apply w-full rounded-md px-2.5 py-1.5 text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900; }
    .filter-opt.active { @apply bg-brand-50 font-semibold text-brand-700; }
  `,
})
export class Products {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalog = inject(CatalogService);
  protected readonly I = I;
  protected readonly showFilters = signal(false);

  private params = toSignal(this.route.queryParamMap, { requireSync: true });
  protected readonly q = computed(() => this.params().get('q') ?? '');
  protected readonly sort = computed(() => this.params().get('sort') ?? '');
  protected readonly category = computed(() => this.params().get('category') ?? '');
  protected readonly brand = computed(() => this.params().get('brand') ?? '');
  protected readonly page = computed(() => Math.max(1, Number(this.params().get('page')) || 1));
  protected readonly minPrice = computed(() => this.num(this.params().get('min')));
  protected readonly maxPrice = computed(() => this.num(this.params().get('max')));
  protected readonly hasFilters = computed(() => !!(this.q() || this.category() || this.brand() || this.minPrice() != null || this.maxPrice() != null));

  protected readonly categories = rxResource({ stream: () => this.catalog.getCategories() });
  protected readonly brands = rxResource({ stream: () => this.catalog.getBrands() });

  protected readonly products = rxResource({
    params: () => ({ q: this.q(), sort: this.sort(), category: this.category(), brand: this.brand(), page: this.page(), minPrice: this.minPrice(), maxPrice: this.maxPrice() }),
    stream: ({ params: p }) => {
      const filters = { sort: p.sort, category: p.category, brand: p.brand, minPrice: p.minPrice, maxPrice: p.maxPrice };
      if (!p.q) return this.catalog.getProducts({ ...filters, page: p.page, limit: PAGE_SIZE });
      // The API's keyword search is unreliable, so search titles client-side over the filtered set.
      const term = p.q.toLowerCase();
      return this.catalog.getProducts({ ...filters, limit: 200 }).pipe(
        map((r) => {
          const all = r.data.filter((x) => x.title.toLowerCase().includes(term) || x.brand?.name.toLowerCase().includes(term) || x.category?.name.toLowerCase().includes(term));
          return paginate(all, p.page);
        }),
      );
    },
  });

  setParam(key: string, value: string | number) {
    const queryParams: Record<string, string | number | null> = { [key]: value === '' ? null : value };
    if (key !== 'page') queryParams['page'] = null;
    this.showFilters.set(false);
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }

  applyPrice(min: string, max: string) {
    this.router.navigate([], { queryParams: { min: min || null, max: max || null, page: null }, queryParamsHandling: 'merge' });
  }

  private num(v: string | null) {
    return v === null || v === '' || isNaN(Number(v)) ? null : Number(v);
  }
}

function paginate(all: Product[], page: number): ListResponse<Product> {
  const numberOfPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  return {
    results: all.length,
    metadata: { currentPage: page, numberOfPages, limit: PAGE_SIZE },
    data: all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
  };
}

