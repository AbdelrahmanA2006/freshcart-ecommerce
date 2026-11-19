import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CatalogService } from '../core/services/catalog.service';
import { EmptyState } from '../shared/empty-state';
import { I } from '../shared/icons';

@Component({
  selector: 'app-brands',
  imports: [RouterLink, EmptyState, LucideAngularModule],
  template: `
    <div class="container-x py-8">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="page-title">Brands</h1>
          <p class="mt-1 text-sm text-gray-500">{{ brands.value()?.length ?? 0 }} brands to explore</p>
        </div>
        <label class="relative w-full sm:w-64">
          <span class="sr-only">Filter brands</span>
          <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400"><lucide-icon [img]="I.Search" [size]="16" /></span>
          <input type="search" class="input pl-9" placeholder="Find a brand…" (input)="term.set($any($event.target).value)" />
        </label>
      </div>
      <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        @if (brands.hasValue()) {
          @for (b of filtered(); track b._id) {
            <a [routerLink]="['/brands', b._id]" class="group card flex flex-col items-center p-4 transition-shadow hover:shadow-lg">
              <div class="flex aspect-[4/3] w-full items-center justify-center">
                <img [src]="b.image" [alt]="b.name" loading="lazy" class="max-h-full object-contain transition-transform group-hover:scale-105" />
              </div>
              <p class="mt-2 text-sm font-semibold text-gray-800 group-hover:text-brand-600">{{ b.name }}</p>
            </a>
          } @empty {
            <div class="col-span-full"><app-empty-state [icon]="I.Search" title="No brands match" text="Try another name." /></div>
          }
        } @else if (brands.error()) {
          <div class="col-span-full"><app-empty-state [icon]="I.CircleAlert" title="Couldn't load brands" text="Refresh the page to try again." /></div>
        } @else {
          @for (i of [1,2,3,4,5,6,7,8,9,10,11,12]; track i) { <div class="card aspect-square animate-pulse bg-gray-200"></div> }
        }
      </div>
    </div>
  `,
})
export class Brands {
  protected readonly I = I;
  private catalog = inject(CatalogService);
  protected readonly brands = rxResource({ stream: () => this.catalog.getBrands() });
  protected readonly term = signal('');
  protected readonly filtered = computed(() => {
    const t = this.term().trim().toLowerCase();
    return (this.brands.value() ?? []).filter((b) => b.name.toLowerCase().includes(t));
  });
}
