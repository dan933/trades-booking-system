<!-- <template>
  <v-card flat rounded="0" class="book-now-card">
    <VDatePicker :min-date="tomorrow" :disabled-dates="disabledDates" @dayclick="onCalendarClick" title="Pick a Date">
      <template #default="{ togglePopover }">
        <div class="date-input">
          <v-btn class="text-none text-subtitle-1" color="primary" variant="elevated" @click="togglePopover">
            Choose Date
          </v-btn>
        </div>
      </template>
    </VDatePicker>
    {{ availabilityMessage }}
    <v-container v-if="IsAvailableDate" class="timeslot-container">
      <h3>Pick A Timeslot</h3>
      <v-autocomplete v-model="selectedTimeSlot" :items="availableTimeSlots" :item-title="(item) => {
        return item?.time
          ? `${item.time} (available hours ${item.availableHours})`
          : '';
      }
        " :item-value="(item) => item" label="Select a time slot" style="width: 245px"></v-autocomplete>
      <p v-if="selectedTimeSlot?.availableHours">
        <strong>This time slot currently has
          {{ selectedTimeSlot?.availableHours }} hours available.</strong>
      </p>
      <v-btn v-if="selectedTimeSlot" class="text-none text-subtitle-1" color="primary" variant="elevated"
        @click="storeSelectedTimeSlotData">
        Next
      </v-btn>
    </v-container>
  </v-card>
</template> -->

<template>
  <div id="calendar"></div>
</template>


<script>
import {
  getTimeSlotsForDate,
  getCalendarDatesAvailability,
} from "../../../services/api/bookingService.js";

import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';

export default {
  name: "TimeSlots",
  data: () => ({
    loading: false,
    //data that we will get from the db
    availabilityDoc: null,
    bookingScheduleData: null,
    disabledDates: [],
    selectedDate: null,
    availabilityMessage: "",
    IsAvailableDate: false,
    selectedTimeSlot: {},
    availableTimeSlots: null,
  }),
  methods: {
    initCalendar() {
      const calendarEl = document.getElementById('calendar');
      const calendar = new Calendar(calendarEl, {
        plugins: [dayGridPlugin],
        events: [
          // Your event data here
          { title: 'Event 1', start: '2025-08-29', extendedProps: { description: 'Details for Event 1' } },
          { title: 'Event 2', start: '2025-08-05', extendedProps: { description: 'Details for Event 2' } }
        ],
        eventClick: (info) => {
          // Handle date click event
          console.log('Date clicked:', info);
        },
        views: {
          dayGridThreeDay: {
            type: 'dayGrid',
            duration: { days: 3 },
            moreLinkClick: () => {
              console.log('click')
              return "popover"
            },
          },
          dayGridSevenDay: {
            type: 'dayGrid',
            duration: { days: 7 },
            moreLinkClick: () => {
              console.log('click')
              return "popover"
            },
          },
        },
        initialView: this.isMobile ? 'dayGridThreeDay' : 'dayGridSevenDay'
      });
      calendar.render();
    },
    async init() {
      this.loading = true;

      //gets the availability of the timeslots and dates from db
      const {
        bookedOutDates,
        businessClosedDays,
        bookMonthsAhead,
        bookedSchedules,
        availabilityDoc,
      } = await getCalendarDatesAvailability(this.orgId);

      //set the booking schedule data
      this.bookingScheduleData = bookedSchedules;

      //set the availability settings
      this.availabilityDoc = availabilityDoc;

      // sets the disabled dates
      this.disabledUnavailableDates(
        bookedOutDates,
        businessClosedDays,
        bookMonthsAhead
      );

      this.loading = false;
    },
    async disabledUnavailableDates(
      bookedOutDates,
      businessClosedDays,
      bookMonthsAhead
    ) {
      // Add 1 to get correct day for vuetify calendar
      let closedDays = businessClosedDays.map((item) => item + 1);

      // Set disabled dates
      this.disabledDates = [
        { repeat: { weekdays: closedDays } },
        { start: bookMonthsAhead, end: null },
      ];

      // Set booked out dates
      bookedOutDates.forEach((date) => {
        let disableDate = {
          start: new Date(date),
          end: new Date(date),
        };

        // add date to disabled dates array
        this.disabledDates.push(disableDate);
      });
    },
    resetTimeStamp(inputDate) {
      // console.log(inputDate);
      let outputDate = new Date(inputDate);

      let startOfDay = new Date(
        outputDate.getFullYear(),
        outputDate.getMonth(),
        outputDate.getDate()
      );
      // let endOfDay = new Date(
      //   outputDate.getFullYear(),
      //   outputDate.getMonth(),
      //   outputDate.getDate() + 1
      // );

      // console.log(startOfDay, endOfDay);
      return startOfDay;
    },
    getOrdinalSuffix(day) {
      if (day >= 11 && day <= 13) {
        return "th";
      }
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    },
    onCalendarClick(context) {
      this.selectedDate = context.date;
      this.selectedTimeSlot = "";
      const clickedDate = new Date(context.date);
      const day = clickedDate.getDate();
      const suffix = this.getOrdinalSuffix(day);
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const month = monthNames[clickedDate.getMonth()];
      const year = clickedDate.getFullYear();

      this.IsAvailableDate = !context.isDisabled;
      if (context.isDisabled) {
        this.availabilityMessage = `No bookings available for ${day}${suffix} ${month} ${year}`;
      } else {
        this.availabilityMessage = `${day}${suffix} ${month} ${year}`;
      }
    },
    storeSelectedTimeSlotData() {
      // console.log(this.selectedDate);
      // console.log(this.selectedTimeSlot);
      //todo organise data

      // console.log(this.selectedDate, "line 193");

      //add the booking start time to the selected date
      let bookingStartTime = this.selectedDate;
      bookingStartTime.setHours(
        this.selectedTimeSlot.time.split(":")[0],
        this.selectedTimeSlot.time.split(":")[1]
      );

      let bookingTimeSlotData = {
        date: this.selectedDate,
        timeslot: this.selectedTimeSlot,
      };

      this.$emit("storeSelectedTimeSlotData", bookingTimeSlotData);
    },
    goToSelectServices() {
      //todo check if timeslot is still availbale
      this.getDateTimeslotData();

      //todo emit
    },
  },
  watch: {
    // disabledDates(newval) {
    //   // console.log(newval);
    // },
    selectedDate(newValue, oldValue) {
      console.log("newValue", newValue);
      if (newValue !== null && newValue !== oldValue) {
        let selectedDate = newValue;
        selectedDate = this.resetTimeStamp(selectedDate);
        //todo api call to get available timeslots
        //This should reduce the chance of 2 or more bookings confilicting
        this.availableTimeSlots = getTimeSlotsForDate(
          this.bookingScheduleData,
          selectedDate,
          this.availabilityDoc
        );
      }
    },
  },
  mounted() {
    this.init();
    this.$nextTick(() => {
      this.initCalendar();
    });
  },
  beforeUnmount() {
  },
  computed: {
    isMobile() {
      return window.innerWidth <= 768;
    },
    //get yesterdays date
    tomorrow() {
      let tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    },
    orgId() {
      return this.$route.params.id;
    },
  },
};
</script>

<style>
#calendar {
  width: 100%;
  height: 500px;
  margin-top: 20px;
  padding: 5px;
  z-index: 9999;
}

.fc-day-today {
  background-color: #f0f8ff !important;
}

.fc-day-today .fc-daygrid-day-number {
  background-color: #7d37e1;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fc-header-toolbar {
  background-color: #7d37e1;
  padding: 10px !important;
  border-radius: 8px !important;
  margin-bottom: 10px !important;
}

.fc-toolbar-title {
  color: white !important;
  font-size: 18px !important;
  font-weight: bold !important;
}

.fc-button {
  background-color: white !important;
  color: #7d37e1 !important;
  border: none !important;
  border-radius: 4px !important;
  padding: 5px 10px !important;
  margin-top: 5px !important;
  margin-left: 5px !important;
}


.date-input {
  border-radius: 5px;
  padding: 5px;
}

.book-now-container {
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 90%;
  max-height: 700px;
  margin: 10px;
  margin-top: 20px;
  padding: 5px;
}

.book-now-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 15px;
  height: 90%;
  width: 100%;
  min-height: 400px;
  height: fit-content;
  padding: 10px;
  overflow: auto;
}

.timeslot-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 15px;
}

.window-container {
  width: 100%;
  height: 100%;
}

.vc-day-content.vc-disabled {
  text-decoration: line-through;
  color: rgba(211, 211, 211, 0.721);
}
</style>
