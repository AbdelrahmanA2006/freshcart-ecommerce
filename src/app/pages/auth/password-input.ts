import { Component, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { I } from '../../shared/icons';

/** Password field with a show/hide toggle. */
@Component({
  selector: 'app-password-input',
  imports: [ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="relative">
      <input [id]="inputId()" [type]="visible() ? 'text' : 'password'" class="input pr-11" [formControl]="control()"
        [attr.autocomplete]="autocomplete()" [class.invalid]="control().invalid && control().touched" />
      <button type="button" class="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center text-gray-400 hover:text-gray-700"
        (click)="visible.set(!visible())" [attr.aria-label]="visible() ? 'Hide password' : 'Show password'">
        <lucide-icon [img]="visible() ? I.EyeOff : I.Eye" [size]="17" />
      </button>
    </div>
  `,
})
export class PasswordInput {
  readonly control = input.required<FormControl<string>>();
  readonly inputId = input.required<string>();
  readonly autocomplete = input('current-password');
  protected readonly visible = signal(false);
  protected readonly I = I;
}
