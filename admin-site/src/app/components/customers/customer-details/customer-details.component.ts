import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { BookingService } from 'src/app/services/booking/booking.service';
import { CustomerService } from 'src/app/services/customer/customer.service';

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.scss',
  standalone: false,
})
export class CustomerDetailsComponent implements OnInit {
  customerId: string;

  constructor(
    private customerService: CustomerService,
    private bookingService: BookingService,
    private route: ActivatedRoute
  ) {
    this.customerId = this.route.snapshot.paramMap.get('id')!;
  }

  screenWidth: number = 0;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    // console.log('window.innerWidth', window.innerWidth);

    this.screenWidth = window.innerWidth;
  }

  customer: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    phoneNumber: string;
  } | null = null;

  customerLoading: boolean = false;
  bookingLoading: boolean = false;

  startDate: string = new Date().toISOString()?.split('T')[0];
  endDate: string = new Date().toISOString()?.split('T')[0];
  lastDocument?: QueryDocumentSnapshot<DocumentData>;
  hasMore: boolean = false;

  bookings: {
    id: string;
    formattedDate: string;
    startTime: string;
    endTime: string;
    formattedAmount: string;
    status: string;
  }[] = [];

  async getBookings() {
    const size = 30;

    this.bookingLoading = true;
    const bookingsResp = await this.bookingService.getBookings(
      {
        start: new Date(this.startDate),
        end: new Date(this.endDate),
      },
      size,
      ...(this.lastDocument ? [this.lastDocument] : [undefined]),
      ...(this.customerId ? [this.customerId] : [undefined])
    );

    if (this.lastDocument) {
      this.bookings = [...this.bookings, ...bookingsResp.bookings];
    } else {
      this.bookings = bookingsResp.bookings;
    }

    console.log('bookings', this.bookings);

    this.hasMore = bookingsResp.hasMore;
    this.lastDocument = bookingsResp.lastDocument;

    this.bookingLoading = false;
  }

  private resetAndGetBookings() {
    this.bookingLoading = true;
    this.lastDocument = undefined;
    this.hasMore = true;
    this.getBookings();
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

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
    this.customerLoading = true;
    this.customerService
      .getCustomer(this.customerId)
      .then((resp) => {
        console.log({ resp });
        this.customer = resp;
      })
      .finally(() => {
        this.customerLoading = false;
      });
    const size = 30;
    this.getBookings();
  }

  openMaps(address: string | undefined) {
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
}
