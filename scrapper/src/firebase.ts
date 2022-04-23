import admin = require("firebase-admin");
import { DocumentListing, Listing } from "./interfaces";
require('dotenv').config();

type Document = admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>;

interface LatestDocuments {
  latestDoc: Document,
  secondDoc: Document
}

export interface LatestDocumentData {
  latestDoc: DocumentListing,
  secondDoc: DocumentListing
}

interface DataDiff {
  new: Listing[],
  removed: Listing[]
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
const dataCollectionName = 'aruodasData';
const diffCollectionName = 'aruodasDiff';

function findTwoLatestDocuments(documents: Document[]): LatestDocuments | undefined {
  if (documents.length === 0) return undefined;
  const getLatestDocument = (docs: Document[]): Document => {
    let latestTime = admin.firestore.Timestamp.fromDate(new Date(0));
    let latestDoc = null as unknown as Document;

    for (const doc of Array.from(docs)) {
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
    secondDoc: getLatestDocument(Array.from(documents).filter((doc) => doc !== latestDoc)),
  };

  return latestDocs;
}

async function readLatestData(): Promise<LatestDocumentData | undefined> {
  try {
    const collectionRef = db.collection(dataCollectionName);
    const querySnapshot = (await collectionRef.get()).docs;
    const latestDocs = findTwoLatestDocuments(querySnapshot);

    return latestDocs ? {
      latestDoc: latestDocs.latestDoc.data() as DocumentListing,
      secondDoc: latestDocs.secondDoc.data() as DocumentListing
    } : undefined;
  } catch (e) {
    console.error("Error receiving document: ", e);
  }
}

function compareListings(firstListing: Listing, secondListing: Listing): boolean {
  return (
    firstListing.district === secondListing.district &&
    firstListing.street === secondListing.street &&
    firstListing.price === secondListing.price &&
    firstListing.pricePM === secondListing.pricePM &&
    firstListing.roomNum === secondListing.roomNum &&
    firstListing.area === secondListing.area &&
    firstListing.floor === secondListing.floor
  );
}

export function getDocDiff(documents: LatestDocumentData): DataDiff {
  const removedListings: Listing[] = [];
  const newListings: Listing[] = [];
  const [latestData, secondData] = [
    documents.latestDoc.data, 
    documents.secondDoc.data
  ];

  latestData.forEach(listing => {
    const isListingIncluded = secondData.find(secListing => {
       return compareListings(secListing, listing);
    });
    if (!isListingIncluded)
      newListings.push(listing);
  });

  secondData.forEach(listing => {
    const isListingIncluded = secondData.find(newListing => {
       return compareListings(newListing, listing);
    });
    if (!isListingIncluded)
      removedListings.push(listing);
  });

  return {
    new: newListings,
    removed: removedListings
  }
}

async function saveLatestDiff(): Promise<void> {
  try {
    const latestDocs = await readLatestData();
    if (latestDocs) {
      const currentDate = Date.now().toString();
      const docDiff = getDocDiff(latestDocs);
      await db
        .collection(diffCollectionName)
        .doc(currentDate)
        .set(docDiff);
    }
    console.log('Successfully added a document diff to DB.');
  } catch (e) {
    console.error('Failed to save the diff to the database.')
  }
}

async function uploadListings(listings: DocumentListing): Promise<void> {
  try {
    const currentDate = Date.now().toString();
    await db
      .collection(dataCollectionName)
      .doc(currentDate)
      .set(listings);
    console.log('Successfully added a document to DB.');
  } catch (e) {
    console.error("Error uploading document: ", e);
  }
}

export { readLatestData, uploadListings, saveLatestDiff };
