import admin = require("firebase-admin");
import { DocumentListing } from "./interfaces";
require('dotenv').config();

type Document = admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>;

interface LatestDocuments {
  latestDoc: Document,
  secLatestDoc: Document
}

const configuration: any = {
  "type": process.env.TYPE,
  "project_id": process.env.PROJECT_ID,
  "private_key_id": process.env.PRIVATE_KEY_ID,
  "private_key": process.env.PRIVATE_KEY,
  "client_email": process.env.CLIENT_EMAIL,
  "client_id": process.env.CLIENT_ID,
  "auth_uri": process.env.AUTH_URI,
  "token_uri": process.env.TOKEN_URI,
  "auth_provider_x509_cert_url": process.env.AUTH_PROVIDER_X509_CERT_URL,
  "client_x509_cert_url": process.env.CLIENT_X509_CERT_URL

};

admin.initializeApp({
  credential: admin.credential.cert(configuration),
});

const db = admin.firestore();
const collectionName = 'aruodasData';

function findTwoLatestDocuments(documents: Document[]): LatestDocuments | undefined {
  if (documents.length === 0) return undefined;
  const getLatestDocument = (docs: Document[]): Document => {
    let latestTime = admin.firestore.Timestamp.fromDate(new Date(0));
    let latestDoc = null as unknown as Document;

    for (let doc of Array.from(docs)) {
      if (doc.createTime > latestTime) {
        latestTime = doc.createTime;
        latestDoc = doc;
      }
    }
    return latestDoc;
  };

  const latestDoc = getLatestDocument(documents);
  const latestDocs = {
    latestDoc,
    secLatestDoc: getLatestDocument(Array.from(documents).filter((doc) => doc !== latestDoc)),
  };

  return latestDocs;
}

async function readLatestData(): Promise<any> {
  try {
    const collectionRef = db.collection(collectionName);
    const querySnapshot = (await collectionRef.get()).docs;
    const latestDocs = findTwoLatestDocuments(querySnapshot);

    return latestDocs ? {
      latestDoc: latestDocs.latestDoc.data(),
      secondDoc: latestDocs.secLatestDoc.data()
    } : undefined;
  } catch (e) {
    console.error("Error receiving document: ", e);
  }
}

async function uploadListings(listings: DocumentListing): Promise<void> {
  try {
    const docName = 'test 12345';
    const res = await db.collection(collectionName).doc(docName).set(listings);
    console.log('Successfully added a document to DB.', res);
  } catch (e) {
    console.error("Error uploading document: ", e);
  }
}

export { readLatestData, uploadListings };
