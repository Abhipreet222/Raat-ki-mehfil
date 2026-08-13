'use client';

import React, { useState, useEffect } from 'react';

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null; // Avoid hydration mismatch by rendering nothing until mounted

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  const hours12 = hours % 12 || 12;
  const minutesStr = minutes.toString().padStart(2, '0');
  
  const timeString = `${hours12}:${minutesStr} ${ampm}`;

  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  
  const dayName = days[time.getDay()];
  const dateNum = time.getDate();
  const monthName = months[time.getMonth()];
  
  let timeZoneStr = 'IST'; 
  try {
    const tzMatch = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(time).find(p => p.type === 'timeZoneName')?.value;
    if (tzMatch) {
      timeZoneStr = tzMatch.toUpperCase();
    }
  } catch(e) {}

  const dateString = `${dayName}, ${dateNum} ${monthName} · ${timeZoneStr}`;

  return (
    <div className="absolute top-6 md:top-8 left-6 md:left-8 z-20 pointer-events-none flex flex-col items-start font-mono drop-shadow-md">
      <div className="text-[#fdf5e6] text-xl md:text-2xl font-bold tracking-wider mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        {timeString}
      </div>
      <div className="text-[#d6ccaa] text-[9px] md:text-[10px] font-semibold tracking-[0.15em] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] opacity-90">
        {dateString}
      </div>
    </div>
  );
}
