import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//Angular Materials
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

let angularMaterials = [
  MatDatepickerModule,
  MatButtonModule,
  MatInputModule,
  MatToolbarModule,
  MatIconModule,
  MatMenuModule,
  MatCardModule,
  MatGridListModule,
  MatCheckboxModule,
  MatSelectModule,
  MatAutocompleteModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  ReactiveFormsModule,
  MatFormFieldModule,
  MatDialogModule,
  MatSlideToggleModule,
  MatTooltipModule,
];

@NgModule({
  declarations: [],
  imports: [CommonModule, angularMaterials],
  exports: [angularMaterials],
})
export class AngularMaterialsModule {}
