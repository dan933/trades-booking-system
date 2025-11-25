const admin = require("firebase-admin");
const bookingHelper = require("../helpers/booking/bookingHelper.js");
const emailHelper = require("../helpers/public-api-functions/emailHelper.js");
const { logger } = require("firebase-functions");
const stripe = require("stripe")(process.env.STRIPE_TEST_SECRET_KEY);

exports.getAvailability = async (req, res) => {
  logger.log("req", req.body);

  const requestBody = req.body;

  //Get the orgId from the request
  const orgId = req.params.orgId;

  //Get the booked schedule for the chosen date from firestore
  const bookedSchedulesRef = admin
    .firestore()
    .collection("organisations")
    .doc(`${orgId}`)
    .collection("bookedSchedule");

  //query the booked schedule for the chosen date
  let bookingsSnapshot = await bookedSchedulesRef
    .where(
      "endTimestamp",
      ">=",
      admin.firestore.Timestamp.fromDate(
        new Date(requestBody.selectedDate.startOfDay)
      )
    )
    .where(
      "endTimestamp",
      "<",
      admin.firestore.Timestamp.fromDate(
        new Date(requestBody.selectedDate.endOfDay)
      )
    )
    .get();

  //get the bookings for that day
  let bookings = bookingsSnapshot.docs.map((doc) => doc.data());

  logger.log("bookings", bookings);

  //todo maybe add a return
  res.send(bookings);
};

exports.book = async (req, res) => {
  try {
    logger.log("request", req);

    //Get the organisation id from the request
    const orgId = req.params.orgId;

    //Get the bookingDate
    const bookingDate = req.body.bookingDate;

    logger.log("bookingDate", bookingDate);

    //Get the Customer services required
    const customerServices = req.body.services;

    logger.log("customerServices", customerServices);

    //Get the customer information
    const customerInfo = req.body.customerInformation;

    logger.log("customerInfo", customerInfo);

    //Get the Start Hour
    const startHour = req.body.startHour;

    //Get the organisation details
    const orgAvailabilityRef = admin
      .firestore()
      .collection("organisations")
      .doc(`${orgId}`)
      .collection("availability")
      .doc("opperatingHours");

    //Get the organisation availability details
    const orgAvailabilityDoc = await orgAvailabilityRef.get();

    logger.log("orgAvailabilityDoc", orgAvailabilityDoc.data());

    //Get the gap between settings for the organisation
    const gapBetween = orgAvailabilityDoc.data().gapBetween;

    logger.log("gapBetween", gapBetween);

    //Creats an array of the days hours to be used to create the bookedSchedule document
    const newBookedScheduleDoc = bookingHelper.createNewBookedSchedules(
      orgAvailabilityDoc.data(),
      bookingDate
    );

    logger.log("newBookedScheduleDoc", newBookedScheduleDoc);

    //Get the bookedSchedule ref document for the requested date
    const bookedScheduleRef = admin
      .firestore()
      .collection("organisations")
      .doc(`${orgId}`)
      .collection("bookedSchedule")
      .doc(`${bookingDate}`);

    //Booking ref for the customers booking
    const bookingRef = admin
      .firestore()
      .collection("organisations")
      .doc(`${orgId}`)
      .collection("bookings")
      .doc();

    //booking object to be created if the booking is available
    const bookingRequest = {
      bookingId: bookingRef.id,
      userId: customerInfo.userId,
      bookingDate: admin.firestore.Timestamp.fromDate(
        new Date(bookingDate)
      ).toDate(),
      startHour,
      endHour:
        startHour +
        customerServices.reduce((acc, service) => {
          return acc + service.hours;
        }, 0),
      services: customerServices,
      address: customerInfo.addressList[0],
      phoneNumber: customerInfo.phoneNumber,
      email: customerInfo.email,
      firstName: customerInfo.firstName,
      lastName: customerInfo.lastName,
      status: "pending",
    };

    logger.log("bookingRequest", bookingRequest);
    //------------------------ Run transaction -----------------------//
    //this makes sure that there are no double bookings
    let holdTimeSlot = await admin.firestore().runTransaction(async (t) => {
      //Get the bookedSchedule document for the requested date
      const bookedSchedule = await t.get(bookedScheduleRef);

      logger.log("bookedSchedule", bookedSchedule);

      //check if booking already exists for the requested date
      if (bookedSchedule.exists) {
        logger.log("bookedSchedule", bookedSchedule.data());

        //check that requested time is not already booked
        const isAvailable = bookingHelper.checkRequestedBookingAvailability(
          bookedSchedule.data(),
          customerServices,
          startHour,
          orgAvailabilityDoc.data()
        );

        logger.log("isAvailable", isAvailable);

        //if not available don't allow booking
        if (!isAvailable) {
          return {
            message: "Requested time is not available",
            success: false,
            status: "error",
          };
        }

        //update the bookedSchedule document if the requested time is available
        const updatedSchdule = bookingHelper.updateBookedScheduleDocument(
          bookedSchedule.data(),
          customerServices,
          startHour,
          gapBetween,
          orgAvailabilityDoc.data()
        );

        await t.set(bookedScheduleRef, { ...updatedSchdule });
        await t.create(bookingRef, { ...bookingRequest });

        logger.log("Booking schedule updated", updatedSchdule);

        return {
          message: "Booking Scheudle Updated",
          status: "success",
          success: true,
        };
      }

      //If there is no document for the requested date create one
      if (!bookedSchedule.exists) {
        logger.log("bookedSchedule not exist", bookedSchedule);
        //check that booking times are within opperating hours
        const isAvailable = bookingHelper.checkRequestedBookingAvailability(
          newBookedScheduleDoc,
          customerServices,
          startHour,
          orgAvailabilityDoc.data()
        );

        logger.log("isAvailable", isAvailable);

        //if not available don't allow booking
        if (!isAvailable) {
          return {
            message: "Requested time is not available",
            success: false,
            status: "error",
          };
        }

        //update bookedTimes Object with the requested booking
        const updatedSchdule = bookingHelper.updateBookedScheduleDocument(
          newBookedScheduleDoc,
          customerServices,
          startHour,
          gapBetween,
          orgAvailabilityDoc.data()
        );

        //create the bookedSchedule document
        await t.set(bookedScheduleRef, { ...updatedSchdule });
        await t.create(bookingRef, { ...bookingRequest });

        logger.log("New Booking Created", updatedSchdule);

        return {
          message: "New Booking Created",
          status: "success",
          success: true,
        };
      }
    });

    logger.log("holdTimeSlot", holdTimeSlot);

    //If the timeslot is not available return message to user
    if (!holdTimeSlot.success) {
      res.send({ ...holdTimeSlot });
      return;
    }

    //----------------------------- Stripe Payment ---------------------------------//

    //Get the stripe payment token
    const paymentToken = req.body?.paymentDetails?.token?.id;

    let chargeResponse;

    let stripeTotal = 0;

    try {
      //Get the total amount to charge the customer
      ({ stripeTotal } = await bookingHelper.calculateInvoiceTotal(
        orgId,
        customerServices
      ));

      //Attempt stripe payment
      const charge = await stripe.charges.create({
        amount: stripeTotal,
        currency: "aud",
        source: paymentToken,
        description: `${customerInfo.firstName} ${customerInfo.lastName} - ${customerInfo.userId}`,
        metadata: {
          bookingId: bookingRef.id,
          customerId: customerInfo?.userId,
        },
      });

      chargeResponse = charge;

      logger.log("charge", charge);
      logger.log("chargeResponse", chargeResponse);
      logger.log("chargeResponse captured", chargeResponse?.captured);
    } catch (error) {
      chargeResponse = error;
    }

    //----------------------------------------------------//

    logger.log("after stripe Payment");

    //------ Run transaction to update the booking status to booked or failed ---//
    const updatedBookingResponse = await admin
      .firestore()
      .runTransaction(async (t) => {
        //Get the bookedSchedule document for the requested date
        const bookedSchedule = await t.get(bookedScheduleRef);

        logger.log("bookedSchedule", bookedSchedule);

        //if the payment is a success
        if (chargeResponse?.captured) {
          //update the booking status to booked
          await t.update(bookingRef, {
            status: "paid",
            amount: stripeTotal,
            stripeChargeId: chargeResponse.id,
          });

          logger.log("onPayment success update booking line 286");

          return {
            message: "Booking Successful",
            status: "success",
            success: true,
          };
        }

        //if something went wrong with the payment

        logger.log("bookedSchedule line 237", bookedSchedule);

        //update the booking schedule by removing the reserved timeslot
        //remove the booking from the bookedSchedule document
        const updatedSchdule = bookingHelper.updateBookedScheduleDocument(
          bookedSchedule.data(),
          customerServices,
          startHour,
          gapBetween,
          orgAvailabilityDoc.data(),
          "remove"
        );

        logger.log("updatedSchdule line 296", updatedSchdule);

        await t.set(bookedScheduleRef, { ...updatedSchdule });

        logger.log("onPayment Fail update bookedScheduleRef line 323");

        //delete the booking
        await t.delete(bookingRef);

        logger.log("onPayment Fail delete booking line 329");

        //return error
        return {
          message:
            chargeResponse?.raw?.message ||
            chargeResponse?.message ||
            "server error",
          code: chargeResponse.code,
          status: "failed",
          success: false,
        };
      });
    logger.log("updatedBookingResponse", updatedBookingResponse);

    res.send({ ...updatedBookingResponse, bookingRequest: bookingRequest });
    return;
    //----------------------------------------------//
  } catch (error) {
    logger.log("error", error);
    logger.log("error", error?.raw?.message);

    res.send({
      code: error?.raw?.message,
      status: "Server error",
      success: false,
    });
    return;
  }
};

exports.sendBookingConfirmationEmail = async (req, res) => {
  try {
    const bookingRequest = req.body?.bookingRequest;
    const bookingId = req.body?.bookingRequest?.bookingId;

    //Get the orgId from the request
    const orgId = req.params.orgId;

    logger.log("bookingRequest", bookingId, bookingId, "orgId:", orgId);

    if (!bookingId || !bookingRequest) {
      res.send({
        message: "Incorrect Parameters",
        success: false,
        status: "error",
      });
      return;
    }

    //Get booking document
    const bookingRef = admin
      .firestore()
      .collection("organisations")
      .doc(`${orgId}`)
      .collection("bookings")
      .doc(`${bookingId}`);

    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      res.send({
        message: "Booking not found",
        success: false,
        status: "error",
      });
      return;
    }

    //Get the organisation document
    const orgRef = admin.firestore().collection("organisations").doc(orgId);

    const orgDoc = (await orgRef.get()).data();

    const emailResponse = await emailHelper.createBookingEmail(
      bookingRequest,
      orgDoc
    );

    if (!emailResponse?.success) {
      res.send({ ...emailResponse });
      return;
    }

    //update the booking document to show that the email has been sent
    await bookingRef.update({ emailSent: true });

    res.send({ ...emailResponse });
    return;
  } catch (error) {
    logger.log("error", error);
    logger.log("error", error?.raw?.message);

    res.send({
      code: error?.raw?.message,
      status: "Server error",
      success: false,
    });
    return;
  }
};
