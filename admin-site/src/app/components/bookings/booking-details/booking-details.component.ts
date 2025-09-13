import { Component, HostListener, Injectable, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookingService } from 'src/app/services/booking/booking.service';
@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.component.html',
  styleUrl: './booking-details.component.scss',
  standalone: false,
})
@Injectable({ providedIn: 'root' })
export class BookingDetailsComponent implements OnInit {
  bookingId: string;
  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService
  ) {
    this.bookingId = this.route.snapshot.paramMap.get('id')!;
  }

  screenWidth: number = 0;

  ngOnInit(): void {
    this.bookingService.getBooking(this.bookingId).then((res) => {
      console.log(res);
    });

    this.screenWidth = window.innerWidth;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    // console.log('window.innerWidth', window.innerWidth);

    const currentWidth = +this.screenWidth;

    this.screenWidth = window.innerWidth;
  }
}
