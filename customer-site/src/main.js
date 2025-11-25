import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import Router from "./router/router.js";
import store from "./store/store.js";
import vuetify from "./plugins/vuetify.js";
import { Calendar, DatePicker } from "v-calendar";
import "v-calendar/style.css";
//auth needs to be imported here to init
import { auth } from "./services/firebase/firebaseConfig.js";

createApp(App)
  .use(Router)
  .use(store)
  .use(vuetify)
  .component("VCalendar", Calendar)
  .component("VDatePicker", DatePicker)
  .mount("#app");
