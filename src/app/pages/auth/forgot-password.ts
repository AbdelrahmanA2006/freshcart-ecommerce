import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { apiError } from '../../core/api';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { FieldError } from '../../shared/field-error';
import { I } from '../../shared/icons';
import { PASSWORD, PASSWORD_HINT, matchFields } from '../../shared/validators';
import { AuthCard } from './auth-card';
import { PasswordInput } from './password-input';

type Step = 'email' | 'code' | 'reset';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule, FieldError, AuthCard, PasswordInput],
  template: `
    <app-auth-card [heading]="headings[step()].title" [subheading]="step() === 'code' ? 'We sent a 6-digit code to ' + emailForm.value.email + '.' : headings[step()].text">
      <ol class="mb-6 flex gap-2" aria-label="Progress">
        @for (s of steps; track s; let i = $index) {
          <li class="h-1.5 flex-1 rounded-full" [class]="i <= stepIndex() ? 'bg-brand-500' : 'bg-gray-200'"></li>
        }
      </ol>
      @if (error()) { <div class="mb-4 flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert"><lucide-icon [img]="I.CircleAlert" [size]="17" class="shrink-0" /> {{ error() }}</div> }

      @switch (step()) {
        @case ('email') {
          <form [formGroup]="emailForm" (ngSubmit)="sendCode()" class="space-y-4" novalidate>
            <div>
              <label class="label" for="email">Email</label>
              <input id="email" type="email" class="input" formControlName="email" autocomplete="email" />
              <app-field-error [control]="emailForm.controls.email" label="Email" />
            </div>
            <button class="btn-primary w-full" [disabled]="loading()">
              @if (loading()) { <lucide-icon [img]="I.LoaderCircle" [size]="16" class="animate-spin" /> } Send reset code
            </button>
          </form>
        }
        @case ('code') {
          <form [formGroup]="codeForm" (ngSubmit)="verifyCode()" class="space-y-4" novalidate>
            <div>
              <label class="label" for="code">Reset code</label>
              <input id="code" class="input text-center text-lg tracking-[0.5em]" formControlName="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••••" />
              <app-field-error [control]="codeForm.controls.code" label="Code" [hint]="{ pattern: 'Enter the 6-digit code from the email' }" />
            </div>
            <button class="btn-primary w-full" [disabled]="loading()">
              @if (loading()) { <lucide-icon [img]="I.LoaderCircle" [size]="16" class="animate-spin" /> } Verify code
            </button>
            <p class="text-center text-sm text-gray-500">
              Didn't get it? <button type="button" class="font-semibold text-brand-600 hover:underline" (click)="sendCode(true)" [disabled]="loading()">Resend code</button>
              · <button type="button" class="font-semibold text-gray-600 hover:underline" (click)="step.set('email')">Change email</button>
            </p>
          </form>
        }
        @case ('reset') {
          <form [formGroup]="resetForm" (ngSubmit)="reset()" class="space-y-4" novalidate>
            <div>
              <label class="label" for="newPassword">New password</label>
              <app-password-input inputId="newPassword" autocomplete="new-password" [control]="resetForm.controls.newPassword" />
              <app-field-error [control]="resetForm.controls.newPassword" label="Password" [hint]="passwordHint" />
            </div>
            <div>
              <label class="label" for="rePassword">Confirm new password</label>
              <app-password-input inputId="rePassword" autocomplete="new-password" [control]="resetForm.controls.rePassword" />
              <app-field-error [control]="resetForm.controls.rePassword" label="Confirm password" />
            </div>
            <button class="btn-primary w-full" [disabled]="loading()">
              @if (loading()) { <lucide-icon [img]="I.LoaderCircle" [size]="16" class="animate-spin" /> } Reset password
            </button>
          </form>
        }
      }
      <p class="mt-6 text-center text-sm text-gray-500"><a routerLink="/login" class="font-semibold text-brand-600 hover:underline">Back to sign in</a></p>
    </app-auth-card>
  `,
})
export class ForgotPassword {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder).nonNullable;
  protected readonly I = I;
  protected readonly passwordHint = PASSWORD_HINT;

  protected readonly steps: Step[] = ['email', 'code', 'reset'];
  protected readonly headings = {
    email: { title: 'Forgot your password?', text: "Enter your account email and we'll send you a reset code." },
    code: { title: 'Check your email', text: '' },
    reset: { title: 'Choose a new password', text: 'Use something you have not used before.' },
  };
  protected readonly step = signal<Step>('email');
  protected readonly stepIndex = () => this.steps.indexOf(this.step());
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly emailForm = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  protected readonly codeForm = this.fb.group({ code: ['', [Validators.required, Validators.pattern(/^\d{4,6}$/)]] });
  protected readonly resetForm = this.fb.group(
    { newPassword: ['', PASSWORD], rePassword: ['', Validators.required] },
    { validators: matchFields('newPassword', 'rePassword') },
  );

  private run<T>(obs: import('rxjs').Observable<T>, onOk: (v: T) => void) {
    this.loading.set(true);
    this.error.set('');
    obs.subscribe({
      next: (v) => { this.loading.set(false); onOk(v); },
      error: (e) => { this.error.set(apiError(e)); this.loading.set(false); },
    });
  }

  sendCode(resend = false) {
    this.emailForm.markAllAsTouched();
    if (this.emailForm.invalid) return;
    this.run(this.auth.forgotPassword(this.emailForm.getRawValue().email.trim()), () => {
      this.toast.success(resend ? 'A new code is on its way' : 'Reset code sent. Check your inbox.');
      this.step.set('code');
    });
  }

  verifyCode() {
    this.codeForm.markAllAsTouched();
    if (this.codeForm.invalid) return;
    this.run(this.auth.verifyResetCode(this.codeForm.getRawValue().code.trim()), () => this.step.set('reset'));
  }

  reset() {
    this.resetForm.markAllAsTouched();
    if (this.resetForm.invalid) return;
    this.run(this.auth.resetPassword(this.emailForm.getRawValue().email.trim(), this.resetForm.getRawValue().newPassword), () => {
      this.toast.success('Password reset. You are now signed in.');
      this.router.navigate(['/']);
    });
  }
}
