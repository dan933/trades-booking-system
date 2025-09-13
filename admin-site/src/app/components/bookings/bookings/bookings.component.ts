import { Component, Injectable, OnInit } from '@angular/core';
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

  constructor(private bookingService: BookingService) {
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
    this.loadingBooking = true;
    const bookingsResp = await this.bookingService.getBookings({
      start: new Date(this.startDate),
      end: new Date(this.endDate),
    });

    this.bookings = bookingsResp.bookings;
    this.hasMore = bookingsResp.hasMore;
    this.lastDocument = bookingsResp.lastDocument;

    this.loadingBooking = false;
  }

  ngOnInit(): void {
    this.getBookings();
  }
}
