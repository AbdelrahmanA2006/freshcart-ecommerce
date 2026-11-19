import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-grid',
  template: `
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" aria-hidden="true">
      @for (i of items(); track i) {
        <div class="card animate-pulse overflow-hidden">
          <div class="aspect-square bg-gray-200"></div>
          <div class="space-y-2 p-3">
            <div class="h-3 w-1/3 rounded bg-gray-200"></div>
            <div class="h-4 w-4/5 rounded bg-gray-200"></div>
            <div class="h-4 w-1/2 rounded bg-gray-200"></div>
          </div>
        </div>
      }
    </div>
  `,
})
export class SkeletonGrid {
  readonly count = input(10);
  protected items() { return Array.from({ length: this.count() }, (_, i) => i); }
}
