import { Component, computed, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { I } from './icons';

@Component({
  selector: 'app-stars',
  imports: [LucideAngularModule],
  template: `
    <span class="inline-flex items-center gap-0.5" [attr.aria-label]="'Rated ' + rating() + ' out of 5'">
      @for (filled of stars(); track $index) {
        <lucide-icon [img]="I.Star" [size]="size()"
          [class]="filled ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'" />
      }
    </span>
  `,
})
export class Stars {
  readonly rating = input(0);
  readonly size = input(14);
  protected readonly I = I;
  protected readonly stars = computed(() => [1, 2, 3, 4, 5].map((n) => n <= Math.round(this.rating())));
}
