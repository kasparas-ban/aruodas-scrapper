import admin from "firebase-admin";
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
  "private_key": process.env.PRIVATE_KEY!.replace(/\\n/g, '\n'),
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
const aruodasDataDoc = 'currentAruodasData';

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

async function updateData1(listings: DocumentListing): Promise<void> {
  try {
    // await db
    //   .collection(dataCollectionName)
    //   .doc(aruodasDataDoc)
    //   .set(listings);
    console.log('Successfully overwritten Aruodas data.');
  } catch (e) {
    console.error("Error updating the document: ", e);
  }
}

async function saveDiff(newListings: Listing[]): Promise<void> {
  try {
    const oldAruodasData = ((await db.collection(dataCollectionName).doc(aruodasDataDoc).get())
      .data() as DocumentListing).data;
    if (!oldAruodasData) throw new Error("No data document found!");
    const newDiffDoc = getDocDiff(oldAruodasData, newListings);

    const currentDate = new Date();
    const diffName = currentDate.getFullYear()+'-'+currentDate.getMonth()+'-'+currentDate.getDate();

    const oldDiffDoc = await db.collection(diffCollectionName).doc(diffName).get();
    const oldDiffData = oldDiffDoc.data() as DataDiff;

    console.log(newDiffDoc.new.length, newDiffDoc.removed.length);

    if (oldDiffDoc.exists) {
      const newListings = oldDiffData.new.concat(newDiffDoc.new);
      const removedListings = oldDiffData.removed.concat(newDiffDoc.removed);
      const updatedDiff = { new: newListings, removed: removedListings };
      db.collection(diffCollectionName)
        .doc(diffName)
        .set(updatedDiff);
    } else {
      db.collection(diffCollectionName)
        .doc(diffName)
        .set(newDiffDoc);
    }
    console.log('Successfully added a document diff to DB.');
  } catch (e) {
    console.error('Failed to save the diff to the database.')
  }
}

function getDocDiff(oldData: Listing[], newData: Listing[]): DataDiff {
  const removedListings: Listing[] = [];
  const newListings: Listing[] = [];

  newData.forEach(listing => {
    const isListingIncluded = oldData.find(secListing => {
       return compareListings(secListing, listing);
    });
    if (!isListingIncluded)
      newListings.push(listing);
  });

  oldData.forEach(listing => {
    const isListingIncluded = newData.find(newListing => {
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

export { updateData1, saveDiff };
