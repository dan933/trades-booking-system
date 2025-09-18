import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { BookingService } from 'src/app/services/booking/booking.service';
import { CustomerService } from 'src/app/services/customer/customer.service';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.scss',
  standalone: false,
})
export class CustomerDetailsComponent implements OnInit, AfterViewInit {
  customerId: string;

  constructor(
    private customerService: CustomerService,
    private bookingService: BookingService,
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardService
  ) {
    this.customerId = this.route.snapshot.paramMap.get('id')!;
    this.setMonthView();
  }
  ngAfterViewInit(): void {
    this.renderChart();
    this.getRevenueChartData(this.customerId);
  }

  screenWidth: number = 0;
  chart: any;

  async renderChart() {
    if (this.chart) {
      this.chart.destroy();
    }

    const targetElement = this.screenWidth < 1261 ? '#chart-mobile' : '#chart';

    const options = {
      theme: {
        mode: 'dark',
      },
      series: [
        {
          name: 'Revenue',
          data: this.chartData,
        },
      ],
      chart: {
        type: 'line',
        height: this.screenWidth < 1261 ? 300 : 400,
        background: 'transparent',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
          type: 'x',
          autoScaleYaxis: true,
          zoomedArea: {
            fill: {
              color: '#90CAF9',
              opacity: 0.4,
            },
            stroke: {
              color: '#0D47A1',
              opacity: 0.4,
              width: 1,
            },
          },
        },
        pan: {
          enabled: true,
          type: 'x',
        },
        selection: {
          enabled: true,
          type: 'x',
        },
        events: {
          beforeMount: function (chartContext: any, config: any) {
            // Disable passive event listeners warning
          },
        },
      },
      xaxis: {
        categories: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
      },
    };

    this.chart = new (window as any).ApexCharts(
      document.querySelector(targetElement),
      options
    );

    this.chart.render();
  }

  chartData: number[] = [];
  chartDataLoading: boolean = false;

  async getRevenueChartData(userId?: string) {
    this.chartDataLoading = true;
    this.chartData = await this.dashboardService.getRevenueChartData(userId);
    this.chart.updateSeries([
      {
        name: 'Revenue',
        data: this.chartData,
      },
    ]);
    this.chartDataLoading = false;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    // console.log('window.innerWidth', window.innerWidth);

    const currentWidth = +this.screenWidth;

    this.screenWidth = window.innerWidth;

    if (currentWidth < 1261 && window.innerWidth >= 1261) {
      // console.log('render');
      this.renderChart();
    } else if (currentWidth >= 1261 && window.innerWidth < 1261) {
      this.renderChart();
    }
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

  get tableData(): (string | { icon: string; color: string })[][] {
    return this.bookings.map((item) => [
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

  goToDetails = (id?: string) => {
    this.router.navigate(['/bookings', id]);
  };

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

    this.getBookings();
  }

  openMaps(address: string | undefined) {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
    window.open(mapsUrl, '_blank');
  }

  async callPhone(phoneNumber: string | undefined) {
    if (phoneNumber) {
      await navigator.clipboard.writeText(phoneNumber);
      // Remove any non-digit characters except +
      const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
      window.location.href = `tel:${cleanNumber}`;
    }
  }

  async onEmailClick(email?: string) {
    if (email) {
      try {
        await navigator.clipboard.writeText(email);
        window.location.href = `mailto:${email}`;
      } catch (err) {
        console.error('Failed to copy: ', err);
        window.open(`mailto:${email}`, '_blank');
      }
    }
  }
}
