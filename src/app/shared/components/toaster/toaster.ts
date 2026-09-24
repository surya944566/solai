import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toaster',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toasts; track $index) {
        <div class="app-toast {{ toast.type }}">
          <span class="toast-icon">
            @switch (toast.type) {
              @case ('success') { <i class="bi bi-check-circle-fill" style="color: var(--success-color)"></i> }
              @case ('error') { <i class="bi bi-x-circle-fill" style="color: var(--danger-color)"></i> }
              @case ('warning') { <i class="bi bi-exclamation-triangle-fill" style="color: var(--warning-color)"></i> }
              @default { <i class="bi bi-info-circle-fill" style="color: var(--info-color)"></i> }
            }
          </span>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="btn btn-link btn-sm p-0 ms-2" (click)="dismiss($index)">&times;</button>
        </div>
      }
    </div>
  `,
})
export class ToasterComponent implements OnInit, OnDestroy {
  toasts: Array<Toast & { id: number }> = [];
  private sub?: Subscription;
  private counter = 0;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.sub = this.toastService.toasts$.subscribe((t) => {
      const id = ++this.counter;
      this.toasts.push({ ...t, id });
      setTimeout(() => this.remove(id), 3200);
    });
  }

  dismiss(index: number) {
    this.toasts.splice(index, 1);
  }

  private remove(id: number) {
    const i = this.toasts.findIndex((t) => t.id === id);
    if (i >= 0) this.toasts.splice(i, 1);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}