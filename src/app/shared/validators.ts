import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

/** At least 6 chars, one uppercase letter and one number (matches the API's expectations). */
export const PASSWORD = [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{6,}$/)];
export const PASSWORD_HINT = { pattern: 'Use 6+ characters with an uppercase letter and a number' };

export const EG_PHONE = [Validators.required, Validators.pattern(/^01[0125]\d{8}$/)];
export const PHONE_HINT = { pattern: 'Enter a valid Egyptian mobile number, e.g. 01012345678' };

/** Group validator: sets `mismatch` on `confirmKey` when it differs from `key`. */
export function matchFields(key: string, confirmKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const a = group.get(key);
    const b = group.get(confirmKey);
    if (!a || !b) return null;
    const errors = { ...(b.errors ?? {}) };
    if (b.value && a.value !== b.value) errors['mismatch'] = true;
    else delete errors['mismatch'];
    b.setErrors(Object.keys(errors).length ? errors : null);
    return null;
  };
}
