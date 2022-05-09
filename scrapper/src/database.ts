import admin from "firebase-admin";
import { Listing } from "./interfaces";
require('dotenv').config();

interface DiffObject {
  newNum: number,
  removedNum: number,
  new: Listing[],
  removed: Listing[]
}

interface DiffDB {
  newNum: number,
  removedNum: number,
  new?: Listing[],
  removed?: Listing[]
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
  databaseURL: "https://aruodas-scrapper-default-rtdb.europe-west1.firebasedatabase.app/"
});

const db = admin.database();
const dataRef = db.ref("server/aruodasData");
const getDiffRef = (date: string) =>  db.ref(`server/diffData/${date}`);

async function updateData(listings: Listing[]): Promise<void> {
  try {
    await dataRef.set(listings);
    console.log('Successfully overwritten Aruodas data.');
  } catch (e) {
    console.error("Error updating the document: ", e);
  }
}

async function saveDiff(newListings: Listing[]): Promise<void> {
  const currentDate = new Date();
  const diffDate = currentDate.getFullYear()+'-'+currentDate.getMonth()+'-'+currentDate.getDate();

  try {
    const oldAruodasData = (await dataRef.get()).val() as Listing[];
    if (!oldAruodasData) throw new Error("No data document found!");

    const newDiffData = getDiffObj(oldAruodasData, newListings);

    const diffRef = getDiffRef(diffDate);
    const oldDiff = await diffRef.get();
    const oldDiffData = oldDiff.exists() ? oldDiff.val() as DiffDB : null;

    if (!!oldDiffData) {
      const updatedNewListings = oldDiffData.new ? oldDiffData.new.concat(newDiffData.new) : newDiffData.new;
      const updatedRemovedListings = oldDiffData.removed ? oldDiffData.removed.concat(newDiffData.removed) : newDiffData.removed;
      const updatedDiff: DiffObject = {
        newNum: updatedNewListings.length,
        removedNum: updatedRemovedListings.length,
        new: updatedNewListings,
        removed: updatedRemovedListings
      }
      await diffRef.set(updatedDiff);
    } else {
      await diffRef.set(newDiffData);
    }
    console.log('Successfully added a document diff to DB.');
  } catch (e) {
    console.error('Failed to save the diff to the database.')
  }
}

function getDiffObj(oldData: Listing[], newData: Listing[]): DiffObject {
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
    newNum: newListings.length,
    removedNum: removedListings.length,
    new: newListings,
    removed: removedListings
  }
}

function compareListings(firstListing: Listing, secondListing: Listing): boolean {
  return (
    firstListing.street === secondListing.street &&
    firstListing.price === secondListing.price &&
    firstListing.area === secondListing.area &&
    firstListing.floor === secondListing.floor
  );
}

export { updateData, saveDiff };