<template>
  <div class="contact-container">
    <v-card elevation="3" class="ma-3 pa-5" v-if="!formSent && !formError">
      <div class="text-body text-left mb-3">
        We would love to hear from you please leave us a message and we will get
        back to you as soon as possible.
      </div>
      <v-form ref="form" class="contact-form" v-model="valid" @submit.prevent="submitForm">
        <v-text-field v-model="name" :rules="nameRules" label="Name"></v-text-field>
        <v-text-field v-model="email" :rules="emailRules" label="Email"></v-text-field>
        <v-textarea v-model="message" :rules="messageRules" label="Message"></v-textarea>
        <v-btn :disabled="formSending" type="submit" color="primary" class="form-button">
          <span v-if="!formSending">Submit</span>

          <v-progress-circular v-else indeterminate></v-progress-circular>
        </v-btn>
      </v-form>
    </v-card>
    <v-card elevation="3" class="ma-10 pa-5" v-if="formSent">
      <div class="text-body text-left mb-3">
        Thank you your enquiry has been sent and we will get back to you soon.
      </div>
      <v-btn type="submit" color="primary" @click="resetForm" class="form-button">
        <span>Send Another Enquiry</span>
      </v-btn>
    </v-card>
    <v-card elevation="3" class="ma-10 pa-5" v-if="formError">
      <div class="text-body text-left mb-3 text-red">
        Sorry an error occured please try again.
      </div>
      <v-btn type="submit" color="primary" @click="resetForm" class="form-button">
        <span>Send Another Enquiry</span>
      </v-btn>
    </v-card>
  </div>
</template>

<script>
import { SendContactFormEmail } from "../../services/api/emailService.js";

export default {
  name: "Contact",
  data() {
    return {
      name: "",
      email: "",
      message: "",
      valid: false,
      formSending: false,
      formSent: false,
      formError: false,
      nameRules: [
        (v) => !!v || "Name is required",
        (v) => v.length <= 50 || "Name must be less than 50 characters",
      ],
      emailRules: [
        (v) => !!v || "Email is required",
        (v) =>
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
            v
          ) || "Email must be valid",
      ],
      messageRules: [
        (v) => !!v || "Message is required",
        (v) => v.length <= 500 || "Message must be less than 500 characters",
      ],
    };
  },
  methods: {
    resetForm() {
      (this.message = ""), (this.formSending = false);
      this.formSent = false;
      this.formError = false;
    },
    async submitForm() {
      if (this.valid) {
        this.formSending = true;

        const formData = {
          name: this.name,
          email: this.email,
          message: this.message,
        };

        const response = await SendContactFormEmail(formData);

        if (response?.success) {
          this.formSending = false;
          this.formSent = true;
        } else {
          this.formSending = false;
          this.formError = true;
        }
      }
    },
  },
};
</script>
<style>
.form-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
}

.contact-form {
  display: flex;
  flex-direction: column;
  row-gap: 10px;
}

.contact-container {
  margin-top: 10px;
  display: flex;
  row-gap: 20px;
  flex-direction: column;
  max-width: 400px;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  padding-left: 5px;
  padding-right: 5px;
  text-align: center;
}
</style>
