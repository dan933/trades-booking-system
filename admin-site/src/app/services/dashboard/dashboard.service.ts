import { Injectable } from '@angular/core';
import { Auth, idToken } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import {
  collection,
  where,
  query,
  getAggregateFromServer,
  sum,
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
      console.log('error aggregating data');
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
}
