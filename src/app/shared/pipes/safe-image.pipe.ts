import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'safeImage',
  standalone: true,
})
export class SafeImagePipe implements PipeTransform {
  transform(value: string | undefined, fallback: string): string {
    if (value && value.trim()) return value;
    return fallback;
  }
}