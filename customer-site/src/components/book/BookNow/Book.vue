const Book = () => Promise.resolve({
<template>
  <section class="book-section">
    <v-card elevation="3" class="card">
      <v-toolbar color="white" :elevation="6" v-if="showNavigation">
        <v-container class="nav-container">
          <v-btn v-if="!$store.state.IsGuest" class="menu-button" v-bind:active="view === 'appointments'" @click="
            () => {
              view = 'appointments';
            }
          ">Appointments</v-btn>
          <v-btn class="menu-button" v-bind:active="view === 'bookNow'" @click="
            () => {
              view = 'bookNow';
            }
          ">Book Now</v-btn>
        </v-container>
      </v-toolbar>
      <Appointments v-if="!$store.state.IsGuest" :class="{ 'view-container': true, hidden: view !== 'appointments' }">
      </Appointments>
      <BookNow :class="{ 'view-container': true, hidden: view !== 'bookNow' }"></BookNow>
    </v-card>
  </section>
</template>

<script>
import Appointments from "../Appointments.vue";
import BookNow from "./BookNow.vue";
export default {
  name: "Book",
  components: { Appointments, BookNow },
  data() {
    return {
      view: "bookNow",
    };
  },
  methods: {},
  mounted() { },
  computed: {
    showNavigation() {
      return !this.$store.state.IsGuest;
    },
  },
};
</script>

<style scoped>
.nav-container {
  column-gap: 5px;
  display: flex;
  width: 100%;
}

.menu-button {
  width: 50%;
}

.book-section {
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

.card {
  width: 100%;
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.view-container {
  height: 100%;
  max-height: 700px;
}

.hidden {
  display: none;
}
</style>

})
