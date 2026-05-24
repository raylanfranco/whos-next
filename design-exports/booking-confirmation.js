import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const customStyles = {
  borderRadiusReset: {
    borderRadius: '0',
  },
  redGlow: {
    boxShadow: '0 0 30px rgba(224,16,32,0.1)',
  },
};

const StepIndicator = () => (
  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-mono text-red-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
    <span style={{ opacity: 0.4 }}>01 ✓</span>
    <span style={{ color: '#222222' }}>/</span>
    <span style={{ opacity: 0.4 }}>02 ✓</span>
    <span style={{ color: '#222222' }}>/</span>
    <span style={{ opacity: 0.4 }}>03 ✓</span>
    <span style={{ color: '#222222' }}>/</span>
    <span style={{ opacity: 0.4 }}>04 ✓</span>
    <span style={{ color: '#222222' }}>/</span>
    <span style={{ opacity: 0.4 }}>05 ✓</span>
    <span style={{ color: '#222222' }}>/</span>
    <span style={{ opacity: 1, fontWeight: 'bold' }}>06 ✓</span>
  </div>
);

const ConfirmationIcon = () => (
  <div
    className="w-24 h-24 flex items-center justify-center relative"
    style={{
      background: '#111111',
      border: '1px solid #222222',
      borderRadius: '0',
      boxShadow: '0 0 30px rgba(224,16,32,0.1)',
    }}
  >
    <div
      className="absolute top-0 left-0 w-2 h-2"
      style={{
        borderTop: '1px solid #E01020',
        borderLeft: '1px solid #E01020',
        borderRadius: '0',
      }}
    />
    <div
      className="absolute bottom-0 right-0 w-2 h-2"
      style={{
        borderBottom: '1px solid #E01020',
        borderRight: '1px solid #E01020',
        borderRadius: '0',
      }}
    />
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 24L20 34L38 14" stroke="#E01020" strokeWidth="4" strokeLinejoin="miter" strokeMiterlimit="10" />
    </svg>
  </div>
);

const DetailItem = ({ label, value, primary, colSpan }) => (
  <div
    className={`flex flex-col gap-2 pl-4${colSpan ? ' md:col-span-2' : ''}`}
    style={{
      borderLeft: `2px solid ${primary ? '#E01020' : '#222222'}`,
      transition: 'border-color 0.2s',
    }}
    onMouseEnter={e => { if (!primary) e.currentTarget.style.borderLeftColor = '#E01020'; }}
    onMouseLeave={e => { if (!primary) e.currentTarget.style.borderLeftColor = '#222222'; }}
  >
    <span
      className="text-xs font-bold uppercase"
      style={{ letterSpacing: '0.2em', color: '#888888', fontFamily: "'Inter', sans-serif" }}
    >
      {label}
    </span>
    <span
      className="text-lg uppercase"
      style={{ color: '#ffffff', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.6 }}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  </div>
);

const ActionButton = ({ icon, label, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      className="group flex items-center justify-center gap-3 p-5 w-full"
      style={{
        background: hovered ? '#151515' : '#111111',
        border: `1px solid ${hovered ? '#E01020' : '#222222'}`,
        borderRadius: '0',
        transition: 'all 0.2s',
        outline: 'none',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={e => {
        e.currentTarget.style.outline = 'none';
        e.currentTarget.style.boxShadow = '0 0 0 1px #E01020, 0 0 0 2px #0a0a0a';
      }}
      onBlur={e => {
        e.currentTarget.style.boxShadow = 'none';
      }}
      onClick={onClick}
    >
      <span style={{ color: hovered ? '#E01020' : '#888888', transition: 'color 0.2s', display: 'flex' }}>
        {icon}
      </span>
      <span
        className="text-xs font-bold uppercase"
        style={{ color: '#ffffff', letterSpacing: '0.15em', fontFamily: "'Inter', sans-serif" }}
      >
        {label}
      </span>
    </button>
  );
};

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="4" width="18" height="18" rx="0" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const PrintIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H2V9h20v9h-4" />
    <rect x="6" y="14" width="12" height="8" rx="0" />
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="5" y="2" width="14" height="20" rx="0" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
    <line x1="8" y1="5" x2="16" y2="5" />
  </svg>
);

const BookingConfirmationPage = () => {
  const [calendarClicked, setCalendarClicked] = useState(false);
  const [printClicked, setPrintClicked] = useState(false);
  const [bookAnotherClicked, setBookAnotherClicked] = useState(false);

  const handleCalendar = () => {
    setCalendarClicked(true);
    setTimeout(() => setCalendarClicked(false), 1500);
  };

  const handlePrint = () => {
    setPrintClicked(true);
    window.print();
    setTimeout(() => setPrintClicked(false), 1500);
  };

  const handleBookAnother = () => {
    setBookAnotherClicked(true);
    setTimeout(() => setBookAnotherClicked(false), 1500);
  };

  return (
    <main
      className="w-full max-w-4xl mx-auto px-6 py-16 flex flex-col items-center"
      style={{ paddingTop: '6rem', paddingBottom: '6rem' }}
    >
      {/* Header */}
      <header className="w-full flex flex-col items-center text-center gap-12">
        <StepIndicator />

        <div className="flex flex-col items-center gap-8">
          <ConfirmationIcon />

          <div className="flex flex-col items-center gap-4">
            <h1
              className="text-5xl md:text-7xl uppercase leading-none"
              style={{
                fontFamily: "'Anton', sans-serif",
                letterSpacing: '0.05em',
                color: '#ffffff',
              }}
            >
              Booking Confirmed
            </h1>
            <p
              className="text-base md:text-lg max-w-md"
              style={{ color: '#888888', fontFamily: "'Inter', sans-serif" }}
            >
              Your appointment is scheduled. A confirmation has been sent to your email.
            </p>
          </div>
        </div>
      </header>

      {/* Booking Details Card */}
      <section
        className="w-full mt-16 p-8 md:p-12 flex flex-col gap-10 relative"
        style={{
          background: '#111111',
          border: '1px solid #222222',
          borderRadius: '0',
        }}
      >
        {/* Reference */}
        <div className="flex flex-col gap-2">
          <span
            className="text-xs font-bold uppercase"
            style={{ letterSpacing: '0.2em', color: '#888888', fontFamily: "'Inter', sans-serif" }}
          >
            Booking Reference
          </span>
          <div className="flex items-baseline gap-4">
            <span
              className="text-2xl md:text-3xl"
              style={{ fontFamily: "'Anton', sans-serif", color: '#222222' }}
            >
              #
            </span>
            <span
              className="text-3xl md:text-4xl"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: '#E01020', letterSpacing: '-0.02em' }}
            >
              WN-2405-7842
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px" style={{ background: '#222222' }} />

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
          <DetailItem label="Service" value="Mid-Size Vehicles" primary />
          <DetailItem label="Vehicle" value="2018 Mazda MX-5" />
          <DetailItem label="Date &amp; Time" value="Tue May 12 · 9:00 AM" />
          <DetailItem label="Duration" value="120 MIN" />
          <DetailItem label="Location" value={"8842 Industrial Pkwy, Unit C<br>Seattle, WA 98104"} colSpan />
        </div>

        {/* Divider */}
        <div className="w-full h-px" style={{ background: '#222222' }} />

        {/* Payment Summary */}
        <div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 p-6"
          style={{
            background: '#0a0a0a',
            border: '1px solid #222222',
            borderRadius: '0',
          }}
        >
          <div className="flex flex-col gap-1">
            <span
              className="text-xs font-bold uppercase"
              style={{ letterSpacing: '0.2em', color: '#888888', fontFamily: "'Inter', sans-serif" }}
            >
              Deposit Paid
            </span>
            <span
              className="text-2xl"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: '#E01020' }}
            >
              $150.00
            </span>
          </div>

          <div
            className="hidden sm:block w-px h-12"
            style={{ background: '#222222' }}
          />

          <div className="flex flex-col gap-1 sm:text-right w-full sm:w-auto">
            <div className="w-full h-px sm:hidden mb-4" style={{ background: '#222222' }} />
            <span
              className="text-xs font-bold uppercase"
              style={{ letterSpacing: '0.2em', color: '#888888', fontFamily: "'Inter', sans-serif" }}
            >
              Balance Due At Service
            </span>
            <span
              className="text-2xl"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: '#ffffff' }}
            >
              $149.99
            </span>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <ActionButton
          icon={<CalendarIcon />}
          label={calendarClicked ? 'Added!' : 'Add To Calendar'}
          onClick={handleCalendar}
        />
        <ActionButton
          icon={<PrintIcon />}
          label={printClicked ? 'Printing...' : 'Print Details'}
          onClick={handlePrint}
        />
        <ActionButton
          icon={<PlusIcon />}
          label={bookAnotherClicked ? 'Redirecting...' : 'Book Another'}
          onClick={handleBookAnother}
        />
      </section>

      {/* Footer */}
      <footer className="w-full flex flex-col items-center text-center gap-4 mt-20 pb-8">
        <h2
          className="text-xs font-bold uppercase"
          style={{ letterSpacing: '0.25em', color: '#888888', fontFamily: "'Inter', sans-serif" }}
        >
          Next Steps
        </h2>

        <p
          className="text-base md:text-lg max-w-lg leading-relaxed"
          style={{ color: '#d1d5db', fontFamily: "'Inter', sans-serif" }}
        >
          Arrive 10 minutes early. Bring your vehicle registration.
        </p>

        <div
          className="mt-4 flex items-center gap-3 px-6 py-4"
          style={{
            border: '1px solid #222222',
            background: '#111111',
            borderRadius: '0',
          }}
        >
          <span style={{ color: '#E01020', display: 'flex' }}>
            <PhoneIcon />
          </span>
          <span
            className="text-sm"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: '#ffffff' }}
          >
            <span style={{ color: '#888888', marginRight: '0.5rem' }}>Questions? Call or text:</span>
            +1 (555) 867-5309
          </span>
        </div>
      </footer>
    </main>
  );
};

const App = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      * { border-radius: 0 !important; }
      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: #0a0a0a; }
      ::-webkit-scrollbar-thumb { background: #222222; }
      ::-webkit-scrollbar-thumb:hover { background: #333333; }
      ::selection { background: #E01020; color: white; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <Router basename="/">
      <div
        style={{
          background: '#0a0a0a',
          color: '#ffffff',
          fontFamily: "'Inter', sans-serif",
          minHeight: '100vh',
          width: '100%',
          overflowX: 'hidden',
        }}
      >
        <Routes>
          <Route path="/" element={<BookingConfirmationPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;