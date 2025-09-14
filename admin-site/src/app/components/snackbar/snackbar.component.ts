import { Component, Inject, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

import { MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-snackbar',
  imports: [],
  templateUrl: './snackbar.component.html',
  styleUrl: './snackbar.component.scss',
})
export class SnackbarComponent {
  message = '';
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: { message: string }) {
    this.message = data.message;
  }
  snackBarRef = inject(MatSnackBarRef);
}
