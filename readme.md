# Easy Booking

![Alt text](./admin-site/src/assets/favicon.ico)

A booking schedule application, allowing customers to book a service and pay via stripe. This application has an admin panel allowing an admin user to cancel bookings, refund the customer. Set business hours and company settings, cancel/refund bookings and visulise revenue through the dashboard. Email notifications are sent to customers when bookings are created, cancelled or refunded.

Deployment URL:
[https://trades-booking-system.web.app/](https://trades-booking-system.web.app/)

## Backend

The backend is built with Firebase Functions using Node.js and Express.js. It handles booking creation, cancellation, refunds, and email notifications.

### Backend .env environment variables

```
VITE_APP_FIREBASE_API_KEY=
VITE_APP_FIREBASE_AUTH_DOMAIN=
# VITE_APP_FIREBASE_DATABASE_URL
VITE_APP_FIREBASE_PROJECT_ID=
VITE_APP_FIREBASE_STORAGE_BUCKET=
VITE_APP_FIREBASE_MESSAGING_SENDER_ID=
VITE_APP_FIREBASE_APP_ID=
VITE_APP_FIREBASE_MEASUREMENT_ID=
VITE_APIURL=
VITE_APP_STRIPE_TEST_PUBLISHABLE_KEY=
VITE_APP_MAPS_API_KEY=
```

## Frontend Customer Site

The frontend is built with Vue 3 and Vuetify. It provides a user-friendly interface for customers to book services and for admins to manage bookings.

## Frontend Admin Site

The admin panel is also built with Angular and Angular Materials. It allows admins to manage bookings, view revenue statistics, and configure business settings.

### Deployment

Install the firebase cli

```
npm install -g firebase-tools
```

Login to firebase

```
firebase login
```

#### Build Customer and Admin Frontends

```
cd customer-site
npm install
npm run build
cd ../admin-site
npm install
npm run build
cd ..
```

### Install firebase functions

```
cd functions
npm install
cd ..
```

#### Deploy to Firebase

```
firebase deploy
```
