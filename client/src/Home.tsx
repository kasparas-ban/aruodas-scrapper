import { useEffect, useState } from 'react';
import Calendar, { CalendarTileProperties } from 'react-calendar';
import getDiffs, { Diff } from './firebase';
import './Home.css';
import 'react-calendar/dist/Calendar.css';
import { Listing } from './interfaces';
import ListingContainer from './ListingContainer';

interface IListingList {
  aggregatedListings: AggregatedListings
}

type AggregatedListings = {
  [key: string]: Diff[];
};

// interface DataDiff {
//   new: Listing[],
//   removed: Listing[]
// }

function aggregateListings(diffs: Diff[]) {
  let listings: AggregatedListings = {};
  diffs.forEach(diff => {
    const dateKey = diff.date.toLocaleDateString();
    let oldDiffs = listings[dateKey] ? [...listings[dateKey]] : [];
    listings = { ...listings, [dateKey]: [...oldDiffs, diff] };
  });
  return listings;
}

interface Results {
  addedListings: Listing[],
  removedListings: Listing[]
}

function ResultsList({ addedListings, removedListings }: Results) {
  console.log(removedListings);
  return (
    <div className='text-white text-center mb-8'>
      <div>
        <div className='text-xl my-4'>Nauji/atnaujinti skelbimai</div>
        <div className='grid grid-cols-7 gap-4 mb-1 w-700px'>
          <div>Rajonas</div>
          <div>Gatvė</div>
          <div>Plotas</div>
          <div>Kambarių skaičius</div>
          <div>Aukštas</div>
          <div>Kaina už kvadratą</div>
          <div>Kaina</div>
        </div>
        {addedListings.map((listing, index) => (
          <div key={index}>
            <ListingContainer listing={listing} />
          </div>
        ))}
      </div>
      <div>
        <div className='text-xl my-4'>Pašalinti skelbimai</div>
        <div className='grid grid-cols-7 gap-4 mb-1 w-700px'>
          <div>Rajonas</div>
          <div>Gatvė</div>
          <div>Plotas</div>
          <div>Kambarių skaičius</div>
          <div>Aukštas</div>
          <div>Kaina už kvadratą</div>
          <div>Kaina</div>
        </div>
        {removedListings.map((listing, index) => (
          <div key={index}>
            <ListingContainer listing={listing} />
          </div>
        ))}
      </div>
    </div>
  );
}

interface ICalendarDay {
  addedNum: number,
  removedNum: number
}

function CalendarDay({ addedNum, removedNum }: ICalendarDay) {
  return (
    <div className='my-4'>
      <span className="text-green-400">{addedNum ? `+${addedNum} ` : `.`}</span>
      <span className='text-red-400'>{removedNum ? ` -${removedNum}` : ``}</span>
    </div>
  );
}

function Home() {
  const [value, onChange] = useState(new Date());
  const [allDiffs, setAllDiffs] = useState<Diff[]>([]);
  const aggregatedListings = aggregateListings(allDiffs);

  const addedListingsInDayNum = (date: string) => {
    let addedNum = 0;
    if (aggregatedListings[date])
      aggregatedListings[date].forEach(diff => addedNum += diff.diff.new.length);
    return addedNum;
  };

  const removedListingsInDayNum = (date: string) => {
    let removedNum = 0;
    if (aggregatedListings[date])
      aggregatedListings[date].forEach(diff => removedNum += diff.diff.removed.length);
    return removedNum;
  };

  const addedListingsInDay = (date: string) => {
    let addedListings: Listing[] = [];
    if (aggregatedListings[date])
      aggregatedListings[date].forEach(diff => addedListings = [...addedListings, ...diff.diff.new]);
    return addedListings;
  };

  const removedListingsInDay = (date: string) => {
    let removedListings: Listing[] = [];
    if (aggregatedListings[date])
      aggregatedListings[date].forEach(diff => removedListings = [...removedListings, ...diff.diff.removed]);
    return removedListings;
  };

  useEffect(() => {
    getDiffs().then(res => setAllDiffs(res));
  }, []);

  return (
    <div className="Home">
      <h1 className='text-3xl mt-8 mb-8 text-center text-white'>
        Aruodas.lt skelbimų atnaujinimai
        <span className='font-bold text-cyan-500'> Vilniaus </span>
        rajone
      </h1>
      <div className='grid place-items-center'>
        <Calendar
          onChange={onChange}
          value={value}
          tileContent={day =>
            <CalendarDay
              addedNum={addedListingsInDayNum(day.date.toLocaleDateString())}
              removedNum={removedListingsInDayNum(day.date.toLocaleDateString())}
            />
          }
        />
      </div>
      <ResultsList
        addedListings={addedListingsInDay(value.toLocaleDateString())}
        removedListings={removedListingsInDay(value.toLocaleDateString())}
      />
    </div>
  );
}

export default Home;
