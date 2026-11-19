import { Component, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { I } from './icons';

@Component({
  selector: 'app-spinner',
  imports: [LucideAngularModule],
  template: `
    <div class="flex flex-col items-center justify-center gap-3 py-20 text-gray-500" role="status">
      <lucide-icon [img]="I.LoaderCircle" [size]="32" class="animate-spin text-brand-500" />
      @if (label()) { <p class="text-sm">{{ label() }}</p> }
    </div>
  `,
})
export class Spinner {
  readonly label = input('');
  protected readonly I = I;
}
