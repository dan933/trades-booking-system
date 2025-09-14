import { Component, Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { BookingService } from 'src/app/services/booking/booking.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.scss',
  standalone: false,
})
@Injectable({ providedIn: 'root' })
export class BookingsComponent implements OnInit {
  startDate: string = new Date().toISOString()?.split('T')[0];
  endDate: string = new Date().toISOString()?.split('T')[0];

  constructor(private bookingService: BookingService, private router: Router) {
    let endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    this.endDate = endDate.toISOString()?.split('T')[0];
  }

  lastDocument?: QueryDocumentSnapshot<DocumentData>;
  hasMore: boolean = true;
  loadingBooking: boolean = false;

  bookings: {
    id: string;
    firstName: string;
    lastName: string;
    formattedDate: string;
    startTime: string;
    endTime: string;
    formattedAmount: string;
    status: string;
  }[] = [];

  async getBookings() {
    const size = 30;

    this.loadingBooking = true;
    const bookingsResp = await this.bookingService.getBookings(
      {
        start: new Date(this.startDate),
        end: new Date(this.endDate),
      },
      size,
      ...(this.lastDocument ? [this.lastDocument] : [])
    );

    console.log('this.lastDocument', this.lastDocument);

    if (this.lastDocument) {
      this.bookings = [...this.bookings, ...bookingsResp.bookings];
    } else {
      this.bookings = bookingsResp.bookings;
    }

    this.hasMore = bookingsResp.hasMore;
    this.lastDocument = bookingsResp.lastDocument;

    this.loadingBooking = false;
  }

  goToDetails(id: string) {
    this.router.navigate(['/bookings', id]);
  }

  ngOnInit(): void {
    this.getBookings();
  }
}
