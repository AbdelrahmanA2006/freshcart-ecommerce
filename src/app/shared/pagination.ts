import { Component, computed, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { I } from './icons';

@Component({
  selector: 'app-pagination',
  imports: [LucideAngularModule],
  template: `
    @if (pages() > 1) {
      <nav class="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
        <button class="btn-outline size-10 p-0" [disabled]="page() <= 1" (click)="change.emit(page() - 1)" aria-label="Previous page">
          <lucide-icon [img]="I.ChevronLeft" [size]="16" />
        </button>
        @for (p of list(); track $index) {
          @if (p === 0) {
            <span class="px-1 text-gray-400">…</span>
          } @else {
            <button class="size-10 rounded-lg text-sm font-semibold transition-colors"
              [class]="p === page() ? 'bg-brand-500 text-white' : 'border border-gray-300 bg-white text-gray-700 hover:border-brand-500'"
              [attr.aria-current]="p === page() ? 'page' : null" (click)="change.emit(p)">{{ p }}</button>
          }
        }
        <button class="btn-outline size-10 p-0" [disabled]="page() >= pages()" (click)="change.emit(page() + 1)" aria-label="Next page">
          <lucide-icon [img]="I.ChevronRight" [size]="16" />
        </button>
      </nav>
    }
  `,
})
export class Pagination {
  readonly page = input(1);
  readonly pages = input(1);
  readonly change = output<number>();
  protected readonly I = I;

  /** Page numbers with 0 standing in for an ellipsis. */
  protected readonly list = computed(() => {
    const total = this.pages();
    const cur = this.page();
    const out: number[] = [];
    for (let p = 1; p <= total; p++) {
      if (p === 1 || p === total || Math.abs(p - cur) <= 1) out.push(p);
      else if (out[out.length - 1] !== 0) out.push(0);
    }
    return out;
  });
}
