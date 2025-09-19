import { Component, Injectable, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  standalone: false,
})
@Injectable({ providedIn: 'root' })
export class TableComponent {
  @Input() tableHeaders: string[] = [];
  @Input() tableData: (
    | string
    | { icon: string; color?: string; tooltip?: string }
  )[][] = [];
  @Input() actionRow?: string[] = [];
  @Input() action?: (id?: string) => void = () => {};
  @Input() actionLabel?: string = 'View';

  onAction(id: string) {
    this.action?.(id);
  }
}
