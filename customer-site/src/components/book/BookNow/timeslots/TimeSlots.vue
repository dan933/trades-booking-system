<template>
  <div id="calendar"></div>
  <v-container v-if="loading" class="loading-overlay"></v-container>
  <v-container v-if="loading" class="loading">
    <v-progress-circular :width="10" :size="80" indeterminate color="blue"></v-progress-circular>
    <p>loading schedule...</p>
  </v-container>
  <TimeSlotDialog v-if="dialogOpenStatus" :toggleDialog="toggleDialog" :selectedEvent="selectedEvent"
    :servicesDoc="servicesDoc" :orgDoc="orgDoc" :onSubmit="storeSelectedTimeSlotData">
  </TimeSlotDialog>
</template>


<script>
import {
  getTimeSlotsForDate,
  getCalendarDatesAvailability,
} from "../../../../services/api/bookingService.js";

import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import CalendarUtils from "../../../../services/calendarUtils/calendarUtils.js";
import TimeSlotDialog from "./TimeSlotDialog.vue";

export default {
  name: "TimeSlots",
  emits: ['storeSelectedTimeSlotData'],
  props: {
    orgDoc: {
      type: Object,
      required: true
    },
  },
  data: () => ({
    dialogOpenStatus: false,
    loading: false,
    selectedEvent: null,
    availabilityDoc: null,
    servicesDoc: null,
    bookingScheduleData: [],
    disabledDates: [],
    selectedDate: null,
    availabilityMessage: "",
    IsAvailableDate: false,
    selectedTimeSlot: {},
    availableTimeSlots: null,
    /**
     * @type {Calendar}
     */
    calendar: null,
  }),
  components: {
    TimeSlotDialog
  },
  methods: {
    toggleDialog(status) {
      this.dialogOpenStatus = status;
    },
    initCalendar() {
      const calendarEl = document.getElementById('calendar');
      const calendar = new Calendar(calendarEl, {
        locale: 'en-AU',
        dayHeaderFormat: { day: 'numeric', month: 'numeric', weekday: 'short' },
        timeZone: "Australia/Melbourne",
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        eventOverlap: false,
        eventStartEditable: true,
        // durationEditable: true,
        editable: true,
        allDaySlot: false,
        firstDay: 1,
        datesSet: async (dateInfo) => {
          await this.onCalendarChange(new Date(dateInfo.startStr));
        },
        eventClick: (info) => {
          const event = info.event;
          let selectedEvent = {
            title: event.title,
            startHour: new Date(event.start).getUTCHours(),
            endHour: new Date(event.end).getUTCHours(),
            scheduleDate: new Date(event.start).toISOString().split('T')[0],
            id: event.id,
            classNames: event.classNames
          }



          if (selectedEvent?.title === "Available") {
            this.selectedEvent = selectedEvent;
            this.toggleDialog(true)
          }

        },
        views: {
          timeGridThreeDay: {
            type: 'timeGrid',
            duration: { days: 3 },
            // dateAlignment: 'week'
          },
          timeGridSevenDay: {
            type: 'timeGrid',
            duration: { days: 7 },
          }
        },
        initialView: this.isMobile ? 'timeGridThreeDay' : 'timeGridWeek',
        // slotMinTime: slotMinTime,
        // slotMaxTime: slotMaxTime,
      });
      calendar.render();

      this.calendar = calendar;
    },
    async init() {
      this.loading = true;

      //gets the availability of the timeslots and dates from db
      const {
        bookedSchedules,
        availabilityDoc,
      } = await getCalendarDatesAvailability(this.orgId);

      //set the booking schedule data
      this.bookingScheduleData = bookedSchedules;

      //set the availability settings
      this.availabilityDoc = availabilityDoc;

      // sets the disabled dates
      // this.disabledUnavailableDates(
      //   bookedOutDates,
      //   businessClosedDays,
      //   bookMonthsAhead
      // );

      this.loading = false;
    },
    async onCalendarChange(startDate) {
      this.loading = true;

      const {
        bookedSchedules,
        availabilityDoc,
        servicesDoc,
      } = await getCalendarDatesAvailability(this.orgId, startDate);

      this.servicesDoc = servicesDoc;


      let { unavailableAppointments, availableAppointments, slotMinTime, slotMaxTime } = CalendarUtils.generateTimeTable(bookedSchedules, availabilityDoc, this.isMobile ? "mobile" : "desktop", startDate)

      this.calendar.removeAllEvents();
      this.calendar.setOption("slotMinTime", slotMinTime);
      this.calendar.setOption("slotMaxTime", slotMaxTime);
      this.calendar.addEventSource([
        ...availableAppointments,
        ...unavailableAppointments
      ]);

      this.loading = false;
    },
    storeSelectedTimeSlotData(bookingTimeSlotData, selectedServices) {
      this.$emit("storeSelectedTimeSlotData", bookingTimeSlotData, selectedServices);

    },
  },
  watch: {
  },
  async mounted() {
    await this.init();
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
    orgId() {
      return this.$route.params.id;
    },
  },
};
</script>

<style>
.loading-overlay {
  margin-top: 20px;
  position: absolute;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 500px;
  z-index: 3;
  background-color: rgb(0, 0, 0);
  opacity: 0.8;
}

.loading {
  margin-top: 20px;
  position: absolute;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 500px;
  z-index: 3;
  color: white;
}

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

.fc-event.unavailable-event {
  background-color: rgb(174, 164, 164);
  border-color: #e55656;
  color: white;
  opacity: 0.8;
  cursor: not-allowed;
}

.fc-event.available {
  cursor: pointer;
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
