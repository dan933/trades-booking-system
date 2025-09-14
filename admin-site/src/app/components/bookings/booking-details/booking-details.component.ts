import {
  Component,
  HostListener,
  inject,
  Injectable,
  OnInit,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { BookingService } from 'src/app/services/booking/booking.service';
import { SnackbarComponent } from '../../snackbar/snackbar.component';
@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.component.html',
  styleUrl: './booking-details.component.scss',
  standalone: false,
})
@Injectable({ providedIn: 'root' })
export class BookingDetailsComponent implements OnInit {
  private _snackBar = inject(MatSnackBar);

  bookingId: string;

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService
  ) {
    this.bookingId = this.route.snapshot.paramMap.get('id')!;
  }

  screenWidth: number = 0;

  durationInSeconds = 2000;

  openSnackBar(
    message: string,
    type: 'snackbar-success' | 'snackbar-warn' | 'snackbar-error'
  ) {
    this._snackBar.openFromComponent(SnackbarComponent, {
      duration: this.durationInSeconds * 1000,
      data: { message: message, type: type },
      panelClass: [type],
    });
  }

  booking: {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    startTime: string;
    endTime: string;
    formattedAmount: string;
    formattedDate: string;
    address: string;
    status?: string;
  } | null = null;

  ngOnInit(): void {
    this.openSnackBar('warn', 'snackbar-error');
    this.bookingService.getBooking(this.bookingId).then((res) => {
      this.booking = res;
    });

    this.screenWidth = window.innerWidth;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    console.log('window.innerWidth', window.innerWidth);

    this.screenWidth = window.innerWidth;
  }
}
