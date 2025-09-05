<template>
  <v-container class="d-flex justify-center align-center" style="height: 100vh;">
    <v-card class="failed-card">
      <h1>Booking Unavailable</h1>
      <p>
        We are sorry but the booking you chose has been booked by another
        customer. Please choose another timeslot.
      </p>
      <v-btn color="primary" @click="goBack">Back</v-btn>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: "FailedBooking",
  data() {
    return {};
  },
  methods: {
    goBack() {
      this.$router.push(`/org/${this.$route.params.id}/book`);
    }
  }
};
</script>

<style>
.failed-card {
  padding: 40px;
  row-gap: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 20px;
  /* height: 90%; */
}
</style>
