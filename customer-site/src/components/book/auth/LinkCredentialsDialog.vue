<template>
  <div class="text-center">
    <v-dialog v-model="dialog" width="auto">
      <!-- ------ provider sign in -------- -->
      <v-card v-if="
        signInResponse?.firstSignInMethod &&
        signInResponse?.firstSignInMethod !== 'password' &&
        !IsSignedIn
      ">
        <v-card-text>
          You already have an account with
          {{ signedInMessage().provider }} please sign in.
        </v-card-text>
        <v-card-actions class="flex-column">
          <v-btn color="primary" block @click="signInWithExistingAccount">
            Sign in with {{ signedInMessage().button }}
          </v-btn>
          <v-btn color="primary" block @click="dialog = false">Close Dialog</v-btn>
        </v-card-actions>
      </v-card>
      <!-- ------ Email sign in -------- -->
      <v-card v-if="signInResponse?.firstSignInMethod === 'password'">
        <v-card-text>
          You already have an account with {{ signedInMessage().provider }}
          <v-form @submit.prevent="linkAccounts" v-model="loginForm">
            <v-text-field v-model="user.email" autocomplete="email" label="Email" required
              :rules="emailRules"></v-text-field>
            <v-text-field v-model="user.password" label="Password" autocomplete="current-password" type="password"
              required :rules="passwordRules"></v-text-field>
            <v-alert v-if="!!message" class="mb-3" type="error" :text="message" variant="outlined"
              density="compact"></v-alert>
            <div class="mb-5"><a href="#">Forgot Password</a> <br /></div>
            <v-card-actions class="flex-column">
              <v-btn color="primary" block type="submit"> Sign In </v-btn>
              <v-btn color="primary" block @click="closeDialog">Close</v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
      <v-card v-if="IsSignedIn && signInResponse?.firstSignInMethod !== 'password'">
        <!-- ------ Link Accounts -------- -->
        <v-card-text>
          You are signed in with {{ signedInMessage().provider }}
        </v-card-text>
        <v-card-actions class="flex-column">
          <v-btn color="primary" block @click="linkAccounts">
            Link {{ linkMessage() }} Account
          </v-btn>
          <v-btn color="primary" block @click="closeDialog">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { authService } from "../../../services/auth/auth-services.js";
export default {
  name: "LinkCredentialsDialog",
  data() {
    return {
      dialog: false,
      signInResponse: null,
      IsSignedIn: false,
      loginForm: false,
      user: {
        email: "",
        password: "",
      },
      message: "",
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
  watch: {
    dialog(newVal, oldVal) {
      if (oldVal === true && newVal === false) {
        this.$emit("resetSignInResponse");
      }
    },
  },
  methods: {
    open(signInResponse) {
      this.dialog = true;
      this.signInResponse = signInResponse;
    },
    closeDialog() {
      this.dialog = false;
      const orgId = this.$route.params.id;
      this.$router.push(`/org/${orgId}/book`);
    },
    signedInMessage() {
      let message = {};
      switch (this.signInResponse?.firstSignInMethod) {
        case "google.com":
          message.provider = "Google";
          message.button = "Google";
          break;
        case "facebook.com":
          message.provider = "Facebook";
          message.button = "Facebook";
          break;
        case "password":
          message.provider = "Email";
          message.button = "Your Email";
        default:
          break;
      }
      return message;
    },
    linkMessage() {
      let reg = /^.*(?=\.com)/g;
      let message = this.signInResponse?.pendingProvider?.match(reg)[0];
      return message;
    },
    async signInWithExistingAccount() {
      let response = await authService.signInWithExistingAccount(
        this.signInResponse
      );

      if (response?.IsSameToExistingEmailSignIn) {
        this.IsSignedIn = true;
      } else {
        this.dialog = false;
        const orgId = this.$route.params.id;
        this.$router.push(`/org/${orgId}/book`);
      }
    },
    async linkAccounts() {
      const orgId = this.$route.params.id;
      if (this.user && this.loginForm) {
        this.signInResponse = {
          user: this.user,
          ...this.signInResponse,
        };

        const response = await authService.linkAccounts(this.signInResponse);

        if (response?.IsError) {
          this.message = response?.message;
        }

        if (response?.IsSuccess) {
          this.$router.push(`/org/${orgId}/book`);
        }
      }

      const response = await authService.linkAccounts(this.signInResponse);

      if (response?.IsSuccess) {
        this.$router.push(`/org/${orgId}/book`);
      }
    },
  },
};
</script>

<style scoped>
.flex-column {
  display: flex;
  flex-direction: column;
}
</style>
