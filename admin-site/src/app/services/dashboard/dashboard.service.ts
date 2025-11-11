import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import {
  collection,
  where,
  query,
  getAggregateFromServer,
  sum,
  count,
  getDocs,
} from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  async getTotalRevenue() {
    let userToken = await this.auth.currentUser?.getIdTokenResult();
    let orgId = userToken?.claims['org'];

    const bookingsCol = collection(
      this.firestore,
      `organisations/${orgId}/bookings`
    );

    const bookingsQuery = query(bookingsCol, where('status', '==', 'paid'));

    const sumAggregateQuery = await getAggregateFromServer(bookingsQuery, {
      totalRevenue: sum('amount'),
    }).catch((error) => {
      console.log('error aggregating data', error);
      return null;
    });

    const totalRevenue = sumAggregateQuery?.data()?.totalRevenue || 0;

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    let formattedRevenue = formatter.format(Math.round(totalRevenue / 100));

    return formattedRevenue ? formattedRevenue : '-';
  }

  async getCurrentMonthRevenue() {
    let userToken = await this.auth.currentUser?.getIdTokenResult();
    let orgId = userToken?.claims['org'];

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const bookingsCol = collection(
      this.firestore,
      `organisations/${orgId}/bookings`
    );

    const bookingsQuery = query(
      bookingsCol,
      where('status', '==', 'paid'),
      where('bookingDate', '>=', startOfMonth),
      where('bookingDate', '<=', endOfMonth)
    );

    const sumAggregateQuery = await getAggregateFromServer(bookingsQuery, {
      totalRevenue: sum('amount'),
    }).catch((error) => {
      console.log('error aggregating current month data', error);
      return null;
    });

    // Sep 11, 2025

    const totalRevenue = sumAggregateQuery?.data()?.totalRevenue || 0;

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    let formattedRevenue = formatter.format(Math.round(totalRevenue / 100));
    return formattedRevenue ? formattedRevenue : '-';
  }

  async getTotalCustomers() {
    let userToken = await this.auth.currentUser?.getIdTokenResult();
    let orgId = userToken?.claims['org'];

    const usersCol = collection(this.firestore, `organisations/${orgId}/users`);

    const countAggregateQuery = await getAggregateFromServer(usersCol, {
      totalUsers: count(),
    }).catch((error) => {
      console.log('error counting users');
      return null;
    });

    const totalUsers = countAggregateQuery?.data()?.totalUsers || 0;
    return totalUsers;
  }

  async getRevenueChartData(userId?: string) {
    let userToken = await this.auth.currentUser?.getIdTokenResult();
    let orgId = userToken?.claims['org'];

    const now = new Date();
    const startOfPast12Months = new Date(
      now.getFullYear(),
      now.getMonth() - 11,
      1
    );
    const endOfPast12Months = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const bookingsCol = collection(
      this.firestore,
      `organisations/${orgId}/bookings`
    );

    const bookingsQuery = query(
      bookingsCol,
      where('status', '==', 'paid'),
      ...(userId ? [where('userId', '==', userId)] : []),
      where('bookingDate', '>=', startOfPast12Months),
      where('bookingDate', '<=', endOfPast12Months)
    );

    const bookingsSnapshot = await getDocs(bookingsQuery);

    const bookingData = bookingsSnapshot.docs.map((item) => {
      const data = item.data();

      return {
        id: item.id,
        amount: data?.['amount'] || 0,
        bookingDate: typeof data?.['bookingDate']?.seconds
          ? new Date(data?.['bookingDate']?.seconds * 1000)
          : null,
      };
    });

    let monthlyRevenue = bookingData.reduce<{
      [month: number]: number;
    }>((acc, item) => {
      if (!item?.bookingDate) {
        return acc;
      }

      const monthNumber = item.bookingDate.getMonth() + 1;

      if (!acc[monthNumber]) {
        acc[monthNumber] = item.amount / 100;
      } else {
        acc[monthNumber] += item.amount / 100;
      }

      return acc;
    }, {});

    let chartData = [];

    for (let index = 0; index <= 11; index++) {
      if (monthlyRevenue[index]) {
        chartData.push(monthlyRevenue[index]);
      } else {
        chartData.push(0);
      }
    }

    return chartData;
  }

  async getUpcomingBookings() {
    let userToken = await this.auth.currentUser?.getIdTokenResult();
    let orgId = userToken?.claims['org'];

    const now = new Date();

    const bookingsCol = collection(
      this.firestore,
      `organisations/${orgId}/bookings`
    );

    const bookingsQuery = query(
      bookingsCol,
      where('status', '==', 'paid'),
      where('bookingDate', '>=', now)
    );

    const countAggregateQuery = await getAggregateFromServer(bookingsQuery, {
      upcomingBookings: count(),
    }).catch((error) => {
      console.log('error counting upcoming bookings');
      return null;
    });

    const upcomingCount = countAggregateQuery?.data()?.upcomingBookings || 0;
    return upcomingCount;
  }

  async getPastBookings() {
    let userToken = await this.auth.currentUser?.getIdTokenResult();
    let orgId = userToken?.claims['org'];

    const now = new Date();

    const bookingsCol = collection(
      this.firestore,
      `organisations/${orgId}/bookings`
    );

    const bookingsQuery = query(
      bookingsCol,
      where('status', '==', 'paid'), // or 'paid' depending on your status system
      where('bookingDate', '<', now)
    );

    const countAggregateQuery = await getAggregateFromServer(bookingsQuery, {
      pastBookings: count(),
    }).catch((error) => {
      console.log('error counting past bookings');
      return null;
    });

    const pastCount = countAggregateQuery?.data()?.pastBookings || 0;
    return pastCount;
  }

  getPastYearCategories() {
    const now = new Date();
    const categories: string[] = [];
    let currentMonth = now.getMonth();

    while (categories?.length < 12) {
      const monthName = new Date(0, currentMonth).toLocaleString('default', {
        month: 'short',
      });
      categories.unshift(monthName);

      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
      }
    }

    return categories;
  }
}
