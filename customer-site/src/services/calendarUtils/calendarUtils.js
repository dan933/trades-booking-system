const CalendarUtils = {
  /**
   * - Creates booked events for calendar based on bookedSchedule collection
   * - These are non editable events
   * @param {Array<{bookedTimes: {[hour: number]: boolean}, bookingScheduleDate: {seconds: number; nanoseconds: number}}>} bookedSchedules
   */
  GenerateBookedOutTimes(bookedSchedules) {
    /**
    //  * @type {import("@fullcalendar/core").EventInput[]}
     */
    const events = [];

    for (let index = 0; index < bookedSchedules.length; index++) {
      const bookedSchedule = bookedSchedules[index];

      const dayHasBookings = Object.values(
        bookedSchedule.bookedTimes || {}
      ).some((booking) => booking === true);

      //check if there are any bookings
      if (!dayHasBookings) {
        continue;
      }

      if (typeof bookedSchedule.bookingScheduleDate?.seconds !== "number") {
        continue;
      }

      //   console.log("bookedSchedule", bookedSchedule);

      let bookingDate = new Date(
        bookedSchedule.bookingScheduleDate?.seconds * 1000
      );
      bookingDate = bookingDate.toISOString();
      bookingDate = bookingDate.split("T")[0]; //get only the date part
      //   console.log("bookingDate", bookingDate);

      const eventsToAdd = Object.entries(
        bookedSchedule?.bookedTimes || []
      ).reduce(
        (acc, [hour, active]) => {
          if (!active) {
            acc.lastHourWasActive = active;
            return acc;
          }

          if (acc.lastHourWasActive && acc.events?.length) {
            acc.events[acc.events.length - 1].end = `${bookingDate}T${`${
              +hour + 1
            }`.padStart(2, "0")}:00:00`;

            return acc;
          }

          const endHour = +hour === 24 ? `24` : `${+hour + 1}`;

          let newEvent = {
            title: "Unavailable",
            start: `${bookingDate}T${hour.padStart(2, "0")}:00:00`,
            end: `${bookingDate}T${endHour.padStart(2, "0")}:00:00`,
            editable: false,
            startEditable: false,
            durationEditable: false,
            classNames: ["unavailable-event"],
          };

          //   console.log("newEvent", newEvent);

          acc.events.push(newEvent);
          acc.lastHourWasActive = active;

          return acc;
        },
        {
          events: [],
          lastHourWasActive: false,
        }
      );

      events.push(...(eventsToAdd?.events || []));
    }

    return events;
  },
  /**
   * @param {Array<{bookedTimes: {[hour: number]: boolean}, bookingScheduleDate: {seconds: number; nanoseconds: number}}>} bookedSchedules
   * @param {{bookMonthsAheadLimit:number, gapBetween:number, openingTimes: {[day:string]: {end: number; start:number, open: boolean}}}} availabilityDoc
   * @param {"desktop" | "mobile"} view
   * @param {Date} startDate
   */
  generateTimeTable(bookedSchedules, availabilityDoc, view, startDate) {
    // Find earliest start time from open days
    const openDays = Object.values(availabilityDoc?.openingTimes).filter(
      (day) => day.open
    );

    let slotMinTime = `${Math.min(...openDays.map((day) => day.start))
      .toString()
      .padStart(2, "0")}:00:00`;

    let slotMaxTime = `${Math.max(...openDays.map((day) => day.end))
      .toString()
      .padStart(2, "0")}:00:00`;

    if (!openDays?.length) {
      slotMaxTime = "24:00:00";
      slotMinTime = "00:00:00";
    }

    const gapBetween = availabilityDoc?.gapBetween || 1;

    const openingTimes = Object.entries(
      availabilityDoc?.openingTimes || {}
    ).reduce((acc, [day, { start, end }]) => {
      acc.push({ day: +day, start, end });
      return acc;
    }, []);

    let days = view === "desktop" ? 7 : 3;

    let currentDate = new Date(startDate);

    /**
     * @type {import("@fullcalendar/core").EventInput[]}
     */
    const availableSlots = [];
    /**
     * @type {import("@fullcalendar/core").EventInput[]}
     */
    const unavailableSlots = [];

    for (let index = 0; index < days; index++) {
      const dayIndex = currentDate.getDay();

      const dayOpeningTimes = openingTimes.find(
        (openingTime) => openingTime.day === dayIndex
      );

      const currentDateString = currentDate.toISOString().split("T")[0];

      //Get booked schedule for day
      const bookedScheduleForDay = bookedSchedules.find((bookedSchedule) => {
        if (typeof bookedSchedule.bookingScheduleDate?.seconds !== "number") {
          return false;
        }

        let bookingDate = new Date(
          bookedSchedule.bookingScheduleDate?.seconds * 1000
        );
        let bookingDateString = bookingDate.toISOString().split("T")[0]; //get only the date part

        return bookingDateString === currentDateString;
      });

      const bookedTimes = bookedScheduleForDay?.bookedTimes || {};

      const isToday =
        currentDateString === new Date().toISOString().split("T")[0];

      const isPast = new Date(currentDateString) < new Date();

      const currentHour = new Date().getHours();

      if (dayOpeningTimes.start > 0) {
        unavailableSlots.push({
          title: "Unavailable",
          start: `${currentDateString}T00:00:00`,
          end: `${currentDateString}T${dayOpeningTimes.start
            .toString()
            .padStart(2, "0")}:00:00`,
          editable: false,
          startEditable: false,
          durationEditable: false,
          classNames: ["unavailable-event"],
        });
      }

      // // After opening hours (end to 24)
      if (dayOpeningTimes.end < 24) {
        unavailableSlots.push({
          title: "Closed",
          start: `${currentDateString}T${dayOpeningTimes.end
            .toString()
            .padStart(2, "0")}:00:00`,
          end: `${currentDateString}T24:00:00`,
          editable: false,
          startEditable: false,
          durationEditable: false,
          classNames: ["unavailable-event"],
        });
      }

      for (
        let hourIndex = dayOpeningTimes.start;
        hourIndex < dayOpeningTimes.end;

      ) {
        if (isPast) {
          let start = hourIndex;

          while (hourIndex < dayOpeningTimes.end) {
            hourIndex++;
          }

          if (isToday && currentHour === hourIndex) {
            hourIndex++;
          }

          unavailableSlots.push({
            title: "Unavailable",
            start: `${currentDateString}T${start
              .toString()
              .padStart(2, "0")}:00:00`,
            end: `${currentDateString}T${hourIndex
              .toString()
              .padStart(2, "0")}:00:00`,
            editable: false,
            startEditable: false,
            durationEditable: false,
            classNames: ["unavailable-event"],
          });
        }

        if (bookedTimes[hourIndex]) {
          // Create unavailable event
          const startHour = hourIndex;
          while (bookedTimes[hourIndex] && hourIndex < dayOpeningTimes.end) {
            hourIndex++;
          }

          unavailableSlots.push({
            title: "Unavailable",
            start: `${currentDateString}T${startHour
              .toString()
              .padStart(2, "0")}:00:00`,
            end: `${currentDateString}T${hourIndex
              .toString()
              .padStart(2, "0")}:00:00`,
            editable: false,
            startEditable: false,
            durationEditable: false,
            classNames: ["unavailable-event"],
          });
        } else if (!isPast) {
          // Create available event
          const startHour = hourIndex;
          while (!bookedTimes[hourIndex] && hourIndex < dayOpeningTimes.end) {
            hourIndex++;
          }

          if (hourIndex - startHour > gapBetween) {
            availableSlots.push({
              title: "Available",
              start: `${currentDateString}T${startHour
                .toString()
                .padStart(2, "0")}:00:00`,
              end: `${currentDateString}T${hourIndex
                .toString()
                .padStart(2, "0")}:00:00`,
              editable: true,
              startEditable: true,
              durationEditable: true,
              classNames: [],
            });
          } else {
            unavailableSlots.push({
              title: "Unavailable",
              start: `${currentDateString}T${startHour
                .toString()
                .padStart(2, "0")}:00:00`,
              end: `${currentDateString}T${hourIndex
                .toString()
                .padStart(2, "0")}:00:00`,
              editable: false,
              startEditable: false,
              durationEditable: false,
              classNames: ["unavailable-event"],
            });
          }
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // console.log({ availableSlots, unavailableSlots });

    return {
      availableAppointments: availableSlots,
      unavailableAppointments: unavailableSlots,
      slotMinTime: slotMinTime,
      slotMaxTime: slotMaxTime,
    };
  },
};

export default CalendarUtils;
