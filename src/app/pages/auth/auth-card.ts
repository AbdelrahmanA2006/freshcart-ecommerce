import { Component, input } from '@angular/core';

@Component({
  selector: 'app-auth-card',
  template: `
    <div class="container-x flex justify-center py-10 sm:py-16">
      <div class="card w-full max-w-md p-6 sm:p-8">
        <h1 class="text-2xl font-bold text-gray-900">{{ heading() }}</h1>
        @if (subheading()) { <p class="mt-1.5 text-sm text-gray-500">{{ subheading() }}</p> }
        <div class="mt-6"><ng-content /></div>
      </div>
    </div>
  `,
})
export class AuthCard {
  readonly heading = input.required<string>();
  readonly subheading = input('');
}
