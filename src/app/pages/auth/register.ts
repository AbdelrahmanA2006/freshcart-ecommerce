import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { apiError } from '../../core/api';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { FieldError } from '../../shared/field-error';
import { I } from '../../shared/icons';
import { EG_PHONE, PASSWORD, PASSWORD_HINT, PHONE_HINT, matchFields } from '../../shared/validators';
import { AuthCard } from './auth-card';
import { PasswordInput } from './password-input';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule, FieldError, AuthCard, PasswordInput],
  template: `
    <app-auth-card heading="Create your account" subheading="Join FreshCart to shop, save favourites and track orders.">
      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4" novalidate>
        @if (error()) { <div class="flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert"><lucide-icon [img]="I.CircleAlert" [size]="17" class="shrink-0" /> {{ error() }}</div> }
        <div>
          <label class="label" for="name">Full name</label>
          <input id="name" class="input" formControlName="name" autocomplete="name" [class.invalid]="bad('name')" />
          <app-field-error [control]="form.controls.name" label="Name" />
        </div>
        <div>
          <label class="label" for="email">Email</label>
          <input id="email" type="email" class="input" formControlName="email" autocomplete="email" [class.invalid]="bad('email')" />
          <app-field-error [control]="form.controls.email" label="Email" />
        </div>
        <div>
          <label class="label" for="phone">Phone</label>
          <input id="phone" type="tel" class="input" formControlName="phone" autocomplete="tel" placeholder="01012345678" [class.invalid]="bad('phone')" />
          <app-field-error [control]="form.controls.phone" label="Phone" [hint]="phoneHint" />
        </div>
        <div>
          <label class="label" for="password">Password</label>
          <app-password-input inputId="password" autocomplete="new-password" [control]="form.controls.password" />
          <app-field-error [control]="form.controls.password" label="Password" [hint]="passwordHint" />
        </div>
        <div>
          <label class="label" for="rePassword">Confirm password</label>
          <app-password-input inputId="rePassword" autocomplete="new-password" [control]="form.controls.rePassword" />
          <app-field-error [control]="form.controls.rePassword" label="Confirm password" />
        </div>
        <button class="btn-primary w-full" [disabled]="loading()">
          @if (loading()) { <lucide-icon [img]="I.LoaderCircle" [size]="16" class="animate-spin" /> } Create account
        </button>
      </form>
      <p class="mt-6 text-center text-sm text-gray-500">Already have an account? <a routerLink="/login" class="font-semibold text-brand-600 hover:underline">Sign in</a></p>
    </app-auth-card>
  `,
})
export class Register {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  protected readonly I = I;
  protected readonly phoneHint = PHONE_HINT;
  protected readonly passwordHint = PASSWORD_HINT;
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly form = inject(FormBuilder).nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', EG_PHONE],
      password: ['', PASSWORD],
      rePassword: ['', Validators.required],
    },
    { validators: matchFields('password', 'rePassword') },
  );

  bad(name: keyof typeof this.form.controls) {
    const c = this.form.controls[name];
    return c.invalid && c.touched;
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const v = this.form.getRawValue();
    this.auth.register({ ...v, name: v.name.trim(), email: v.email.trim() }).subscribe({
      next: () => {
        this.toast.success('Account created. Welcome to FreshCart!');
        this.router.navigate(['/']);
      },
      error: (e) => { this.error.set(apiError(e)); this.loading.set(false); },
    });
  }
}
