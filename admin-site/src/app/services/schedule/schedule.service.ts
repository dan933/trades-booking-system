import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  Firestore,
  Timestamp,
  collection,
  getDocs,
  query,
  where,
  getFirestore,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);

  constructor() {}

  async getSchedule(date?: Date) {
    let userToken = await this.auth.currentUser?.getIdTokenResult();
    let orgId = userToken?.claims['org'];

    if (!orgId) {
      return [];
    }

    //get the organisation from firestore
    let bookingsRef: any = collection(
      this.firestore,
      `organisations/${orgId}/bookings`
    );

    // Add where clause to filter by date if date parameter is provided
    if (date) {
      let startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      let endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      bookingsRef = query(
        collection(this.firestore, `organisations/${orgId}/bookings`),
        where('bookingDate', '>=', startOfDay),
        where('bookingDate', '<=', endOfDay)
      );
    }

    let bookingsData = (await getDocs(bookingsRef)).docs.map((doc: any) => {
      let bookingData = doc.data();

      return {
        id: doc.id,
        ...bookingData,
        customerName: `${bookingData.firstName} ${bookingData.lastName}`,
        startTime: this.convertTo12HourFormat(bookingData.startHour),
        endTime: this.convertTo12HourFormat(bookingData.endHour),
        bookingDateString: bookingData.bookingDate
          .toDate()
          .toLocaleDateString(),
      };
    });

    return bookingsData;
  }

  convertTo12HourFormat(hour: number) {
    // Handle invalid input
    if (hour < 0 || hour > 24) {
      return 'Invalid hour input. Please input a number from 0 to 24.';
    }

    // Map the hour 0 and 24 to 12 (as they represent midnight)
    if (hour === 0 || hour === 24) {
      return '12:00 AM';
    }

    // Determine AM/PM
    let period = hour >= 12 ? 'PM' : 'AM';

    // Convert other hours to the 12-hour format
    if (hour > 12) {
      hour -= 12;
    }

    // Return the formatted time
    return `${hour}:00 ${period}`;
  }
}
