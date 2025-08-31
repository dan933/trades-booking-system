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
   *
   * @param {{bookMonthsAheadLimit:number, gapBetween:number, openingTimes: {[day:string]: {end: number; start:number, open: boolean}}}} availabilityDoc
   * @param {import("@fullcalendar/core").EventInput[]} bookedAppointments
   * @param {"desktop" | "mobile"} view
   * @param {Date} startDate
   */
  generateAvailableTimes(availabilityDoc, bookedAppointments, view, startDate) {
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

    //todo if mobile view only show 3 days
    //todo if desktop view show 7days

    console.log(slotMinTime);
    console.log(slotMaxTime);

    if (!openDays?.length) {
      slotMaxTime = "24:00:00";
      slotMinTime = "00:00:00";
    }

    return {
      availableAppointments: null,
      slotMinTime: slotMinTime,
      slotMaxTime: slotMaxTime,
    };
  },
};

export default CalendarUtils;
