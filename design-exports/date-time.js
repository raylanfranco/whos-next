import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const customStyles = {
  timeScroll: {
    scrollbarWidth: 'thin',
    scrollbarColor: '#333 #111111',
  },
  hideScroll: {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  },
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const AVAILABLE_SLOTS = {
  '2025-04-11': ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'],
  '2025-04-14': ['9:30 AM', '1:30 PM', '3:30 PM'],
  '2025-04-15': ['9:00 AM', '9:30 AM', '11:00 AM', '1:30 PM', '2:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'],
  '2025-04-16': ['9:00 AM', '10:00 AM', '2:30 PM'],
  '2025-04-17': ['11:00 AM', '3:00 PM', '4:00 PM'],
  '2025-04-18': ['9:00 AM', '1:00 PM'],
  '2025-04-21': ['9:00 AM', '10:30 AM', '2:00 PM'],
  '2025-04-22': ['9:30 AM', '11:00 AM', '3:30 PM', '4:30 PM'],
  '2025-04-23': ['10:00 AM', '1:00 PM', '4:00 PM'],
  '2025-04-24': ['9:00 AM', '2:00 PM'],
  '2025-04-25': ['11:00 AM', '3:00 PM'],
  '2025-04-28': ['9:00 AM', '10:00 AM', '1:30 PM'],
  '2025-04-29': ['9:30 AM', '2:30 PM', '4:00 PM'],
  '2025-04-30': ['10:00 AM', '1:00 PM', '3:30 PM'],
};

const PAST_DATES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 19, 20, 26, 27];
const TODAY = 10;

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const NavBreadcrumb = () => (
  <nav className="w-full border-b border-[#222222] pb-6 mb-10 overflow-x-auto" style={customStyles.hideScroll}>
    <div className="flex items-center gap-3 min-w-max text-sm font-mono tracking-[0.1em] font-medium" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
      <div className="flex items-center gap-2 text-white/70">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>01 SERVICE</span>
      </div>
      <span className="text-[#222222] mx-1">/</span>
      <div className="flex items-center gap-2 text-white/70">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>02 VEHICLE</span>
      </div>
      <span className="text-[#222222] mx-1">/</span>
      <div className="flex items-center gap-2 text-[#E01020]">
        <span>03 DATE &amp; TIME</span>
      </div>
      <span className="text-[#222222] mx-1">/</span>
      <div className="flex items-center gap-2 text-white/30">
        <span>04 YOUR INFO</span>
      </div>
      <span className="text-[#222222] mx-1">/</span>
      <div className="flex items-center gap-2 text-white/30">
        <span>05 PAYMENT</span>
      </div>
      <span className="text-[#222222] mx-1">/</span>
      <div className="flex items-center gap-2 text-white/30">
        <span>06 CONFIRM</span>
      </div>
    </div>
  </nav>
);

const TimeSlotItem = ({ time, isSelected, onClick }) => {
  if (isSelected) {
    return (
      <div
        className="w-full p-5 border border-[#E01020] bg-[#E01020] cursor-pointer flex justify-between items-center"
        style={{ boxShadow: '4px 4px 0 0 rgba(224,16,32,0.2)', transform: 'translateY(-4px)' }}
        onClick={onClick}
      >
        <span className="font-mono text-xl font-bold text-[#0a0a0a]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{time}</span>
        <span className="font-mono text-xs font-extrabold text-[#500005] tracking-widest" style={{ fontFamily: '"JetBrains Mono", monospace' }}>120 MIN</span>
      </div>
    );
  }
  return (
    <div
      className="w-full p-5 border border-[#222222] bg-[#0a0a0a] cursor-pointer flex justify-between items-center transition-all group hover:bg-[#151515] hover:border-[#E01020]"
      onClick={onClick}
    >
      <span className="font-mono text-xl font-medium text-white group-hover:text-[#E01020] transition-colors" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{time}</span>
      <span className="font-mono text-xs font-bold text-[#666666] tracking-widest" style={{ fontFamily: '"JetBrains Mono", monospace' }}>120 MIN</span>
    </div>
  );
};

const CalendarDay = ({ day, state, isSelected, hasIndicator, onClick }) => {
  if (state === 'empty') {
    return <div className="bg-[#0f0f0f] aspect-square"></div>;
  }
  if (state === 'disabled') {
    return (
      <div className="bg-[#111111] aspect-square flex items-center justify-center text-white/20 font-mono text-lg pointer-events-none relative" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
        <span className="z-10">{day}</span>
        {hasIndicator && (
          <div className="absolute bottom-2 lg:bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#E01020]"></div>
        )}
      </div>
    );
  }
  if (isSelected) {
    return (
      <div
        className="bg-[#E01020] aspect-square flex items-center justify-center font-mono text-xl font-bold text-[#0a0a0a] relative z-10 cursor-pointer"
        style={{ fontFamily: '"JetBrains Mono", monospace', boxShadow: 'inset 0 0 0 1px #E01020' }}
        onClick={onClick}
      >
        {day}
      </div>
    );
  }
  return (
    <div
      className="bg-[#111111] aspect-square flex items-center justify-center font-mono text-lg cursor-pointer hover:bg-[#1a1a1a] border border-transparent hover:border-[#E01020] transition-all relative z-0 hover:z-10 text-white"
      style={{ fontFamily: '"JetBrains Mono", monospace' }}
      onClick={onClick}
    >
      {day}
    </div>
  );
};

const formatDateKey = (year, month, day) => {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

const formatSelectedDate = (year, month, day) => {
  const date = new Date(year, month, day);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return `${dayNames[date.getDay()]}, ${MONTH_NAMES[month]} ${day}`;
};

const DateTimePicker = () => {
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(3); // April = 3
  const [selectedDay, setSelectedDay] = useState(15);
  const [selectedTime, setSelectedTime] = useState('3:30 PM');

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      * { border-radius: 0 !important; }
      ::selection { background-color: #E01020; color: #0a0a0a; }
      .time-scroll::-webkit-scrollbar { width: 4px; }
      .time-scroll::-webkit-scrollbar-track { background: #111111; border-left: 1px solid #222; }
      .time-scroll::-webkit-scrollbar-thumb { background: #333; }
      .time-scroll::-webkit-scrollbar-thumb:hover { background: #E01020; }
      .hide-scroll::-webkit-scrollbar { display: none; }
      .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700;800&display=swap');
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
    setSelectedDay(null);
    setSelectedTime(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
    setSelectedDay(null);
    setSelectedTime(null);
  };

  const handleDayClick = (day) => {
    const key = formatDateKey(currentYear, currentMonth, day);
    if (AVAILABLE_SLOTS[key]) {
      setSelectedDay(day);
      setSelectedTime(null);
    }
  };

  const selectedDateKey = selectedDay ? formatDateKey(currentYear, currentMonth, selectedDay) : null;
  const availableTimes = selectedDateKey ? (AVAILABLE_SLOTS[selectedDateKey] || []) : [];

  const renderCalendarCells = () => {
    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-start-${i}`} className="bg-[#0f0f0f] aspect-square"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const key = formatDateKey(currentYear, currentMonth, day);
      const hasSlots = !!AVAILABLE_SLOTS[key];
      const isPast = currentMonth === 3 && currentYear === 2025 && day <= TODAY;
      const isToday = currentMonth === 3 && currentYear === 2025 && day === TODAY;
      const isSelected = selectedDay === day;

      if (isToday) {
        cells.push(
          <div key={day} className="bg-[#111111] aspect-square flex items-center justify-center text-white/20 font-mono text-lg pointer-events-none relative" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
            <span className="z-10">{day}</span>
            <div className="absolute bottom-2 lg:bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#E01020]"></div>
          </div>
        );
      } else if (isPast || !hasSlots) {
        cells.push(
          <CalendarDay key={day} day={day} state="disabled" isSelected={false} hasIndicator={false} />
        );
      } else {
        cells.push(
          <CalendarDay key={day} day={day} state="available" isSelected={isSelected} hasIndicator={false} onClick={() => handleDayClick(day)} />
        );
      }
    }

    const totalCells = cells.length;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 0; i < remaining; i++) {
      cells.push(<div key={`empty-end-${i}`} className="bg-[#0f0f0f] aspect-square"></div>);
    }

    return cells;
  };

  return (
    <div className="min-h-screen flex flex-col relative pb-24" style={{ backgroundColor: '#0a0a0a', color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <main className="w-full h-full flex-1 max-w-[1440px] mx-auto px-6 lg:px-12 pt-8 flex flex-col">
        <NavBreadcrumb />

        <header className="mb-12">
          <h1 className="text-5xl md:text-7xl tracking-wide uppercase text-white mb-3" style={{ fontFamily: 'Anton, sans-serif' }}>Date &amp; Time</h1>
          <p className="text-[#666666] text-lg">Select from available slots for your appointment.</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full h-full lg:min-h-[600px] mb-12">

          {/* Calendar Section */}
          <section className="w-full lg:w-[60%] bg-[#111111] border border-[#222222] p-6 lg:p-10 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <button
                className="p-2 text-[#666666] hover:text-[#E01020] hover:bg-[#0a0a0a] border border-transparent hover:border-[#E01020] transition-all group"
                onClick={prevMonth}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="transform transition-transform group-hover:-translate-x-1">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
              <h2 className="text-3xl md:text-4xl tracking-[0.08em] uppercase" style={{ fontFamily: 'Anton, sans-serif' }}>
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              <button
                className="p-2 text-[#666666] hover:text-[#E01020] hover:bg-[#0a0a0a] border border-transparent hover:border-[#E01020] transition-all group"
                onClick={nextMonth}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="transform transition-transform group-hover:translate-x-1">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>

            <div className="w-full bg-[#222222] border border-[#222222] grid grid-cols-7 gap-[1px]">
              {DAY_LABELS.map((label, idx) => (
                <div key={idx} className="bg-[#111111] py-4 text-center text-[#666666] text-xs font-mono font-bold tracking-[0.2em] uppercase" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  {label}
                </div>
              ))}
              {renderCalendarCells()}
            </div>
          </section>

          {/* Time Slot Section */}
          <section className="w-full lg:w-[40%] bg-[#111111] border border-[#222222] p-6 lg:p-10 flex flex-col h-[500px] lg:h-auto">
            <div className="mb-6 border-b border-[#222222] pb-6">
              <h3 className="text-2xl tracking-[0.08em] uppercase text-white mb-2" style={{ fontFamily: 'Anton, sans-serif' }}>
                {selectedDay ? formatSelectedDate(currentYear, currentMonth, selectedDay) : 'Select a Date'}
              </h3>
              <p className="text-[#666666] text-xs font-mono font-bold tracking-[0.15em] uppercase" style={{ fontFamily: '"JetBrains Mono", monospace' }}>Available Times</p>
            </div>

            <div className="flex-1 overflow-y-auto time-scroll pr-4 flex flex-col gap-3">
              {availableTimes.length > 0 ? (
                <>
                  {availableTimes.map((time) => (
                    <TimeSlotItem
                      key={time}
                      time={time}
                      isSelected={selectedTime === time}
                      onClick={() => setSelectedTime(time)}
                    />
                  ))}
                  <div className="h-4 w-full flex-shrink-0"></div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-[#666666] font-mono text-sm tracking-widest" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                    {selectedDay ? 'NO SLOTS AVAILABLE' : 'SELECT A DATE TO VIEW TIMES'}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full border-t border-[#222222] z-50" style={{ backgroundColor: '#050505' }}>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-4 lg:py-5 flex justify-between items-center">
          <div className="flex items-center gap-4 lg:gap-8">
            <span className="font-mono text-xs lg:text-sm text-[#666666] tracking-[0.15em] whitespace-nowrap" style={{ fontFamily: '"JetBrains Mono", monospace' }}>STEP 3 OF 6</span>
            <div className="hidden sm:block w-32 md:w-48 lg:w-64 h-[2px] bg-[#222222]">
              <div className="h-full bg-[#E01020] w-[50%]"></div>
            </div>
          </div>
          <button className="bg-[#E01020] text-[#0a0a0a] text-xl lg:text-2xl uppercase tracking-wide px-8 lg:px-12 py-3 lg:py-4 flex items-center gap-3 hover:bg-white transition-colors" style={{ fontFamily: 'Anton, sans-serif' }}>
            <span>Continue</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router basename="/">
      <Routes>
        <Route path="/" element={<DateTimePicker />} />
      </Routes>
    </Router>
  );
};

export default App;