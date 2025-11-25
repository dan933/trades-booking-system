//----------------- Setup ------------------------------//
// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const express = require("express");
const { onRequest } = require("firebase-functions/https");

const cookieParser = require("cookie-parser")();
const cors = require("cors")({ origin: true });

const customerApi = express();

//---------------------------------------------------------//
//----------------------- Permissions -----------------------------------------//
// A user must be logged in
const {
  validateFirebaseIdToken,
} = require("../helpers/session/permissions.js");

//-----------------------------------------------------------------------------//

const customerController = require("./customerController.js");
customerApi.use(cors);
customerApi.use(validateFirebaseIdToken);
customerApi.use(cookieParser);
customerApi.use(express.json());

customerApi.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (data) {
    if (typeof data === "object") {
      return originalSend.call(this, JSON.stringify(data));
    }
    return originalSend.call(this, data);
  };
  next();
});

//---------------- Controllers ---------------------------------------//
customerApi.get(
  "/:orgId/get-customer-details",
  customerController.getCustomerDetails
);

customerApi.post(
  "/:orgId/set-guest-details",
  customerController.setGuestDetails
);

//----------------- Exports ------------------------------//
exports.customerApi = onRequest(
  { region: "australia-southeast1" },
  customerApi
);
