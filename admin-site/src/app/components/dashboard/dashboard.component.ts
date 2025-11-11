import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false,
})
export class DashboardComponent implements OnInit, AfterViewInit {
  currentUser: any;
  constructor(private dashboardService: DashboardService, private auth: Auth) {
    this.currentUser = this.auth.currentUser;
  }

  screenWidth: number = 0;

  async ngOnInit() {
    this.screenWidth = window.innerWidth;
  }

  chart: any;

  async renderChart() {
    this.dashboardService.getPastYearCategories();
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
        categories: this.dashboardService.getPastYearCategories(),
      },
    };

    this.chart = new (window as any).ApexCharts(
      document.querySelector(targetElement),
      options
    );

    this.chart.render();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const currentWidth = +this.screenWidth;

    this.screenWidth = window.innerWidth;

    if (currentWidth < 1261 && window.innerWidth >= 1261) {
      this.renderChart();
    } else if (currentWidth >= 1261 && window.innerWidth < 1261) {
      this.renderChart();
    }
  }

  totalRevenue: string = '';
  totalRevenueLoading: boolean = false;

  async getTotalRevenue() {
    this.totalRevenueLoading = true;
    this.dashboardService
      .getTotalRevenue()
      .then((resp) => {
        this.totalRevenue = resp;
      })
      .catch((err) => {
        console.log('err', err);
      })
      .finally(() => (this.totalRevenueLoading = false));
  }

  totalMonthRevenue: string = '';
  totalMonthRevenueLoading: boolean = false;

  async getCurrentMonthRevenue() {
    this.totalMonthRevenueLoading = true;
    this.dashboardService
      .getCurrentMonthRevenue()
      .then((resp) => {
        this.totalMonthRevenue = resp;
      })
      .catch((err) => {
        console.log('err', err);
      })
      .finally(() => (this.totalMonthRevenueLoading = false));
  }

  totalCustomers: number | null = null;
  totalCustomersLoading: boolean = false;

  async getTotalCustomers() {
    this.totalCustomersLoading = true;
    this.dashboardService
      .getTotalCustomers()
      .then((resp) => {
        this.totalCustomers = resp;
      })
      .catch((err) => {
        console.log('err', err);
      })
      .finally(() => (this.totalCustomersLoading = false));
  }

  chartData: number[] = [];
  chartDataLoading: boolean = false;

  async getRevenueChartData() {
    this.chartDataLoading = true;
    this.chartData = await this.dashboardService.getRevenueChartData();
    this.chart.updateSeries([
      {
        name: 'Revenue',
        data: this.chartData,
      },
    ]);
    this.chartDataLoading = false;
  }

  upcomingBookings: number | null = null;
  upcomingBookingsLoading: boolean = false;

  async getUpcomingBookings() {
    this.upcomingBookingsLoading = true;
    this.upcomingBookings = await this.dashboardService.getUpcomingBookings();
    this.upcomingBookingsLoading = false;
  }

  pastBookings: number | null = null;
  pastBookingsLoading: boolean = false;

  async getPastBookings() {
    this.pastBookingsLoading = true;
    this.pastBookings = await this.dashboardService.getPastBookings();
    this.pastBookingsLoading = false;
  }

  ngAfterViewInit() {
    this.renderChart();
    this.getRevenueChartData();
    this.getTotalRevenue();
    this.getCurrentMonthRevenue();
    this.getTotalCustomers();
    this.getUpcomingBookings();
    this.getPastBookings();
  }
}
