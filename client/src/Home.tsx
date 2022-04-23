import { useState } from 'react';
import Calendar from 'react-calendar';
import './Home.css';
import 'react-calendar/dist/Calendar.css';

function Home() {
  const [value, onChange] = useState(new Date());
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
    </div>
  );
}

export default Home;
