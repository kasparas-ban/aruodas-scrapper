import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import getDiffs, { Diff } from './firebase';
import './Home.css';
import 'react-calendar/dist/Calendar.css';

interface IListingList {
  aggregatedListings: AggregatedListings
}

type AggregatedListings = {
  [key: string]: Diff[];
};

function aggregateListings(diffs: Diff[]) {
  let listings: AggregatedListings = {};
  diffs.forEach(diff => {
    const dateKey = diff.date.toLocaleDateString();
    let oldDiffs = listings[dateKey] ? [...listings[dateKey]] : [];
    listings = { ...listings, [dateKey]: [...oldDiffs, diff] };
  });
  return listings;
}

function ListingsList({ aggregatedListings }: IListingList) {
  return (
    <div>
      {Object.keys(aggregatedListings).map(listing => (
        <div key={listing}>
          {aggregatedListings[listing].map((diff) => (
            <div key={diff.date.toISOString()}>
              {`${diff.date.toDateString()} - New: ${diff.diff.new.length} - Removed: ${diff.diff.removed.length}`}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function Home() {
  const [value, onChange] = useState(new Date());
  const [allDiffs, setAllDiffs] = useState<Diff[]>([]);
  const aggregatedListings = aggregateListings(allDiffs);

  useEffect(() => {
    getDiffs().then(res => setAllDiffs(res));
  }, [])

  return (
    <div className="Home">
      <h1 className='text-3xl mt-8 mb-8 text-center text-white'>
        Aruodas.lt skelbimų atnaujinimai
        <span className='font-bold text-cyan-500'> Vilniaus </span>
        rajone
      </h1>
      <div className='grid place-items-center'>
        <Calendar onChange={onChange} value={value} />
      </div>
      <ListingsList aggregatedListings={aggregatedListings} />
    </div>
  );
}

export default Home;
