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
  @Input() tableData: string[][] = [];
  @Input() actionRow?: string[] = [];
  @Input() action?: (id?: string) => void = () => {};

  onAction(id: string) {
    this.action?.(id);
  }
}
