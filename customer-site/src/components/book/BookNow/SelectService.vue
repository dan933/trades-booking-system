<template>
  <v-card flat rounded="0">
    <v-container>
      <h3>Add Services</h3>
      <div>
        <p>
          <strong>Date:</strong>
          {{
            `${selectedDateTimeSlot?.date
              .getDate()
              .toString()
              .padStart(2, "0")}/${selectedDateTimeSlot?.date
                .getMonth()
                .toString()
                .padStart(2, "0")}/${selectedDateTimeSlot?.date.getFullYear()}`
          }}
        </p>
        <p>
          <strong>Time:</strong>
          {{ `${selectedDateTimeSlot.timeslot.time}` }}
        </p>
        <p>
          <strong>Remaining Hours Available:</strong>
          {{ remainingHoursAvailable }}
        </p>
      </div>
      <v-form @submit.prevent="storeSelectedServices" class="service-form-container" v-model="serviceForm">
        <!-- add v-for that adds input field -->
        <v-container v-for="(service, index) in selectedServices" class="mb-3 border">
          <div class="service-item-container">
            <v-autocomplete v-model="service.selection" style="width: 200px; height: 50px" label="Service"
              :items="services" :item-title="(item) => {
                return item?.name ? `${item.name}` : '';
              }
                " :item-value="(item) => item" :rules="[(v) => !!v || 'service required']"></v-autocomplete>
            <v-text-field v-model.number="service.hours" style="width: 130px" type="number" label="Hours"
              @input="() => roundToWholeHour(index)" step="1" min="0" hide-details="auto" :rules="[
                () =>
                  remainingHoursAvailable >= 0 || 'Hours Available Exceeded',
                (v) => !!v || 'Hours Required',
                (v) => v > 0 || 'Hours must be greater than 1',
              ]"></v-text-field>
          </div>
          <div class="d-flex align-center mt-6 flex-wrap">
            <p class="mr-5">
              Price:
              {{
                // if there are hours available, calculate the price
                remainingHoursAvailable >= 0 &&
                  service?.selection?.rate &&
                  +service?.hours
                  ? `$ ${service.selection.rate * +service?.hours}` //if there are no hours available, show N/A
                  : remainingHoursAvailable === "N/A"
                    ? "N/A"
                    : //if no hours are selected show 0
                    "$ 0"
              }}
            </p>
            <v-btn color="warning" @click="() => removeServiceItem(index)">Remove</v-btn>
          </div>
        </v-container>
        <v-btn class="mt-5" width="150px" @click="addInput">Add Service</v-btn>
        <v-btn width="150px" v-if="atLeastOneValidService" elevation="4" color="primary" class="mt-5"
          type="submit">Next</v-btn>
      </v-form>
    </v-container>
  </v-card>
</template>

<script>
import { getServices } from "../../../services/api/bookingService";
export default {
  name: "selectServices",
  data: () => ({
    serviceForm: false,
    services: [],
    selectedServices: [{}],
  }),
  props: ["selectedDateTimeSlot"],
  methods: {
    async init() {
      const orgId = this.$route.params.id;
      this.services = await getServices(orgId);
    },
    reset() {
      this.selectedServices = [];
    },
    addInput() {
      this.selectedServices.push({});
    },
    roundToWholeHour(index) {
      //check that hours is not null
      let IsNotNull = this.selectedServices[index].hours !== null;

      //check that hours is not already an integer
      let IsNotInteger = !Number.isInteger(
        Number(this.selectedServices[index].hours) ||
        this.selectedServices[index].hours < 0
      );

      //if hours is not an integer, round to nearest whole number
      if (IsNotNull && IsNotInteger) {
        this.selectedServices[index].hours = Math.floor(
          Number(this.selectedServices[index].hours)
        );

        //if hours is negative, make it positive
        if (this.selectedServices[index].hours < 0) {
          this.selectedServices[index].hours =
            this.selectedServices[index].hours * -1;
        }
      }
    },
    storeSelectedServices() {
      //check all imputs are complete
      let allInputsComplete = this.selectedServices.every((service) => {
        return service.selection && service.hours;
      });
      //check that available hours has not been exceeded
      let availableHoursNotExceeded = this.remainingHoursAvailable >= 0;

      //if all is good, emit event to parent
      if (allInputsComplete && availableHoursNotExceeded) {
        this.$emit(
          "storeSelectedServices",
          JSON.stringify(this.selectedServices)
        );
      }
    },
    removeServiceItem(index) {
      this.selectedServices.splice(index, 1);
    },
  },
  async mounted() {
    await this.init();
  },
  computed: {
    remainingHoursAvailable() {
      let remainingHoursAvailable =
        this.selectedDateTimeSlot.timeslot.availableHours;

      let totalHoursSelected = this.selectedServices.reduce((prev, curr) => {
        if (+curr.hours) {
          return prev + +curr.hours;
        } else {
          return prev;
        }
      }, 0);

      remainingHoursAvailable = remainingHoursAvailable - totalHoursSelected;

      if (remainingHoursAvailable < 0) {
        return "N/A";
      }

      return remainingHoursAvailable;
    },
    atLeastOneValidService() {
      //if selected service has at least one valid service
      //show review button
      if (
        this.selectedServices?.length > 0 &&
        this.selectedServices[0]?.selection?.name &&
        +this.selectedServices[0]?.hours > 0
      ) {
        return true;
      }
      return false;
    },
  },
};
</script>

<style>
.service-form-container {
  overflow: auto;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 5px;
}

.border {
  border: black solid 2px !important;
  border-radius: 5px;
}

.service-item-container {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  column-gap: 10px;
  row-gap: 30px;
  margin-bottom: 10px;
}
</style>
