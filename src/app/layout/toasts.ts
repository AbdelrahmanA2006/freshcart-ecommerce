import { Component, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ToastService } from '../core/services/toast.service';
import { I } from '../shared/icons';

@Component({
  selector: 'app-toasts',
  imports: [LucideAngularModule],
  template: `
    <div class="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4 sm:items-end" aria-live="polite">
      @for (t of toast.toasts(); track t.id) {
        <div class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white px-4 py-3 text-sm shadow-lg"
          [class]="t.type === 'error' ? 'border-red-200' : 'border-gray-200'">
          <lucide-icon [size]="18" class="mt-0.5 shrink-0"
            [img]="t.type === 'success' ? I.CircleCheck : t.type === 'error' ? I.CircleAlert : I.Info"
            [class]="t.type === 'success' ? 'text-brand-500' : t.type === 'error' ? 'text-red-500' : 'text-sky-500'" />
          <p class="flex-1 text-gray-800">{{ t.text }}</p>
          <button (click)="toast.dismiss(t.id)" class="text-gray-400 hover:text-gray-700" aria-label="Dismiss">
            <lucide-icon [img]="I.X" [size]="16" />
          </button>
        </div>
      }
    </div>
  `,
})
export class Toasts {
  protected readonly toast = inject(ToastService);
  protected readonly I = I;
}
