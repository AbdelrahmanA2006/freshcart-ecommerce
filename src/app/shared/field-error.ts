import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

const MESSAGES: Record<string, (e: any, label: string) => string> = {
  required: (_e, l) => `${l} is required`,
  email: () => 'Enter a valid email address',
  minlength: (e, l) => `${l} must be at least ${e.requiredLength} characters`,
  maxlength: (e, l) => `${l} must be at most ${e.requiredLength} characters`,
  pattern: (_e, l) => `Enter a valid ${l.toLowerCase()}`,
  mismatch: () => "Passwords don't match",
};

/** Shows the first validation error of a control once it has been touched. */
@Component({
  selector: 'app-field-error',
  template: `
    @if (message(); as m) { <p class="field-error" role="alert">{{ m }}</p> }
  `,
})
export class FieldError {
  readonly control = input.required<AbstractControl | null>();
  readonly label = input('This field');
  readonly hint = input<Record<string, string>>({});

  message(): string | null {
    const c = this.control();
    if (!c || !c.errors || !c.touched) return null;
    const key = Object.keys(c.errors)[0];
    return this.hint()[key] ?? MESSAGES[key]?.(c.errors[key], this.label()) ?? `${this.label()} is invalid`;
  }
}
