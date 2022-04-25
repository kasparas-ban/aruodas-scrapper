import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import { Listing } from './interfaces';

interface DataDiff {
  new: Listing[],
  removed: Listing[]
}

export interface Diff {
  date: Date,
  diff: DataDiff
}

const firebaseConfig = {
  apiKey: process.env.REACT_APP_APIKEY,
  authDomain: process.env.REACT_APP_AUTHDOMAIN,
  projectId: process.env.REACT_APP_PROJECTID,
  storageBucket: process.env.REACT_APP_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
  appId: process.env.REACT_APP_APPID,
  measurementId: process.env.REACT_APP_MEASUREMENTID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getDiffs() {
  const diffCollection = collection(db, 'aruodasDiff');
  const diffSnapshot = await getDocs(diffCollection);
  const diffList = diffSnapshot.docs.map(doc => {
    return { 
      date: new Date(Number(doc.id)), 
      diff: doc.data() as DataDiff
    };
  });
  return diffList;
}

export default getDiffs;