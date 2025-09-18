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
    this.setWeekView();
  }

  get tableData(): (string | { icon: string; color: string })[][] {
    return this.bookings.map((item) => [
      (item.firstName || '') + ' ' + (item.lastName || ''),
      item.formattedDate,
      item.startTime,
      item.endTime,
      item.formattedAmount,
      item.status === 'paid'
        ? { icon: 'check_circle', color: 'text-green-500' }
        : { icon: 'refresh', color: 'text-orange-500' },
    ]);
  }

  get actionRowData() {
    return this.bookings.map((item) => item.id);
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

  goToDetails = (id?: string) => {
    this.router.navigate(['/bookings', id]);
  };

  setWeekView() {
    const { startOfWeek, endOfWeek } = this.bookingService.getWeekView();

    this.startDate = this.bookingService.formatLocalDate(startOfWeek);
    this.endDate = this.bookingService.formatLocalDate(endOfWeek);
    this.resetAndGetBookings();
  }

  setMonthView() {
    const { startOfMonth, endOfMonth } = this.bookingService.getMonthView();

    this.startDate = this.bookingService.formatLocalDate(startOfMonth);
    this.endDate = this.bookingService.formatLocalDate(endOfMonth);
    this.resetAndGetBookings();
  }

  setYearView() {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31);

    this.startDate = this.bookingService.formatLocalDate(startOfYear);
    this.endDate = this.bookingService.formatLocalDate(endOfYear);
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
