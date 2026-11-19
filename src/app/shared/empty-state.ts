import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-empty-state',
  imports: [LucideAngularModule, RouterLink],
  template: `
    <div class="card flex flex-col items-center px-6 py-16 text-center">
      <div class="mb-4 flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <lucide-icon [img]="icon()" [size]="26" />
      </div>
      <h2 class="text-lg font-semibold text-gray-900">{{ title() }}</h2>
      <p class="mt-1 max-w-sm text-sm text-gray-500">{{ text() }}</p>
      @if (actionLabel()) {
        <a [routerLink]="actionLink()" class="btn-primary mt-6">{{ actionLabel() }}</a>
      }
      <ng-content />
    </div>
  `,
})
export class EmptyState {
  readonly icon = input.required<LucideIconData>();
  readonly title = input.required<string>();
  readonly text = input('');
  readonly actionLabel = input('');
  readonly actionLink = input<string | unknown[]>('/products');
}
