const SuccessBooking = () => Promise.resolve({
<template>
  <v-container class="success-container">
    <v-card class="success-card">
      <v-container>
        <h1>Booked</h1>
        <p>
          Thank You {{ customer.firstName }}, for Booking with us we have sent you
          a confirmation email with booking details.
        </p>

        <br />

        <p><strong>Date: </strong>{{ booking.bookingDate }}</p>
        <p><strong>Time: </strong>{{ booking.timeRange }}</p>

        <v-table fixed-header max-height="300px">
          <thead>
            <tr>
              <th class="text-left">Service</th>
              <th class="text-left">Rate</th>
              <th class="text-left">Hours</th>
              <th class="text-left">Line Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in booking.selectedServices" :key="item.name">
              <td>{{ item.name }}</td>
              <td>{{ item.rate }}</td>
              <td>{{ item.hours }}</td>
              <td>{{ item.lineTotal }}</td>
            </tr>
          </tbody>
        </v-table>
        <div class="total-container">
          <p>
            <strong>Hours Required:</strong>
            {{ booking.hoursRequired }}
          </p>
          <p>
            <strong>Sub Total:</strong>
            $ {{ `${booking.subtotal.toFixed(2)}` }}
          </p>
          <p>
            <strong>GST:</strong>
            $ {{ `${booking.gst.toFixed(2)}` }}
          </p>
          <p>
            <strong>Total:</strong>
            $ {{ `${booking.total.toFixed(2)}` }}
          </p>
        </div>

        <v-btn @click="goBack" color="primary" class="mt-4">
          Back
        </v-btn>
      </v-container>
    </v-card>
  </v-container>
</template>

<script>
import { sendBookingConfirmationEmail } from "../../../services/api/bookingService";
export default {
  name: "SuccessBooking",
  data() {
    return {};
  },
  computed: {
    booking() {
      return this.$store.state.booking;
    },
    customer() {
      return this.$store.state.customer;
    },
  },
  methods: {
    async sendConfirmationEmail() {
      let bookingData = this.$store.state.bookingRequest;
      const orgId = this.$route.params.id;
      await sendBookingConfirmationEmail(bookingData, orgId);
    },
    goBack() {
      this.$router.go(-1);
    },
  },
  async mounted() {
    await this.sendConfirmationEmail();
  },
};
</script>

<style>
.success-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 800px;
  width: 90%;
  height: 100vh;
  justify-self: center;
  padding-top: 30px;
}

.total-container {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  row-gap: 3px;
}

.success-card {
  padding: 40px;
  row-gap: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-self: center;
  width: 90%;
  margin: 20px;
  /* height: 100%; */
}
</style>
} });
