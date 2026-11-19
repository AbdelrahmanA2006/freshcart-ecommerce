import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'egp' })
export class EgpPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return `${(value ?? 0).toLocaleString('en-US')} EGP`;
  }
}
