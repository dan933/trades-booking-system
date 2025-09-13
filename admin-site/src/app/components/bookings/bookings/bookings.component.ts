import { Component } from '@angular/core';
import { AngularMaterialsModule } from 'src/app/angular-materials/angular-materials.module';

@Component({
  selector: 'app-bookings',
  imports: [AngularMaterialsModule],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.scss',
})
export class BookingsComponent {}
