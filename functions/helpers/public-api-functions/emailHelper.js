const { logger } = require("firebase-functions");

let generateBookingEmailData = (booking, gstEnabled) => {
  let serviceData = booking.services.map((service) => {
    return {
      name: service.selection.name,
      hours: service.hours,
      rate: service.selection.rate,
    };
  });

  let serviceHtml = "";
  serviceData.forEach((service, index) => {
    let color = "#fff";
    if (index % 2 === 0) {
      color = "#f2f2f2";
    }
    serviceHtml += `<tr style="background-color: ${color}">
    <td style="border: 1px solid #ddd; padding: 8px;">${service.name}</td>
    <td style="border: 1px solid #ddd; padding: 8px;">${service.hours}</td>
    <td style="border: 1px solid #ddd; padding: 8px;">$${service.rate}</td>
    </tr>`;
  });

  let total = serviceData.reduce((total, service) => {
    return total + service.hours * service.rate;
  }, 0);

  let gst = gstEnabled ? total * 0.1 : 0;
  let grandTotal = total + gst;

  let formatter = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  });

  let totalsHtml = `
  <tr>
    <td style="padding:8px"></td>
    <td style="border: 1px solid #ddd; padding: 8px;">
      <strong>Total</strong>
    </td>
    <td style="border: 1px solid #ddd; padding: 8px;">
      ${formatter.format(total)}
    </td>
  </tr>`;

  serviceHtml += totalsHtml;
  let gstHtml = "";
  if (gstEnabled) {
    gstHtml = `
    <tr>
      <td style="padding:8px"></td>
      <td style="border: 1px solid #ddd; padding: 8px;"><strong>GST</strong></td>
      <td style="border: 1px solid #ddd; padding: 8px;">${formatter.format(
        gst
      )}</td>
    </tr>
    <tr>
      <td style="padding:8px"></td>
      <td style="border: 1px solid #ddd; padding: 8px;"><strong>Grand Total</strong></td>
      <td style="border: 1px solid #ddd; padding: 8px;">${formatter.format(
        grandTotal
      )}</td>
    </tr>`;
  }

  serviceHtml += gstHtml;

  let startTime = convertTo12HourTime(booking.startHour);
  let endTime = convertTo12HourTime(booking.endHour);

  let emailHTMl = `<h1 style="font-size: 20px;">Thank you for booking with us</h1>
  <br />
  <p>We have successfully booked your appointment for ${formatDate(
    booking.bookingDate
  )} from ${startTime} to ${endTime}. Here are the details:</p>
  <table style="font-family: Arial, Helvetica, sans-serif; border-collapse: collapse; width: 100%; max-width:900px; margin-left: auto; margin-right: auto;">
  <thead style="background-color: #04AA6D;">
      <tr style="background-color: #f2f2f2;">
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #04AA6D; color: white;">Service</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #04AA6D; color: white;">Hours</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #04AA6D; color: white;">Rate</th>
      </tr>
  </thead>
  <tbody>
      ${serviceHtml}
  </tbody>
</table>
<p>Please contact us if you have any questions or changes.</p>
<p>Best,</p>
<p>Your Service Provider</p>`;

  return emailHTMl;
};

let convertTo12HourTime = (hour) => {
  // Ensure the hour is within the appropriate range
  if (hour < 0 || hour > 24) {
    return "Invalid hour. Please enter a value between 0 and 24.";
  }

  // Midnight is considered as '12 AM'
  if (hour == 0) {
    return "12:00 AM";
  }

  // Noon is '12 PM'
  else if (hour == 12) {
    return "12:00 PM";
  }

  // If the hour is less than 12, it's AM, otherwise it's PM
  else if (hour < 12) {
    return hour + ":00 AM";
  } else {
    return hour - 12 + ":00 PM";
  }
};

exports.createBookingEmail = async (booking, orgDoc) => {
  try {
    //Get org email
    const orgEmail = orgDoc?.email;

    const gstEnabled = !!orgDoc?.gst;

    logger.log("Org Email", orgEmail);

    //validate org email
    let IsValidOrgEmail = validateEmail(orgEmail);

    //validate email
    let IsValidEmail = validateEmail(booking.email);

    if (!IsValidEmail)
      return {
        message: "Invalid Email Address",
        success: false,
      };

    //Create Email html
    let emailHtml = generateBookingEmailData(booking, gstEnabled);

    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const mailOptions = {
      from: {
        email: "no-reply@danalbertportfolio.com.au",
        name: "Easy Booking",
      },
      to: booking.email,
      subject: "Booking Confirmation",
      html: emailHtml,
    };

    if (!IsValidOrgEmail) {
      return {
        message: "An error occured could not send email to website uer",
        success: false,
        error: error,
      };
    }

    const customerEmailResponse = await sgMail
      .send(mailOptions)
      .catch((error) => {
        return {
          message: "An error occured could not send email to website uer",
          success: false,
          error: error,
        };
      });

    if (
      typeof customerEmailResponse?.success === "boolean" &&
      customerEmailResponse?.success === false
    ) {
      return {
        message: "An error occured could not send email to website uer",
        success: false,
        error: error,
      };
    }

    let startTime = convertTo12HourTime(booking.startHour);
    let endTime = convertTo12HourTime(booking.endHour);

    const mailOptionsForDan = {
      from: {
        email: "no-reply@danalbertportfolio.com.au",
        name: "Easy Booking",
      },
      to: `${orgEmail}`,
      subject: `New booking from ${booking.firstName}`,
      html: `<p>You have a new booking from ${booking.firstName}</p>
                  <p>
                  email: ${booking.email}
                  bookingDate: ${formatDate(booking.bookingDate)}
                  startHour: ${startTime}
                  endHour: ${endTime}
                  </p>
                  `,
    };

    if (!IsValidOrgEmail)
      return {
        message: "Email not valid could not send email to owner",
        success: false,
      };

    const adminEmailResult = await sgMail
      .send(mailOptionsForDan)
      .catch((error) => {
        return {
          message: "An error occured could not send email to owner",
          success: false,
          error: error,
        };
      });

    if (
      typeof adminEmailResult?.success === "boolean" &&
      adminEmailResult?.success === false
    ) {
      return {
        message: "An error occured could not send email to owner",
        success: false,
        error: error,
      };
    }

    return {
      message: "Email sent to user and website owner",
      success: true,
    };
  } catch (error) {
    logger.error("Email Error", error);
    return {
      message: "Error Email Function",
      error: error,
      success: false,
    };
  }
};

exports.sendCancelBookingEmail = async (booking, refund) => {
  try {
    //validate email
    let IsValidEmail = validateEmail(booking.email);

    if (!IsValidEmail) {
      return {
        message: "Invalid Email Address",
        success: false,
      };
    }

    const bookingDate = formatDate(booking.bookingDate);
    const startTime = convertTo12HourTime(booking.startHour);
    const endTime = convertTo12HourTime(booking.endHour);
    const refundAmount = refund.toLocaleString("en-AU", {
      style: "currency",
      currency: "AUD",
    });
    const name = booking.firstName;

    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const mailOptions = {
      from: {
        email: "no-reply@danalbertportfolio.com.au",
        name: "Easy Booking",
      },
      to: booking.email,
      subject: `Booking Cancellation ${bookingDate}`,
      html: `<p>Hi ${name},</p>
      <p>Unfortunatley we are unable to make your appointment for ${bookingDate} from ${startTime} to ${endTime}.</p>
      <p>We have refunded you ${refundAmount}</p>
      <p>Please contact us if you have any questions or changes.</p>
      <p>From,</p>
      <p>Your Service Provider</p>`,
    };

    const customerEmailResponse = await sgMail
      .send(mailOptions)
      .catch((error) => {
        return {
          message: "An error occured could not send email to website uer",
          success: false,
          error: error,
        };
      });

    if (
      typeof customerEmailResponse?.success === "boolean" &&
      customerEmailResponse?.success === false
    ) {
      return {
        message: "An error occured could not send email to website uer",
        success: false,
        error: error,
      };
    }

    return {
      message: "Email sent to customer",
      success: true,
    };
  } catch (error) {
    logger.error("Email Error", error);
    return {
      message: "Error Email Function",
      error: error,
      success: false,
    };
  }
};

//Helper functions
let validateEmail = (email) => {
  //email check
  let emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  let IsValidEmail = emailRegex.test(email);

  return IsValidEmail;
};

function formatDate(date) {
  logger.log("Date", date);
  logger.log("Date Type", typeof date);
  const d = date?.toDate ? date?.toDate() : new Date(date);
  let day = d.getDate();
  let month = d.getMonth() + 1; // Since getMonth() returns month from 0-11 not 1-12
  const year = d.getFullYear();

  if (day < 10) {
    day = "0" + day;
  }

  if (month < 10) {
    month = "0" + month;
  }

  return `${day}/${month}/${year}`;
}
