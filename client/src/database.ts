import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";
import { Listing } from "./interfaces";

export interface AllDiffData {
  [key: string]: DiffDB
}

export interface DiffDB {
  newNum: number,
  removedNum: number,
  new?: Listing[],
  removed?: Listing[]
}

const firebaseConfig = {
  apiKey: process.env.REACT_APP_APIKEY,
  authDomain: process.env.REACT_APP_AUTHDOMAIN,
  databaseURL: process.env.REACT_APP_DATABASEURL,
  projectId: process.env.REACT_APP_PROJECTID,
  storageBucket: process.env.REACT_APP_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
  appId: process.env.REACT_APP_APPID,
  measurementId: process.env.REACT_APP_MEASUREMENTID,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const diffRootRef = ref(db, `server/diffData`);

async function getAllDiffs(): Promise<AllDiffData | null> {
  const diffSnapshot = await get(diffRootRef);
  if (diffSnapshot.exists()) {
    return diffSnapshot.val() as AllDiffData;
  } else {
    return null;
  }
}

export { getAllDiffs };


