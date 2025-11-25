<template>
  <v-card class="register-card">
    <template v-slot:title>
      <h3 class="card-title">Easy Booking</h3>
    </template>
    <h4 class="card-subtitle">Register</h4>
    <div>
      <v-form @submit.prevent="register" v-model="registrationForm" ref="registrationFormRef">
        <v-text-field variant="outlined" class="mb-2" v-model="userRegister.email" label="Email" type="email"
          autocomplete="email" required :rules="emailRules"></v-text-field>

        <v-text-field variant="outlined" class="mb-2" v-model="userRegister.password" label="Password"
          :type="showPassword ? 'text' : 'password'" autocomplete="new-password" :rules="passwordRules"
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" required
          @click:append-inner="showPassword = !showPassword"></v-text-field>

        <v-text-field variant="outlined" class="mb-2" v-model="userRegister.confirmPassword" label="Confirm Password"
          :type="showPassword ? 'text' : 'password'" autocomplete="new-password" :rules="confirmPasswordRules"
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" required
          @click:append-inner="showPassword = !showPassword"></v-text-field>

        <div class="card-button-container">
          <v-btn type="submit" color="primary" class="mb-4 pa-5 w-100 d-flex">
            Register
          </v-btn>
        </div>
      </v-form>
    </div>
    <slot name="providers"></slot>
  </v-card>

</template>
<script>
export default {
  name: "emailRegister",
  data() {
    return {
      registrationForm: false,
      userRegister: {
        email: "",
        password: "",
        confirmPassword: "",
      },
      showPassword: false,
      emailRules: [
        (v) => !!v || "Email is required",
        (v) =>
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
            v
          ) || "Email must be valid",
      ],
    };
  },
  computed: {
    passwordRules() {
      return [
        (value) => !!value || "Password Required",
        (value) =>
          value?.length > 8 || "Password must be greater than 8 charecters",
      ];
    },
    confirmPasswordRules() {
      return [
        (value) => !!value || "Password Required",
        () =>
          this.userRegister.password === this.userRegister.confirmPassword ||
          "Password must match",
      ];
    },
  },
  methods: {
    validateForm() {
      this.$nextTick(() => {
        this.registrationForm = !!this.$refs.registrationFormRef.validate();
      });
    },
    register() {
      if (this.registrationForm) {
        let newUser = {
          email: this.userRegister.email,
          password: this.userRegister.password,
        };

        this.$emit("registerEmailUser", newUser);
      }
    },
  },
  mounted() {
    // Validate the form as soon as the component is mounted
    this.validateForm();
  },
  watch: {
    userRegister: {
      handler() {
        this.validateForm();
      },
      deep: true,
    },
  },
};
</script>
<style scoped>
.register-card {
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
</style>
