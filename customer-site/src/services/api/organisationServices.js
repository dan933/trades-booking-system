import { getFirestore, getDoc, doc } from "firebase/firestore";

const db = getFirestore();

const getOrganisationDoc = async (orgId) => {
  const servicesRef = doc(db, `organisations/${orgId}`);

  const orgDoc = (await getDoc(servicesRef)).data();

  return orgDoc;
};

export { getOrganisationDoc };
