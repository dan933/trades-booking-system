const admin = require("firebase-admin");
const { logger } = require("firebase-functions");

exports.validateFirebaseIdToken = async (req, res, next) => {
  logger.log("Check if request is authorized with Firebase ID token");
  logger.log("req", req);
  logger.log("req", req.headers.guest);

  if (req?.headers?.guest === "true") {
    logger.log("Guest User");
    next();
    return;
  }

  if (
    (!req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer ")) &&
    !(req.cookies && req.cookies.__session)
  ) {
    logger.error(
      "No Firebase ID token was passed as a Bearer token in the Authorization header."
    );
    res.status(403).send({ message: "Unauthorized" });
    return;
  }

  let idToken;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    logger.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else if (req.cookies) {
    logger.log('Found "__session" cookie', req.cookies.__session);
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    res.status(403).send({ message: "Unauthorized" });
    return;
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    logger.log("ID Token correctly decoded", decodedIdToken);
    req.user = decodedIdToken;
    next();
  } catch (error) {
    logger.error("Error while verifying Firebase ID token:", error);
    res.status(403).send({ message: "Unauthorized" });
    return;
  }
};

exports.validateFirebaseAdminIdToken = async (req, res, next) => {
  logger.log("Check if request is authorized with Firebase ID token");

  if (
    (!req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer ")) &&
    !(req.cookies && req.cookies.__session)
  ) {
    logger.error(
      "No Firebase ID token was passed as a Bearer token in the Authorization header."
    );
    res.status(403).send({ message: "Unauthorized" });
    return;
  }

  let idToken;

  if (
    req.headers.admin &&
    req.headers.admin === "true" &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    await checkSuperUser(req, res, next);
    return;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    logger.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split("Bearer ")[1];
    // logger.log("line 85 idtoken", idToken);
  } else if (req.cookies) {
    logger.log('Found "__session" cookie', req.cookies.__session);
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    res.status(403).send({ message: "Unauthorized" });
    return;
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((token) => {
      logger.log("ID Token correctly decoded", token);
      req.user = token;
      return next();
    })
    .catch((error) => {
      logger.error("Error while verifying Firebase ID token:", error);
      res.status(403).send({ message: "Unauthorized" });
      return;
    });
};

exports.validateSuperUser = async (req, res, next) => {
  checkSuperUser(req, res, next);
  return;
};

//helpers
function superUserTokenCheck(token) {
  if (token === process.env.ADMIN_TOKEN) {
    return true;
  }

  return false;
}

async function checkSuperUser(req, res, next) {
  //check if the user is a super admin
  //Ability to set admin permissions and claims

  let idToken = req.headers.authorization.split("Bearer ")[1];
  const IsSuperUser = superUserTokenCheck(idToken);

  if (IsSuperUser) {
    next();
    return;
  }

  res.status(403).send({ message: "Unauthorized" });
  return;
}
