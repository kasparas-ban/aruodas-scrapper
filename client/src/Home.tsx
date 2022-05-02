import { useEffect, useState } from 'react';
import Calendar, { CalendarTileProperties } from 'react-calendar';
import { AllDiffData, DiffDB, getAllDiffs } from './database';
import ListingContainer from './ListingContainer';
import 'react-calendar/dist/Calendar.css';
import './Home.css';

interface Results {
  diffData?: DiffDB
}

function ResultsList({ diffData }: Results) {
  const newListings = diffData?.new || [];
  const removedListings = diffData?.removed || [];
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
        {newListings.map((listing, index) => (
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
  const [allDiffs, setAllDiffs] = useState<AllDiffData>({});

  // console.log('allDiffs:\n', allDiffs['2022-4-2']);

  const getDate = (day: Date) =>
    day.getFullYear() + '-' + day.getMonth() + '-' + day.getDate();

  useEffect(() => {
    getAllDiffs().then(allDiffData => {
      if (allDiffData) setAllDiffs(allDiffData);
    })
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
              addedNum={allDiffs[getDate(day.date)]?.newNum || 0}
              removedNum={allDiffs[getDate(day.date)]?.removedNum || 0}
            />
          }
        />
      </div>
      <ResultsList
        diffData={allDiffs[getDate(value)]}
      />
    </div>
  );
}

export default Home;
