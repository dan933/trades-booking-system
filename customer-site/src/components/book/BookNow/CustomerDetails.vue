<template>
  <v-card flat rounded="0" class="service-card">
    <v-container style="height: 100%">
      <v-form v-model="valid" @submit.prevent="storeCustomerDetails" ref="customerDetailsFormRef" v-if="!loading">
        <v-container class="detail-container">
          <v-text-field style="width: 150px" v-model="firstName" label="First name"
            :rules="[(v) => !!v || 'First name is required']"></v-text-field>
          <v-text-field style="width: 150px" v-model="lastName" label="Last name"
            :rules="[(v) => !!v || 'Last name is required']"></v-text-field>
        </v-container>
        <v-text-field v-model="phoneNumber" label="Phone number" type="tel"
          :rules="[(v) => !!v || 'Phone number is required']"></v-text-field>
        <v-text-field v-if="IsGuest" v-model="email" label="Email" type="email" :rules="emailRules"></v-text-field>

        <div ref="mapsAutoCompleteRef"></div>
        <v-text-field v-model="address.streetAddress" label="Street Address"
          :rules="[(v) => !!v || 'Address is required']"></v-text-field>
        <v-text-field v-model="address.suburb" label="Suburb"
          :rules="[(v) => !!v || 'Suburb is required']"></v-text-field>
        <v-text-field v-model="address.postcode" label="Postcode"
          :rules="[(v) => (!!v && !isNaN(v)) || 'Postcode Invalid']"></v-text-field>
        <v-autocomplete v-model="address.state" label="State" :items="['VIC']"
          :rules="[(v) => !!v || 'State is required']">
        </v-autocomplete>
        <v-btn color="primary mt-4" type="submit">Next</v-btn>
      </v-form>
      <v-container v-else class="d-flex justify-center align-center" style="height: 100%">
        <v-progress-circular :width="10" :size="80" indeterminate color="blue"></v-progress-circular>
      </v-container>
    </v-container>
  </v-card>
</template>

<script>
import { getCustomerDetails } from "../../../services/api/customerService.js";
import { getAuth } from "firebase/auth";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

export default {
  name: "CustomerDetails",
  data() {
    return {
      placeAutocomplete: null,
      loading: false,
      valid: true,
      firstName: "",
      lastName: "",
      phoneNumber: "",
      address: {
        streetAddress: "",
        suburb: "",
        postcode: "",
        state: "VIC",
      },
      email: "",
      emailRules: [
        (v) => !!v || "Email is required",
        (v) =>
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
            v
          ) || "Email must be valid",
      ],
    };
  },
  props: ["selectedDateTimeSlot"],
  watch: {
    firstName() {
      this.validateForm();
    },
    lastName() {
      this.validateForm();
    },
    phoneNumber() {
      this.validateForm();
    },
    address: {
      handler() {
        this.validateForm();

      },
      deep: true
    },
  },
  methods: {
    validateForm() {
      this.$nextTick(() => {
        this.valid = !!this.$refs.customerDetailsFormRef.validate();
      });
    },
    //function to control loading
    toggleLoading(Isloading) {
      this.loading = Isloading;
    },
    storeCustomerDetails() {
      // Store the customers details
      if (this.valid) {

        let address = `${this.address.streetAddress}, ${this.address.suburb}, ${this.address.postcode}, ${this.address.state}`;


        let customerDetails = {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email || this.currentUser?.email,
          phoneNumber: this.phoneNumber,
          addressList: [address],
        };

        this.$emit("storeCustomerDetails", customerDetails);

        this.placeAutocomplete.remove();
      }
    },
    async getCustomer() {
      if (this.IsGuest) return null;

      return await getCustomerDetails(this.orgId);
    },
    async init() {
      //check if the customers details are in the database

      this.loading = true;

      let customer = await this.getCustomer();

      //if the details exist populate the form
      if (customer) {
        this.firstName = customer?.firstName || "";
        this.lastName = customer?.lastName || "";
        this.phoneNumber = customer?.phoneNumber || "";
        // this.address =
        //   customer?.addressList?.length > 0 ? customer.addressList[0] : "";

        const addressSplit = customer.addressList[0]?.split(",");

        this.address = {
          streetAddress: addressSplit[0] || "",
          suburb: addressSplit[1] || "",
          postcode: addressSplit[2] || "",
          state: addressSplit[3] || "VIC",
        };

        this.valid = this.validateForm();
      }

      this.loading = false;
    },
    async initAutocomplete() {
      // 1. Get your API Key (Store this in a .env file!)
      const apiKey = import.meta.env.VITE_APP_MAPS_API_KEY;
      if (!apiKey) {
        console.error("Google Maps API key is missing.");
        return;
      }

      try {
        if (!window.googleMapsInitialized) {
          setOptions({
            libraries: ["places"],
            key: apiKey,
          });
          window.googleMapsInitialized = true;
        }

        const placesLibrary = await importLibrary("places", { apiKey });

        this.placeAutocomplete = new placesLibrary.PlaceAutocompleteElement({
          includedRegionCodes: ['au'],
          locationBias: {
            center: { lat: -37.8136, lng: 144.9631 },
            radius: 10000
          },
          types: ['address'],
        });

        this.placeAutocomplete.style.colorScheme = 'light';
        this.placeAutocomplete.style.marginBottom = '10px';

        this.placeAutocomplete?.Dg?.setAttribute('placeholder', 'Search for an address');


        this.placeAutocomplete.addEventListener('gmp-select', async ({ placePrediction }) => {
          const place = placePrediction.toPlace();
          await place.fetchFields({ fields: ['addressComponents'] });
          let addressComponents = JSON.parse(JSON.stringify(place));
          addressComponents = addressComponents?.addressComponents;


          const streetNumber = addressComponents?.find(component => component?.types?.includes?.('street_number'));
          const streetName = addressComponents?.find(component => component?.types?.includes?.('route'));

          if (streetNumber && streetName) {
            this.address.streetAddress = `${streetNumber.shortText} ${streetName.shortText}`;
          }



          const suburb = addressComponents?.find(component => component?.types?.includes?.('locality')) ||
            addressComponents?.find(component => component?.types?.includes?.('sublocality')) ||
            addressComponents?.find(component => component?.types?.includes?.('administrative_area_level_2'));

          if (suburb) {
            this.address.suburb = suburb.shortText;
          }

          const postcode = addressComponents?.find(component => component?.types?.includes?.('postal_code'));

          if (postcode) {
            this.address.postcode = postcode.shortText;
          }

          const state = addressComponents?.find(component => component?.types?.includes?.('administrative_area_level_1'));

          if (state && state === "VIC") {
            this.address.state = state.shortText;
          }


          this.$nextTick(() => {
            if (this.placeAutocomplete) {
              this.placeAutocomplete.remove();
              this.initAutocomplete();
            }
          });
        });

        this.$refs.mapsAutoCompleteRef.appendChild(
          this.placeAutocomplete
        );



      } catch (error) {
        console.error("Error loading Google Maps Autocomplete:", error);
      }
    },
    removeAutoComplete() {
      if (this.placeAutocomplete) {
        this.placeAutocomplete?.remove?.();
      }
    }
  },
  computed: {
    orgId() {
      return this.$route.params.id;
    },
    IsGuest() {
      return this.$store.state.IsGuest;
    },
    currentUser() {
      let user = getAuth().currentUser;
      return user;
    },
  },
  async mounted() {
    await this.init();
    this.initAutocomplete();
  },
  beforeUnmount() {
    if (this.placeAutocomplete) {
      this.placeAutocomplete.remove();
    }
  },
  async activated() {
    if (!this.placeAutocomplete) {
      await this.initAutocomplete();
    }
  }
};
</script>

<style>
.detail-container {
  display: flex;
  flex-wrap: wrap;
  column-gap: 3px;
  padding: 0px;
  margin: 0px;
}



.border {
  border: black solid 2px !important;
  border-radius: 5px;
}
</style>
