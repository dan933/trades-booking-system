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

    // console.log('this.lastDocument', this.lastDocument);

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

  setWeekView() {
    const today = new Date();
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    );
    const endOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay() + 6)
    );

    this.startDate = startOfWeek.toISOString().split('T')[0];
    this.endDate = endOfWeek.toISOString().split('T')[0];
    this.resetAndGetBookings();
  }

  setMonthView() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.startDate = startOfMonth.toISOString().split('T')[0];
    this.endDate = endOfMonth.toISOString().split('T')[0];
    this.resetAndGetBookings();
  }

  setYearView() {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31);

    this.startDate = startOfYear.toISOString().split('T')[0];
    this.endDate = endOfYear.toISOString().split('T')[0];
    this.resetAndGetBookings();
  }

  private resetAndGetBookings() {
    this.loadingBooking = true;
    this.lastDocument = undefined;
    this.hasMore = true;
    this.getBookings();
  }

  ngOnInit(): void {
    this.getBookings();
  }
}
