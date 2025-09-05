// import Contact from "../components/contact/contact.vue";
import NotFound from "../components/not-found/NotFound.vue";
import { createRouter, createWebHistory } from "vue-router";
import { getAuth } from "firebase/auth";
import bookingStore from "../store/store";
import Landing from "../components/landing/landing.vue";

const routes = [
  {
    name: "Landing",
    path: "/",
    component: Landing,
  },
  // {
  //   name: "Contact",
  //   path: "/contact",
  //   component: Contact,
  // },
  {
    name: "SuccessBooking",
    path: "/org/:id/book/confirmation",
    component: () => import("../components/book/BookNow/SuccessBooking.vue"),
  },
  {
    name: "FailedBooking",
    path: "/org/:id/book/failed",
    component: () => import("../components/book/BookNow/FailedBooking.vue"),
  },
  {
    name: "Book",
    path: "/org/:id/book",
    component: () => import("../components/book/BookNow/Book.vue"),
  },
  {
    name: "Auth",
    path: "/org/:id/auth",
    component: () => import("../components/book/auth/Auth.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    component: NotFound,
  },
];

const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHistory(),
  routes, // short for `routes: routes`
});
router.beforeEach(async (to, from, next) => {
  const auth = getAuth().currentUser;

  let IsLoggedIn = !!auth;

  let IsGuest = bookingStore.state.IsGuest;

  //The organisation id from the previous page
  let org = from.params.id || to.params.id;

  if (to.name === "Auth" && (IsLoggedIn || IsGuest))
    next({ path: `/org/${org}/book` });
  if (to.name === "Book" && !IsLoggedIn && !IsGuest)
    next({ path: `/org/${org}/auth` });
  else next();
});

export default router;
