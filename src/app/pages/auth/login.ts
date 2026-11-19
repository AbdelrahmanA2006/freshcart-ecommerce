import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { apiError } from '../../core/api';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { FieldError } from '../../shared/field-error';
import { I } from '../../shared/icons';
import { AuthCard } from './auth-card';
import { PasswordInput } from './password-input';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule, FieldError, AuthCard, PasswordInput],
  template: `
    <app-auth-card heading="Welcome back" subheading="Sign in to your FreshCart account.">
      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4" novalidate>
        @if (error()) { <div class="flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert"><lucide-icon [img]="I.CircleAlert" [size]="17" class="shrink-0" /> {{ error() }}</div> }
        <div>
          <label class="label" for="email">Email</label>
          <input id="email" type="email" class="input" formControlName="email" autocomplete="email" [class.invalid]="form.controls.email.invalid && form.controls.email.touched" />
          <app-field-error [control]="form.controls.email" label="Email" />
        </div>
        <div>
          <div class="mb-1.5 flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700" for="password">Password</label>
            <a routerLink="/forgot-password" class="text-sm font-medium text-brand-600 hover:underline">Forgot password?</a>
          </div>
          <app-password-input inputId="password" [control]="form.controls.password" />
          <app-field-error [control]="form.controls.password" label="Password" />
        </div>
        <button class="btn-primary w-full" [disabled]="loading()">
          @if (loading()) { <lucide-icon [img]="I.LoaderCircle" [size]="16" class="animate-spin" /> } Sign in
        </button>
      </form>
      <p class="mt-6 text-center text-sm text-gray-500">New to FreshCart? <a routerLink="/register" class="font-semibold text-brand-600 hover:underline">Create an account</a></p>
    </app-auth-card>
  `,
})
export class Login {
  readonly returnUrl = input<string>();
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  protected readonly I = I;
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.form.getRawValue()).subscribe({
      next: (r) => {
        this.toast.success(`Welcome back, ${r.user.name.split(' ')[0]}!`);
        this.router.navigateByUrl(this.returnUrl() || '/');
      },
      error: (e) => { this.error.set(apiError(e)); this.loading.set(false); },
    });
  }
}
