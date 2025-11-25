import { getAuth } from "firebase/auth";
import { getFirestore, getDoc, doc, setDoc } from "firebase/firestore";
const apiUrl = import.meta.env.VITE_APIURL;
//get user
const user = getAuth().currentUser;

let userId = user?.uid;

const db = getFirestore();

const getCustomerDetails = async (orgId) => {
  let userDocRef = doc(db, `organisations/${orgId}/users/${userId}`);

  let userDoc = await getDoc(userDocRef);

  return userDoc.data();
};

const updateCustomerDetails = async (requestBody, orgId) => {
  const userDocRef = doc(db, `organisations/${orgId}/users/${userId}`);

  await setDoc(userDocRef, requestBody);
};

const setGuestDetails = async (requestBody, orgId) => {
  let url = `${apiUrl}/customer/${orgId}/set-guest-details`;

  let resp = await fetch(url, {
    method: "POST",
    headers: {
      guest: true,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  })
    .then((res) => res.json())
    .catch((err) => {
      console.log("error setting guest", err);
    });

  return resp;
};

export { getCustomerDetails, updateCustomerDetails, setGuestDetails };
