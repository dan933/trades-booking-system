import { getIdToken, getAuth } from "firebase/auth";
const apiUrl = import.meta.env.VITE_APIURL;

import {
  getFirestore,
  getDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  startAfter,
  limit,
} from "firebase/firestore";

//todo add a guest user

//get user
const user = getAuth().currentUser;
let userId = user?.uid;

const db = getFirestore();

// console.log("userId", userId);

const getAppointments = async (
  orgId,
  lastVisible = null,
  size,
  stopCalls = false
) => {
  if (stopCalls) return;
  let appointmentQuery;

  if (lastVisible) {
    appointmentQuery = query(
      collection(db, `organisations/${orgId}/bookings`),
      where("userId", "==", `${userId}`),
      orderBy("bookingDate", "desc"),
      startAfter(lastVisible),
      limit(size || 2)
    );
  } else {
    appointmentQuery = query(
      collection(db, `organisations/${orgId}/bookings`),
      where("userId", "==", `${userId}`),
      orderBy("bookingDate", "desc"),
      limit(size || 2)
    );
  }

  let appointments = await getDocs(appointmentQuery);

  // Get the last visible document
  let newLastVisible = appointments.docs[appointments.docs.length - 1];

  let stopAPICalls = false;
  if (lastVisible) {
    console.log(newLastVisible, lastVisible);
    stopAPICalls = !newLastVisible;
  }

  appointments = appointments.docs.map((doc) => doc.data());

  return {
    appointments,
    lastVisible: newLastVisible,
    stopAPICalls,
  };
};

/**
 * - dateInput is optional if not set date will be current date
 * @param {string} orgId
 * @param {Date} dateInput
 * - returns the booked schedules for the date and the availability document of the organisation
 */
const getCalendarDatesAvailability = async (orgId, dateInput) => {
  //Get the companies availability document
  let availabilityDocRef = doc(
    db,
    `organisations/${orgId}/availability/opperatingHours`
  );

  //get the opperating hours gapBetweenAppointments settings and bookMonthsAhead limit
  let availabilityDoc = await getDoc(availabilityDocRef);

  const dateQuery = dateInput ? dateInput : new Date();
  dateQuery.setHours(0, 0, 0, 0);

  const endDateQuery = new Date(dateQuery);
  endDateQuery.setDate(endDateQuery.getDate() + 7);

  let bookedSchedulesQuery = query(
    collection(db, `organisations/${orgId}/bookedSchedule`),
    where("bookingScheduleDate", ">=", dateQuery),
    where("bookingScheduleDate", "<", endDateQuery)
  );

  let bookedSchedules = await getDocs(bookedSchedulesQuery);
  bookedSchedules = bookedSchedules.docs.map((doc) => doc.data());

  return {
    bookedSchedules,
    availabilityDoc: availabilityDoc.data(),
  };
};

const getTimeSlotsForDate = (
  bookingSchedule,
  selectedDate,
  availabilityDoc
) => {
  //get the weekday of the selected date
  let selectedDateWeekday = selectedDate.getDay();

  //get the opening times for the selected date
  let selectedDateOpeningTimes =
    availabilityDoc.openingTimes[selectedDateWeekday];

  //gapBetween
  let gapBetween = availabilityDoc.gapBetween;

  //todo potential api call to get the bookedSchedule for the selected date

  //filter the bookingSchedule for the selected date
  let bookingScheduleForSelectedDate = bookingSchedule.find((schedule) => {
    // console.log("schedule.bookingScheduleDate", schedule.bookingScheduleDate);
    //convert timestamp to date
    let scheduleDate = schedule.bookingScheduleDate
      .toDate()
      .toLocaleDateString();
    return scheduleDate === selectedDate.toLocaleDateString();
  });

  // console.log(
  //   "line 133 bookingScheduleForSelectedDate",
  //   bookingScheduleForSelectedDate
  // );

  //if there is a booking schedule for the selected date
  if (bookingScheduleForSelectedDate) {
    let timeSlotArray = [];
    let currentTimeSlot = [];

    Object.keys(bookingScheduleForSelectedDate.bookedTimes).forEach((key) => {
      //if the time slot is not booked
      //add current timeslot to the available timeslots array
      if (
        +key < selectedDateOpeningTimes.end &&
        !bookingScheduleForSelectedDate.bookedTimes[key] &&
        gapBetweenCheck(
          key,
          gapBetween,
          bookingScheduleForSelectedDate.bookedTimes
        )
      ) {
        currentTimeSlot.push(+key);

        //if the key is the last key
        if (+key === selectedDateOpeningTimes.end - 1)
          timeSlotArray.push(currentTimeSlot);
      } else {
        //add timeslot
        timeSlotArray.push(currentTimeSlot);

        //reset
        currentTimeSlot = [];
      }
    });

    console.log("timeSlotArray", timeSlotArray);

    //convert times into time and available hours
    let availableTimes = timeSlotArray.filter(
      (timeSlot) => timeSlot.length > 0
    );

    availableTimes = availableTimes.flatMap((timeSlot) => {
      let timeSlotHoursLeft = timeSlot.length + 1;

      //returns an array of available hours for the day
      let timeSlotHours = timeSlot.map((time) => {
        timeSlotHoursLeft--;
        return { time: `${time}:00`, availableHours: timeSlotHoursLeft };
      });

      return timeSlotHours;
    });

    console.log("availableTimes", availableTimes);

    return availableTimes;
  } else {
    //Number of opperating hours
    const startTime = selectedDateOpeningTimes.start;
    const endTime = selectedDateOpeningTimes.end;

    const availableTimes = [];

    //Number of bookings for the day
    for (let index = startTime; index < endTime; index++) {
      availableTimes.push({
        time: `${index}:00`,
        availableHours: endTime - index,
      });
    }

    return availableTimes;
  }
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getServices = async (orgId) => {
  const servicesRef = doc(db, `organisations/${orgId}/availability/services`);

  const servicesDoc = (await getDoc(servicesRef)).data();

  const services = servicesDoc.services;

  return services;
};

//Creates booking payload to be sent to the server
const createBookingPayload = (bookingData) => {
  console.log(bookingData);

  //get the timeSlot
  let timeSlot = bookingData?.selectedDateTimeSlot;

  //date in yyyy-mm-dd format
  let bookingDate = formatDate(timeSlot?.date);

  //get the start hour
  let startHour = timeSlot?.date.getHours();

  //add the userId to customer information
  let payload = bookingData;

  payload = {
    bookingDate: bookingDate,
    startHour: startHour,
    customerInformation: {
      ...payload.customerInformation,
    },
    services: payload.services,
    paymentDetails: bookingData.paymentDetails,
  };

  if (userId) {
    payload.customerInformation.userId = userId;
  } else {
    payload.customerInformation.userId = "Guest";
  }

  console.log("payload", payload);

  return JSON.stringify(payload);
};

//Calls api to attempt to create a booking
const createBooking = async (bookingData, orgId) => {
  try {
    let payload = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
      body: createBookingPayload(bookingData),
    };

    //If the user is not a guest
    //add Bearer token
    let token = null;
    if (user) {
      token = await getIdToken(user);
      payload.headers.Authorization = `Bearer ${token}`;
    } else {
      //if the user is a guest add guest to the payload
      payload.headers.Guest = "true";
    }

    console.log("payload", payload);

    const resposne = await fetch(`${apiUrl}/booking/${orgId}/book`, payload);

    const bodyResponse = await resposne?.json();

    return bodyResponse;
  } catch (error) {
    throw error?.message;
  }
};

const sendBookingConfirmationEmail = async (bookingData, orgId) => {
  try {
    let payload = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
      body: JSON.stringify({ bookingRequest: bookingData }),
    };

    //If the user is not a guest
    //add Bearer token
    let token = null;
    if (user) {
      token = await getIdToken(user);
      payload.headers.Authorization = `Bearer ${token}`;
    } else {
      //if the user is a guest add guest to the payload
      payload.headers.Guest = "true";
    }

    console.log("payload send email", payload);

    const resposne = await fetch(
      `${apiUrl}/booking/${orgId}/send-confirmation-email`,
      payload
    );

    const bodyResponse = await resposne?.json();

    return bodyResponse;
  } catch (error) {
    throw error?.message;
  }
};

//----------------------- Helpers --------------------------//
//helper gapBetweenCheck
//check that the gap between settings have been met
const gapBetweenCheck = (key, gapBetween, bookedTimes) => {
  for (let i = 1; gapBetween >= i; i++) {
    //if the next timeslot is booked
    if (bookedTimes[`${+key + i}`]) {
      return false;
    }
  }

  return true;
};

export {
  getAppointments,
  getServices,
  getTimeSlotsForDate,
  getCalendarDatesAvailability,
  createBooking,
  sendBookingConfirmationEmail,
};
