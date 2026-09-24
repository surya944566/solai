import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    @if (pages > 1) {
      <nav aria-label="Pagination">
        <ul class="pagination justify-content-center mb-0">
          <li class="page-item" [class.disabled]="page <= 1">
            <button class="page-link" (click)="go(page - 1)"><i class="bi bi-chevron-left"></i></button>
          </li>
          @for (p of pageNumbers; track p) {
            <li class="page-item" [class.active]="p === page">
              <button class="page-link" (click)="go(p)">{{ p }}</button>
            </li>
          }
          <li class="page-item" [class.disabled]="page >= pages">
            <button class="page-link" (click)="go(page + 1)"><i class="bi bi-chevron-right"></i></button>
          </li>
        </ul>
      </nav>
    }
  `,
})
export class PaginationComponent implements OnChanges {
  @Input() page = 1;
  @Input() pages = 1;
  @Output() pageChange = new EventEmitter<number>();

  pageNumbers: number[] = [];

  ngOnChanges() {
    this.pageNumbers = this.buildPages(this.page, this.pages);
  }

  go(p: number) {
    if (p < 1 || p > this.pages) return;
    this.pageChange.emit(p);
  }

  private buildPages(current: number, total: number): number[] {
    const max = 5;
    if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);
    const start = Math.max(1, Math.min(current - 2, total - max + 1));
    return Array.from({ length: max }, (_, i) => start + i);
  }
}