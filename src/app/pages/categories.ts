import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../core/services/catalog.service';
import { EmptyState } from '../shared/empty-state';
import { I } from '../shared/icons';

@Component({
  selector: 'app-categories',
  imports: [RouterLink, EmptyState],
  template: `
    <div class="container-x py-8">
      <h1 class="page-title">Categories</h1>
      <p class="mt-1 text-sm text-gray-500">Browse everything FreshCart has to offer.</p>
      <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        @if (categories.hasValue()) {
          @for (c of categories.value(); track c._id) {
            <a [routerLink]="['/categories', c._id]" class="group card overflow-hidden transition-shadow hover:shadow-lg">
              <div class="aspect-[4/5] overflow-hidden bg-gray-100">
                <img [src]="c.image" [alt]="c.name" loading="lazy" class="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              <p class="p-3 text-center font-semibold text-gray-900 group-hover:text-brand-600">{{ c.name }}</p>
            </a>
          }
        } @else if (categories.error()) {
          <div class="col-span-full"><app-empty-state [icon]="I.CircleAlert" title="Couldn't load categories" text="Refresh the page to try again." /></div>
        } @else {
          @for (i of [1,2,3,4,5,6,7,8,9,10]; track i) { <div class="card aspect-[4/5] animate-pulse bg-gray-200"></div> }
        }
      </div>
    </div>
  `,
})
export class Categories {
  protected readonly I = I;
  private catalog = inject(CatalogService);
  protected readonly categories = rxResource({ stream: () => this.catalog.getCategories() });
}
