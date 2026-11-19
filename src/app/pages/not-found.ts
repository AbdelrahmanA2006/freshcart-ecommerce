import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="container-x flex flex-col items-center py-24 text-center">
      <p class="text-7xl font-extrabold text-brand-500">404</p>
      <h1 class="mt-4 text-2xl font-bold text-gray-900">Page not found</h1>
      <p class="mt-2 max-w-sm text-gray-500">The page you're looking for doesn't exist or has moved.</p>
      <div class="mt-8 flex gap-3">
        <a routerLink="/" class="btn-primary">Go home</a>
        <a routerLink="/products" class="btn-outline">Browse products</a>
      </div>
    </div>
  `,
})
export class NotFound {}
