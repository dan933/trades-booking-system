<template>
  <v-card class="login-card">
    <template v-slot:title>
      <h3 class="card-title">Easy Booking</h3>
    </template>
    <div v-if="!IsShowResetForm">
      <h4 class="card-subtitle">Login</h4>
      <v-form @submit.prevent="login" v-model="loginForm" class="form">
        <v-text-field :disabled="loading" variant="outlined" v-model="user.email" autocomplete="email" label="Email"
          required :rules="emailRules"></v-text-field>
        <v-text-field :disable="loading" variant="outlined" v-model="user.password" label="Password"
          autocomplete="current-password" :type="showPassword ? 'text' : 'password'" required :rules="passwordRules"
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showPassword = !showPassword">
        </v-text-field>
        <v-alert v-if="signInResponse?.IsPasswordIncorrect" class="mb-3" type="error"
          :text="signInResponse?.errorMessage" variant="outlined" density="compact"></v-alert>
        <div class="mb-5" @click="() => (IsShowResetForm = true)">
          <a href="#">Forgot Password</a> <br />
        </div>
        <div class="card-button-container">
          <v-btn type="submit" :loading="loading" :disabled="loading" color="primary" class="mb-4 pa-5 w-100 d-flex">
            Login
          </v-btn>
        </div>
      </v-form>
    </div>
    <div v-if="IsShowResetForm">
      <h4 class="card-subtitle">Reset Password</h4>
      <v-form @submit.prevent="resetPassword" v-model="resetForm">
        <v-text-field variant="outlined" v-if="!IsPasswordEmailSent" v-model="user.email" autocomplete="email"
          label="Email" required :rules="emailRules"></v-text-field>
        <div v-if="IsPasswordEmailSent" class="pa-4">
          An Email has been sent to {{ this.user.email }} please check your
          spam folder.
        </div>
        <div class="card-button-container">
          <v-btn v-if="!IsPasswordEmailSent" type="submit" :disabled="!user.email" color="primary"
            class="mt-4 mb-4 pa-5 w-100 d-flex">
            Reset Password
          </v-btn>
          <v-btn class="mb-4 pa-5 w-100 d-flex" @click="() => {
            IsShowResetForm = false;
            IsPasswordEmailSent = false;
          }">Back To Login</v-btn>
        </div>
      </v-form>
    </div>
    <slot v-if="!IsShowResetForm" name="providers"></slot>
  </v-card>
</template>

<script>
import { authService } from "../../../services/auth/auth-services.js";
export default {
  name: "emailLogin",
  props: ["signInResponse", "loading"],
  data() {
    return {
      resetForm: true,
      loginForm: false,
      showPassword: false,
      user: {
        email: "",
        password: "",
      },
      IsPasswordEmailSent: false,
      IsShowResetForm: false,
      emailRules: [
        (v) => !!v || "Email is required",
        (v) =>
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
            v
          ) || "Email must be valid",
      ],
      passwordRules: [(value) => !!value || "Password Required"],
    };
  },
  methods: {
    login() {
      if (this.loginForm) {
        let request = {
          providerName: "email",
          user: this.user,
        };

        this.$emit("signIn", request);
      }
    },
    async resetPassword() {
      let reg =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      let IsValidEmail = reg.test(this.user.email);

      if (this.resetForm || IsValidEmail) {
        //todo make api call with sendGrid to reset password
        //will make this more professional
        //just more work later on down the road.
        const response = await authService.resetPassword(this.user.email);
        this.IsPasswordEmailSent = response;
      }
    },
  },
};
</script>
<style scoped>
.login-card {
  display: flex;
  flex-direction: column;
  justify-self: center;
  width: 464px;
  max-width: 90%;
  margin: 10px;
  padding: 15px;
  border-radius: 10px;
  background-color: white;
  border: solid gray 1px;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
}

.card-button-container {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}

.card-title {
  margin-top: 10px;
  text-align: center;
  font-family: 'Rubik', sans-serif;
  font-size: 25px;
  color: #7a18f2;
}

.card-subtitle {
  font-family: 'Rubik', sans-serif;
  font-size: 25px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 15px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
</style>