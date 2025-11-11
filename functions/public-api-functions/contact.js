// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const { onRequest } = require("firebase-functions/https");

const express = require("express");

const cookieParser = require("cookie-parser")();
const cors = require("cors")({ origin: true });

const contactApi = express();

contactApi.use(cors);
contactApi.use(cookieParser);
contactApi.use(express.json());

contactApi.post("/submitForm", async (req, res) => {
  //get the email and message from the request
  const { email, message, name } = req.body;

  if (!email) {
    res.status(400).send("Email is Empty");
    return;
  }
  if (!name) {
    res.status(400).send("name is Empty");
    return;
  }
  if (!message) {
    res.status(400).send("Message is Empty");
    return;
  }

  //email check
  let emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  let IsValidEmail = emailRegex.test(email);

  //if the email is not valid return error
  if (!IsValidEmail) {
    res.status(400).send("Invalid Email Address");
    return;
  }

  const sgMail = require("@sendgrid/mail");
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const mailOptions = {
    from: {
      email: "no-reply@danalbertportfolio.com.au",
      name: "Easy Booking",
    },
    to: email,
    subject: "Thank you for contacting us",
    html: `<h1 style="font-size: 20px;">Thank you for contacting us</h1>
                <br />
                <p>We will get back to you as soon as possible.</p>
                <img style="width:300px;" src="https://images.unsplash.com/photo-1633675253938-6e02ecfa75b6?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
                <br/>
                <p>From the Easy Booking Team</p>
            `,
  };

  const mailOptionsForDan = {
    from: {
      email: "no-reply@danalbertportfolio.com.au",
      name: "Easy Booking",
    },
    to: `${process.env.EMAIL}`,
    subject: `Trades System Message`,
    html: `<p>You have a new message from ${name}</p>
                    <p>
                    email: ${email}
                    message: ${message}
                    </p>
                    `,
  };

  await sgMail.send(mailOptions).catch((error) => {
    return res.status(500).send(
      JSON.stringify({
        message: "An error occured could not send email to website user",
        success: false,
        error: error,
      })
    );
  });

  await sgMail.send(mailOptionsForDan).catch((error) => {
    return res.status(500).send(
      JSON.stringify({
        message: "An error occured could not send email to owner",
        success: false,
        error: error,
      })
    );
  });

  return res.send({
    message: "messages sent to user and website owner",
    success: true,
  });
});

exports.contactApi = onRequest({ region: "australia-southeast1" }, contactApi);
