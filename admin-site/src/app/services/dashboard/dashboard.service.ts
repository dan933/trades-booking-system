import { Injectable, inject } from '@angular/core';
import { Auth, idToken } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  DocumentReference,
  addDoc,
  where,
  query,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);

  constructor() {}

  async getMonthlyRevenue() {
    let userToken = await this.auth.currentUser?.getIdTokenResult();
    let orgId = userToken?.claims['org'];

    const bookingsCol = collection(
      this.firestore,
      `organisations/${orgId}/bookings`
    );

    const bookingsQuery = query(bookingsCol, where('status', '==', 'paid'));
    const sumAggregateQuery = await getAggr;
  }
}
