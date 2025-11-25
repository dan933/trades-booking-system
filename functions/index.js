// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

//------------------------- Public API Functions -------------------------//

//-------------------- Submit Contact Form ---------------------------//
const contact = require("./public-api-functions/contact.js");
exports.contact = contact.contactApi;

//-----------------------------------------------------------------------//

//--------------------- Booking API Functions -----------------------//
const booking = require("./booking/booking.js");

exports.booking = booking.bookingApi;

//--------------------- Customer API Functions -----------------------//
const customer = require("./customer/customer.js");

exports.customer = customer.customerApi;

//--------------------- Admin API Functions -----------------------//
const adminApi = require("./admin/admin.js");

exports.adminApi = adminApi.adminApi;
