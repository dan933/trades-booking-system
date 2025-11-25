<template>
  <v-card flat class="book-now-container">
    <v-window :touch="false" direction="vertical" v-model="onboarding" class="window-container">

      <v-window-item :key="`card-customer-details`" :value="0" class="window-container">
        <CustomerDetails @storeCustomerDetails="storeCustomerDetails" ref="customerDetailsRef"></CustomerDetails>
      </v-window-item>


      <v-window-item :key="`card-timeslots`" :value="1" class="window-container">
        <TimeSlots @storeSelectedTimeSlotData="storeSelectedTimeSlotData" :orgDoc="orgDoc"></TimeSlots>
      </v-window-item>
      <v-window-item :key="`review-booking`" :value="2" class="window-container">
        <ReviewBooking @confirmDetails="confirmDetails" :orgDoc="orgDoc" :selectedDateTimeSlot="selectedDateTimeSlot"
          :selectedServices="selectedServices" :customerInformation="customerInformation" ref="reviewBookingRef">
        </ReviewBooking>
      </v-window-item>
      <v-window-item :key="`payment`" :value="3" class="window-container">
        <Payment :orgDoc="orgDoc" :selectedDateTimeSlot="selectedDateTimeSlot" :selectedServices="selectedServices"
          :customerInformation="customerInformation" ref="paymentRef" @submitBooking="submitBooking"></Payment>
      </v-window-item>
    </v-window>

    <v-card-actions class="justify-space-evenly">
      <v-item-group v-model="onboarding" class="text-center" mandatory>
        <v-item :key="`customer-details`" v-slot="{ isSelected, toggle }" :value="0">
          <v-btn :variant="isSelected ? 'outlined' : 'text'" icon="mdi:mdi-account" @click="() => {
            toggle();
            this.$refs.customerDetailsRef.removeAutoComplete();
            this.$refs.customerDetailsRef.initAutocomplete();
          }"></v-btn>
        </v-item>
        <v-item v-if="customerInformation" :key="`timeslots`" v-slot="{ isSelected, toggle }" :value="1">
          <v-btn :variant="isSelected ? 'outlined' : 'text'" icon="mdi:mdi-calendar-clock" @click="toggle"></v-btn>
        </v-item>
        <v-item v-if="selectedDateTimeSlot" :key="`services`" v-slot="{ isSelected, toggle }" :value="2">
          <v-btn :variant="isSelected ? 'outlined' : 'text'" icon="mdi:mdi-briefcase-check" @click="toggle"></v-btn>
        </v-item>
        <v-item v-if="customerConfirmation" :key="`payment`" v-slot="{ isSelected, toggle }" :value="3">
          <v-btn :variant="isSelected ? 'outlined' : 'text'" icon="mdi:mdi-credit-card-outline" @click="toggle"></v-btn>
        </v-item>
      </v-item-group>
    </v-card-actions>
  </v-card>
</template>

<script>
import TimeSlots from "./timeslots/TimeSlots.vue";
import SelectService from "./SelectService.vue";
import CustomerDetails from "./CustomerDetails.vue";
import ReviewBooking from "./ReviewBooking.vue";
import Payment from "./Payment.vue";
import { setGuestDetails, updateCustomerDetails } from "../../../services/api/customerService.js";
import { createBooking } from "../../../services/api/bookingService";
import { getOrganisationDoc } from "../../../services/api/organisationServices.js";

export default {
  name: "BookNow",
  data: () => ({
    orgDoc: null,
    selectedDate: null,
    onboarding: 0,
    selectedDateTimeSlot: null,
    selectedServices: [],
    customerInformation: null,
    customerConfirmation: false,
    paymentDetails: null,
  }),
  methods: {
    async storeCustomerDetails(customerDetails) {
      //are different to this.customerInformation
      if (
        JSON.stringify(this.customerInformation) !==
        JSON.stringify(customerDetails)
      ) {
        const orgId = this.$route.params.id;

        if (this.IsGuest) {
          this.$refs.customerDetailsRef.toggleLoading(true);

          await setGuestDetails(customerDetails, orgId).catch((err) => {
            console.log("error setting guest details", err)
          });

          this.$refs.customerDetailsRef.toggleLoading(false);
        } else {
          this.$refs.customerDetailsRef.toggleLoading(true);

          await updateCustomerDetails(customerDetails, orgId);

          this.$refs.customerDetailsRef.toggleLoading(false);
          this.$refs.customerDetailsRef.validateForm();
        }

      }
      this.customerInformation = customerDetails;

      this.onboarding += 1;
    },

    storeSelectedTimeSlotData(bookingTimeSlotData, selectedServices) {
      this.selectedServices = [];
      this.selectedDateTimeSlot = bookingTimeSlotData;
      this.selectedServices = selectedServices;

      this.onboarding += 1;
    },

    confirmDetails() {
      this.customerConfirmation = true;
      this.onboarding += 1;
    },

    async submitBooking(stripeResponse) {
      const bookingData = {
        customerInformation: this.customerInformation,
        selectedDateTimeSlot: this.selectedDateTimeSlot,
        services: this.selectedServices,
        paymentDetails: stripeResponse,
      };

      //Toggle loading  on payment page
      this.$refs.paymentRef.toggleLoading(true);
      //Send to API give orgId and booking data
      const resp = await createBooking(
        bookingData,
        this.$route.params.id
      ).catch((err) => alert(err));

      //Navigate to booking confirmation page
      //if resp success route to confirmation page
      if (resp.success) {
        //update customer information
        this.$store.commit("setCustomer", bookingData.customerInformation);

        //store booking request stored to send email to user and company later
        this.$store.commit("setBookingRequest", resp.bookingRequest);

        //todo add booking id to url that will be retrieved from the db later on??
        //still not sure if this is a good idea as it will cause security issues

        //route to confirmation page
        this.$router.push(`/org/${this.$route.params.id}/book/confirmation`);

        this.$refs.paymentRef.toggleLoading(false);
      } else if (resp.code) {
        //if stripe payment fails or server error
        this.$refs.paymentRef.updateErrorMessage(resp.message);
        this.$refs.paymentRef.toggleLoading(false);
      } else if (resp.message === "Requested time is not available") {
        this.$refs.paymentRef.toggleLoading(false);
        this.$router.push(`/org/${this.$route.params.id}/book/failed`);
      } else {
        this.$refs.paymentRef.updateErrorMessage(
          resp?.message || "Something went wrong"
        );
        this.$refs.paymentRef.toggleLoading(false);
      }
    },
  },
  async mounted() {
    let orgId = this.$route.params.id;
    this.orgDoc = await getOrganisationDoc(orgId);
  },
  computed: {
    IsGuest() {
      return this.$store.state.IsGuest;
    },
  },
  components: {
    Payment,
    TimeSlots,
    SelectService,
    CustomerDetails,
    ReviewBooking,
  },
};
</script>

<style>
.v-window__container {
  overflow: hidden !important;
}

.v-window-item {
  overflow: auto !important;
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
  margin: 10px;
  margin-top: 20px;
  padding: 5px;
  overflow: auto;
}

.window-container {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.vc-day-content.vc-disabled {
  text-decoration: line-through;
  color: rgba(211, 211, 211, 0.721);
}
</style>
