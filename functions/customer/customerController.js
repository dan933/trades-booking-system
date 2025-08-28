// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
const { logger } = require("firebase-functions");
//--------------------- Gets the customers details ------------------//
exports.getCustomerDetails = async (req, res) => {
  logger.log("req", req);

  const orgId = req.params.orgId;

  const userDetails = await admin
    .firestore()
    .collection("organisations")
    .doc(`${orgId}`)
    .collection("users")
    .doc(`${req.user.sub}`)
    .get();

  res.send(userDetails.data());
};

//------------------------ Set Guest details ------------------------------//
/**
 *
 * @param {{body: {email:string; firstName:string; lastName:string; phoneNumber:string; addressList: string[]} }} req
 * @param {*} res
 */
exports.setGuestDetails = async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, guest");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const orgId = req.params.orgId;
  const body = req?.body;

  if (!orgId) {
    res.status(400).send("orgId is required");
    return;
  }

  if (!body?.email) {
    res.status(400).send("email is required");
    return;
  }

  if (!body?.firstName) {
    res.status(400).send("firstName is required");
    return;
  }

  if (!body?.lastName) {
    res.status(400).send("lastName is required");
    return;
  }

  if (!body?.phoneNumber) {
    res.status(400).send("phoneNumber is required");
    return;
  }

  if (!body?.addressList || body.addressList.length === 0) {
    res
      .status(400)
      .send("addressList is required and must have at least 1 address");
    return;
  }

  //Check if a user with that email already exists
  let resp = await admin
    .firestore()
    .collection("organisations")
    .doc(`${orgId}`)
    .collection("users")
    .where("email", "==", body.email)
    .limit(1)
    .get();

  if (resp.empty) {
    //Create a new user
    await admin
      .firestore()
      .collection("organisations")
      .doc(`${orgId}`)
      .collection("users")
      .add({
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        phoneNumber: body.phoneNumber,
        addressList: body.addressList,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isGuest: true,
      });
  }

  res.send({ message: "guest set" });
};
