import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';

import {
  collection,
  where,
  query,
  getDocs,
  orderBy,
  limit,
  QueryDocumentSnapshot,
  startAfter,
  getDoc,
  doc,
} from 'firebase/firestore';

import { DocumentData } from 'node_modules/rxfire/firestore/interfaces';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  async refundBooking(bookingId: string) {
    let token = await this.auth.currentUser?.getIdToken();

    let response = await fetch(`${environment.apiUrl}/refund-booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        bookingId: bookingId,
      }),
    });

    return response.json();
  }

  async getBookings(
    dateRange: { start: Date; end: Date },
    size: number = 30,
    lastDocument?: QueryDocumentSnapshot<DocumentData>,
    customerId?: string
  ) {
    const userToken = await this.auth.currentUser?.getIdTokenResult();
    const orgId = userToken?.claims['org'];

    const bookingsCol = collection(
      this.firestore,
      `organisations/${orgId}/bookings`
    );

    const bookingsQuery = query(
      bookingsCol,
      ...(customerId ? [where('userId', '==', customerId)] : []),
      where('bookingDate', '>=', dateRange.start),
      where('bookingDate', '<=', dateRange.end),
      orderBy('bookingDate', 'desc'),
      ...(lastDocument ? [startAfter(lastDocument)] : []),
      limit(size)
    );

    const querySnapshot = await getDocs(bookingsQuery);

    return {
      bookings: querySnapshot.docs.map((doc) => {
        let data = doc.data();
        const startHour = data['startHour'];
        const endHour = data['endHour'];

        let startTime: string = '';
        let endTime: string = '';

        if (typeof startHour === 'number' && typeof endHour === 'number') {
          startTime = this.convertTo12Hour(startHour);
          endTime = this.convertTo12Hour(endHour);
        }

        let formattedAmount: string = '';

        if (typeof data['amount'] === 'number') {
          data['amount'] = data['amount'] / 100;

          formattedAmount = data['amount'].toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          });
        }

        const bookingDateSeconds = data?.['bookingDate']?.['seconds'];

        let formattedDate = '';

        if (bookingDateSeconds) {
          const bookingDate = new Date(bookingDateSeconds * 1000);
          formattedDate = bookingDate.toLocaleDateString('en-GB');
        }

        return {
          id: doc.id,
          startTime,
          endTime,
          formattedAmount,
          formattedDate,
          firstName: data['firstName'],
          lastName: data['lastName'],
          // email: data['email'],
          status: data['status'],
          // ...doc.data(),
        };
      }),
      lastDocument: querySnapshot.docs[querySnapshot.docs.length - 1], // For next page
      hasMore: querySnapshot.docs.length === size, // Check if more pages exist
    };
  }

  async getBooking(bookingId: string) {
    const userToken = await this.auth.currentUser?.getIdTokenResult();
    const orgId = userToken?.claims['org'];

    const bookingDocRef = doc(
      this.firestore,
      `organisations/${orgId}/bookings/${bookingId}`
    );

    const docSnapshot = await getDoc(bookingDocRef);

    if (docSnapshot.exists()) {
      const data = docSnapshot.data();

      console.log({ data });

      let bookingTotal = 0;

      const services: {
        hours: number;
        name: string;
        rate: string;
        total: string;
      }[] = (data['services'] || []).map(
        (item: {
          selection: { rate: number; name: string };
          hours: number;
        }) => {
          //convert to string dollars
          const formattedAmount = (item?.selection?.rate || 0).toLocaleString(
            'en-US',
            {
              style: 'currency',
              currency: 'USD',
            }
          );

          const total =
            item?.hours && item?.selection?.rate
              ? item.hours * item?.selection?.rate
              : 0;

          bookingTotal += total;

          const formattedTotal = total.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          });

          return {
            hours: item?.hours,
            name: item?.selection?.name,
            rate: formattedAmount,
            total: formattedTotal,
          };
        }
      );

      const formattedBookingTotal = bookingTotal.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      });

      const startHour = data['startHour'];
      const endHour = data['endHour'];

      let startTime: string = '';
      let endTime: string = '';

      if (typeof startHour === 'number' && typeof endHour === 'number') {
        startTime = this.convertTo12Hour(startHour);
        endTime = this.convertTo12Hour(endHour);
      }

      if (typeof startHour === 'number' && typeof endHour === 'number') {
        startTime = this.convertTo12Hour(startHour);
        endTime = this.convertTo12Hour(endHour);
      }

      let formattedDate = '';

      const bookingDateSeconds = data?.['bookingDate']?.['seconds'];

      if (bookingDateSeconds) {
        const bookingDate = new Date(bookingDateSeconds * 1000);
        formattedDate = bookingDate.toLocaleDateString('en-GB');
      }

      let formattedAmount: string = '';

      if (typeof data['amount'] === 'number') {
        data['amount'] = data['amount'] / 100;

        formattedAmount = data['amount'].toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        });
      }

      return {
        id: docSnapshot.id,
        userId: data['userId'],
        firstName: data['firstName'],
        lastName: data['lastName'],
        phoneNumber: data['phoneNumber'],
        status: data['status'],
        startTime,
        endTime,
        formattedAmount,
        formattedDate,
        address: data?.['address'],
        services: services,
        bookingTotal: formattedBookingTotal,
        // stripeChargeId: data?.['stripeChargeId'],
        // ...docSnapshot.data(),
      };
    } else {
      throw new Error('Booking not found');
    }
  }

  convertTo12Hour(hour: number): string {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
    });
  }

  /**
   * -Formats data to local date yyyy-mm-dd
   */
  formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getWeekView() {
    const today = new Date();
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay() + 1)
    );
    const endOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay() + 7)
    );

    return { startOfWeek, endOfWeek };
  }

  getMonthView() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return { startOfMonth, endOfMonth };
  }
}
