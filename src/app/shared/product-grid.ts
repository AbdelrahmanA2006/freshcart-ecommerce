import { Component, input } from '@angular/core';
import { Product } from '../core/models';
import { ProductCard } from './product-card';

@Component({
  selector: 'app-product-grid',
  imports: [ProductCard],
  template: `
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      @for (p of products(); track p._id) { <app-product-card [product]="p" /> }
    </div>
  `,
})
export class ProductGrid {
  readonly products = input.required<Product[]>();
}
