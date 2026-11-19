import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './layout/footer';
import { Navbar } from './layout/navbar';
import { Toasts } from './layout/toasts';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, Toasts],
  template: `
    <div class="flex min-h-screen flex-col">
      <app-navbar />
      <main class="flex-1"><router-outlet /></main>
      <app-footer />
    </div>
    <app-toasts />
  `,
})
export class App {}
