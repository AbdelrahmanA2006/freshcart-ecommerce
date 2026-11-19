import { Injectable, signal } from '@angular/core';

export interface Toast { id: number; type: 'success' | 'error' | 'info'; text: string; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 1;

  success(text: string) { this.push('success', text); }
  error(text: string) { this.push('error', text); }
  info(text: string) { this.push('info', text); }

  dismiss(id: number) {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private push(type: Toast['type'], text: string) {
    const id = this.nextId++;
    this.toasts.update((list) => [...list.slice(-3), { id, type, text }]);
    setTimeout(() => this.dismiss(id), type === 'error' ? 5000 : 3000);
  }
}
