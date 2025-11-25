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

  durationInSeconds = 3;

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

  openMaps(address: string | undefined) {
    // https://www.google.com/maps/place/16+Marlborough+Rd,+Heathmont+VIC+3135

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
    window.open(mapsUrl, '_blank');
  }

  callPhone(phoneNumber: string | undefined) {
    if (phoneNumber) {
      // Remove any non-digit characters except +
      const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
      window.location.href = `tel:${cleanNumber}`;
    }
  }

  cancelBookingView = 'cancelButton';

  async cancelBooking(bookingId: string | undefined, isConfirmed?: boolean) {
    if (!bookingId) {
      this.openSnackBar('Error finding booking id', 'snackbar-error');
      return;
    }

    if (typeof isConfirmed === 'undefined') {
      this.cancelBookingView = 'confirmation';
      return;
    } else if (isConfirmed === false) {
      this.cancelBookingView = 'cancelButton';
      return;
    } else if (isConfirmed === true) {
      this.cancelBookingView = 'loading';

      await this.bookingService
        .refundBooking(bookingId)
        .then(() => {
          this.openSnackBar('Booking Cancelled', 'snackbar-success');
          this.cancelBookingView = 'cancelButton';
        })
        .catch((error) => {
          this.openSnackBar(
            `${error?.message || 'Error Canceling Booking'}`,
            'snackbar-error'
          );
          this.cancelBookingView = 'cancelButton';
        });

      await this.bookingService
        .getBooking(this.bookingId)
        .then((res) => {
          this.booking = res;
        })
        .catch((error) => {
          this.openSnackBar(
            `${error?.message || 'Error Getting Booking'}`,
            'snackbar-error'
          );
        });
    }
  }

  booking: {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    startTime: string;
    endTime: string;
    formattedAmount: string;
    formattedDate: string;
    address: string;
    status?: string;
    services: {
      hours: number;
      name: string;
      rate: string;
      total: string;
    }[];
    bookingTotal: string;
  } | null = null;

  ngOnInit(): void {
    this.bookingService
      .getBooking(this.bookingId)
      .then((res) => {
        this.booking = res;
      })
      .catch((error) => {
        this.openSnackBar(
          `${error?.message || 'Error Getting Booking'}`,
          'snackbar-error'
        );
      });

    this.screenWidth = window.innerWidth;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.screenWidth = window.innerWidth;
  }
}
