const Auth = () => Promise.resolve({
<template>
  <section class="container-center">
    <div elevation="5" class="auth-section">
      <EmailRegister v-if="selectedForm === 'Register'" @switchForm="switchForm" @registerEmailUser="registerEmailUser">
        <template #providers>
          <span class="provider-or">or</span>
          <div class="provider-container">
            <button @click="() => signIn({ providerName: 'Google' })" class="provider-button text-subtitle-2">
              <img class="google-logo" src="/icons/google-logo.png" alt="" srcset="" />
              <span>Google</span>
            </button>
            <button @click="() => signIn({ providerName: 'Guest' })" class="provider-button text-subtitle-2">
              <v-icon icon="mdi:mdi-account" size="20px" color="black"></v-icon>
              <span>Guest</span>
            </button>
          </div>
          <p @click="() => switchForm('Login')" class="register-text">Already have an account ? <span
              class="register-bold">Login</span></p>
        </template>

      </EmailRegister>

      <EmailLogin v-if="selectedForm === 'Login'" :signInResponse="signInResponse" @signIn="signIn" :loading="loading">
        <template #providers>
          <span class="provider-or">or</span>
          <div class="provider-container">
            <button @click="() => signIn({ providerName: 'Google' })" class="provider-button text-subtitle-2">
              <img class="google-logo" src="/icons/google-logo.png" alt="" srcset="" />
              <span>Google</span>
            </button>
            <button @click="() => signIn({ providerName: 'Guest' })" class="provider-button text-subtitle-2">
              <v-icon icon="mdi:mdi-account" size="20px" color="black"></v-icon>
              <span>Guest</span>
            </button>
          </div>
          <p @click="() => switchForm('Register')" class="register-text">Don't have an account ? <span
              class="register-bold">Register</span></p>
        </template>
      </EmailLogin>


    </div>
    <LinkCredentialsDialog ref="linkCredentialsDialogRef" @resetSignInResponse="signInResponse = null">
    </LinkCredentialsDialog>
  </section>
</template>

<script>
import { authService } from "../../../services/auth/auth-services.js";
import LinkCredentialsDialog from "./LinkCredentialsDialog.vue";
import EmailRegister from "./EmailRegister.vue";
import EmailLogin from "./EmailLogin.vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
export default {
  name: "Auth",
  components: { LinkCredentialsDialog, EmailRegister, EmailLogin },
  data() {
    return {
      loading: false,
      selectedForm: "Login",
      provider: null,
      signInResponse: null,
      currentUser: null,
    };
  },
  computed: {},
  watch: {
    currentUser(newVal) {
      if (newVal && !this.signInResponse?.IsUserDifferentCredentials) {
        const orgId = this.$route.params.id;
        this.$router.push(`/org/${orgId}/book`);
      }
    },
  },
  mounted() {
    this.$store.commit("updateView", "auth");
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUser = user;
      }
    });
  },
  methods: {
    //checks to see if user is trying to link accounts
    switchForm(formName) {
      this.selectedForm = formName;
    },
    async signIn(signInDetails) {
      //get the organisation Id
      const orgId = this.$route.params.id;

      if (signInDetails?.providerName === "email") {
        this.loading = true;
      }

      //stops redirect to booking page
      //redirect too book happens if the user is already signed in on initial load
      this.signInResponse = await authService.signIn(signInDetails, orgId).finally(() => {
        this.loading = false;
      });

      //if the user is a Guest
      if (this.signInResponse?.IsGuest) {
        //update store of IsGuest
        this.$store.commit("setIsGuest", true);

        //redirect to booking page
        this.$router.push(`/org/${orgId}/book`);
      }

      //if account exists with different credentials
      if (this.signInResponse?.IsUserDifferentCredentials) {
        //open dialog box
        this.$refs.linkCredentialsDialogRef.open(this.signInResponse);
      }
    },
    async registerEmailUser(registerUser) {
      //stops redirect to booking page
      //redirect too book happens if the user is already signed in on initial load
      this.signInResponse = await authService.registerUser(registerUser);

      if (this.signInResponse?.IsUserDifferentCredentials) {
        //open dialog box
        this.$refs.linkCredentialsDialogRef.open(this.signInResponse);
      }
    },
  },
};
</script>

<style scoped>
.container-center {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: auto;
}

.auth-section {
  display: block;
  overflow: auto;
  max-width: 100%;
}

.provider-or {
  position: relative;
  width: 100%;
  text-align: center;
  display: flex;
  align-items: center;
  overflow: hidden;

  &::before,
  &::after {
    position: relative;
    top: -10px;
    content: "-------------------";
    flex: 1;
    height: 1px;
  }

  &::before {
    margin-right: 10px;
  }

  &::after {
    margin-left: 10px;
  }
}

.provider-container {
  padding: 15px;
  height: auto;
  min-width: 200px;
  display: flex;
  gap: 10px;
  border-radius: 5px;
  justify-content: center;
  align-items: center;
  margin: 15px 20px;
}

.provider-button {
  padding: 10px 24px;
  width: 200px;
  max-width: 60%;
  border: solid gray 1px;
  border-radius: 5px;
  height: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
}

.google-logo {
  height: 1.25rem;

}

.card-title {
  margin-top: 10px;
  text-align: center;
}

.register-text {
  text-align: center;
  cursor: pointer;
  font-weight: 100;

  .register-bold {
    font-weight: 900;
  }
}

@media screen and (max-width: 400px) {
  span {
    width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>

})
