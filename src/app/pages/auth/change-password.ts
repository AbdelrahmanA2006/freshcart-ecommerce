import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { apiError } from '../../core/api';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { FieldError } from '../../shared/field-error';
import { I } from '../../shared/icons';
import { PASSWORD, PASSWORD_HINT, matchFields } from '../../shared/validators';
import { AuthCard } from './auth-card';
import { PasswordInput } from './password-input';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule, LucideAngularModule, FieldError, AuthCard, PasswordInput],
  template: `
    <app-auth-card heading="Change password" subheading="You'll stay signed in on this device after the change.">
      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4" novalidate>
        @if (error()) { <div class="flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert"><lucide-icon [img]="I.CircleAlert" [size]="17" class="shrink-0" /> {{ error() }}</div> }
        <div>
          <label class="label" for="currentPassword">Current password</label>
          <app-password-input inputId="currentPassword" [control]="form.controls.currentPassword" />
          <app-field-error [control]="form.controls.currentPassword" label="Current password" />
        </div>
        <div>
          <label class="label" for="password">New password</label>
          <app-password-input inputId="password" autocomplete="new-password" [control]="form.controls.password" />
          <app-field-error [control]="form.controls.password" label="Password" [hint]="passwordHint" />
        </div>
        <div>
          <label class="label" for="rePassword">Confirm new password</label>
          <app-password-input inputId="rePassword" autocomplete="new-password" [control]="form.controls.rePassword" />
          <app-field-error [control]="form.controls.rePassword" label="Confirm password" />
        </div>
        <button class="btn-primary w-full" [disabled]="loading()">
          @if (loading()) { <lucide-icon [img]="I.LoaderCircle" [size]="16" class="animate-spin" /> } Update password
        </button>
      </form>
    </app-auth-card>
  `,
})
export class ChangePassword {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  protected readonly I = I;
  protected readonly passwordHint = PASSWORD_HINT;
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly form = inject(FormBuilder).nonNullable.group(
    { currentPassword: ['', Validators.required], password: ['', PASSWORD], rePassword: ['', Validators.required] },
    { validators: matchFields('password', 'rePassword') },
  );

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.changePassword(this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.success('Password updated');
        this.router.navigate(['/profile']);
      },
      error: (e) => { this.error.set(apiError(e)); this.loading.set(false); },
    });
  }
}
