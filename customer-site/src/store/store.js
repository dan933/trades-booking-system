import { createStore } from "vuex";

export default createStore({
  state: {
    IsGuest: false,
    customer: null,
    bookingRequest: null,
    booking: {
      bookingDate: "",
      timeRange: "",
      address: "",
      selectedServices: [],
      hoursRequired: 0,
      subtotal: 0,
      gst: 0,
      total: 0,
    },
    navigation: {
      view: "landing",
    },
  },
  mutations: {
    updateBooking(state, payload) {
      state.booking.bookingDate = payload.bookingDate;
      state.booking.timeRange = payload.timeRange;
      state.booking.address = payload.address;
      state.booking.selectedServices = payload.selectedServices;
      state.booking.hoursRequired = payload.hoursRequired;
      state.booking.subtotal = payload.subtotal;
      state.booking.gst = payload.gst;
      state.booking.total = payload.total;
    },
    setIsGuest(state, payload) {
      state.IsGuest = payload;
    },
    setCustomer(state, payload) {
      state.customer = payload;
    },
    //used to send email to company and customer
    setBookingRequest(state, payload) {
      state.bookingRequest = payload;
    },
    //navigation
    updateView(state, payload) {
      state.navigation.view = payload;
    },
  },
  actions: {},
  getters: {},
});
