import {
  AfterViewInit,
  Component,
  HostListener,
  NgZone,
  OnInit,
} from '@angular/core';
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

  totalRevenue: string = '';
  totalRevenueLoading: boolean = false;

  //Customer count
  //Revenue
  //upcoming jobs count
  //completed jobs
  //chart of revenue
  //todays schedule

  screenWidth: number = 0;
  chart: any;

  async ngOnInit() {
    this.screenWidth = window.innerWidth; // Set initial width
  }

  renderChart() {
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
          data: [30, 40, 35, 50, 49, 60, 70, 91, 125],
        },
      ],
      chart: {
        type: 'line',
        height: this.screenWidth < 1261 ? 300 : 500,
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
        ],
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
    console.log('window.innerWidth', window.innerWidth);

    const currentWidth = +this.screenWidth;

    this.screenWidth = window.innerWidth;

    if (currentWidth < 1261 && window.innerWidth >= 1261) {
      console.log('render');
      this.renderChart();
    } else if (currentWidth >= 1261 && window.innerWidth < 1261) {
      this.renderChart();
    }
  }

  ngAfterViewInit() {
    this.renderChart();
    this.getTotalRevenue();
  }

  async getTotalRevenue() {
    this.totalRevenueLoading = true;
    this.dashboardService
      .getTotalRevenue()
      .then((resp) => {
        console.log('resp', resp);
        this.totalRevenue = resp;
      })
      .finally(() => (this.totalRevenueLoading = false));
  }
}
