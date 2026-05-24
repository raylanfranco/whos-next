import React, { useState, useEffect } from 'react';

const customStyles = {
  root: {
    '--wn-primary': '#E01020',
    '--bg-base': '#0a0a0a',
    '--bg-surface': '#111111',
    '--border-subtle': '#222222',
    '--border-focus': '#444444',
    '--text-main': '#f4f4f5',
    '--text-muted': '#888888',
  }
};

const services = [
  {
    id: 'srv_1',
    price: 150,
    title: 'Compact & Sedan',
    duration: '120 MIN',
    description: 'Standard exterior wash, paint decontamination, and complete interior refresh tailored for standard 2-4 door passenger vehicles.',
    icon: (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M5 16h14a2 2 0 0 0 2-2v-4.5a2.5 2.5 0 0 0-2.5-2.5H16l-3.5-4h-5L4 11H3.5A2.5 2.5 0 0 0 1 13.5V14a2 2 0 0 0 2 2z" />
        <circle cx="7" cy="16" r="2.5" />
        <circle cx="17" cy="16" r="2.5" />
      </svg>
    )
  },
  {
    id: 'srv_2',
    price: 200,
    title: 'Mid-Size SUV',
    duration: '150 MIN',
    description: 'Comprehensive exterior and interior treatment designed for crossovers and standard 5-passenger utility vehicles.',
    icon: (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M4 16h16a2 2 0 0 0 2-2v-3.5a2.5 2.5 0 0 0-2.5-2.5H16l-2.5-4h-7L4 9H2.5A2.5 2.5 0 0 0 0 11.5V14a2 2 0 0 0 2 2z" />
        <circle cx="6" cy="16" r="2.5" />
        <circle cx="18" cy="16" r="2.5" />
      </svg>
    )
  },
  {
    id: 'srv_3',
    price: 250,
    title: 'Full-Size & Truck',
    duration: '210 MIN',
    description: 'Heavy-duty cleaning, paint protection, and expansive cabin detailing for trucks, minivans, and 3-row SUVs.',
    icon: (
      <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M3 16h18a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-3l-2.5-4h-9L4 9H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2z" />
        <circle cx="6" cy="16" r="3" />
        <circle cx="18" cy="16" r="3" />
        <line x1="12" y1="9" x2="12" y2="16" />
      </svg>
    )
  },
  {
    id: 'srv_4',
    price: 450,
    title: 'Exotic & Classic',
    duration: '360 MIN',
    description: 'Bespoke care utilizing specialized, pH-neutral chemicals, multi-stage correction, and zero-contact drying methods.',
    icon: (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    )
  }
];

const ServiceCard = ({ service, isSelected, onSelect }) => {
  const cardStyle = {
    backgroundColor: isSelected ? '#141010' : '#111111',
    border: isSelected ? '2px solid #E01020' : '1px solid #222222',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: '0',
  };

  const badgeStyle = {
    opacity: isSelected ? 1 : 0,
    transform: isSelected ? 'scale(1)' : 'scale(0.8)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#E01020',
    zIndex: 20,
    width: '2.5rem',
    height: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 15px rgba(224,16,32,0.5)',
  };

  const imgPlaceholderStyle = {
    backgroundColor: '#161616',
    backgroundImage: 'radial-gradient(#222222 1px, transparent 1px)',
    backgroundSize: '16px 16px',
    position: 'relative',
  };

  const imgOverlayStyle = {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(10,10,10,0.9) 100%)',
    zIndex: 10,
  };

  const innerGlowStyle = isSelected
    ? { boxShadow: 'inset 0 0 100px rgba(224, 16, 32, 0.12)' }
    : {};

  return (
    <button
      style={{ ...cardStyle, ...innerGlowStyle }}
      onClick={() => onSelect(service.id, service.price)}
      className="group w-full"
    >
      <div style={badgeStyle}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <div
        className="w-full overflow-hidden"
        style={{
          ...imgPlaceholderStyle,
          aspectRatio: '16/9',
          borderBottom: '1px solid #222222',
        }}
      >
        <div style={imgOverlayStyle} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 0,
            opacity: 0.2,
          }}
        >
          {service.icon}
        </div>
      </div>

      <div className="p-8 flex flex-col flex-1" style={{ position: 'relative', zIndex: 10 }}>
        <div className="flex justify-between items-start mb-4 gap-4">
          <h2
            className="text-2xl font-bold uppercase tracking-tight text-white leading-none mt-1"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {service.title}
          </h2>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 shrink-0"
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #444444',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span
              className="text-xs tracking-widest mt-0.5"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: '#888888' }}
            >
              {service.duration}
            </span>
          </div>
        </div>

        <p className="text-sm leading-relaxed" style={{ color: '#888888', maxWidth: '85%' }}>
          {service.description}
        </p>

        <div className="mt-auto pt-10 flex justify-end items-end w-full">
          <div
            className="flex items-baseline gap-1 px-4 py-2"
            style={{
              backgroundColor: '#0a0a0a',
              border: '1px solid #222222',
            }}
          >
            <span
              className="text-xl"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: '#888888' }}
            >
              $
            </span>
            <span
              className="text-5xl font-bold tracking-tighter leading-none text-white"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {service.price}
            </span>
            <span
              className="text-sm tracking-widest ml-0.5"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: '#888888' }}
            >
              .00
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

const App = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(0);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;700;800&display=swap');
      * { border-radius: 0 !important; }
      body { margin: 0; padding: 0; background-color: #0a0a0a; -webkit-font-smoothing: antialiased; }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: #0a0a0a; }
      ::-webkit-scrollbar-thumb { background: #444444; }
      ::-webkit-scrollbar-thumb:hover { background: #888888; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleSelect = (id, price) => {
    setSelectedId(id);
    setSelectedPrice(price);
  };

  const isSelected = selectedId !== null;

  return (
    <div
      style={{
        backgroundColor: '#0a0a0a',
        color: '#f4f4f5',
        fontFamily: "'Inter', sans-serif",
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div className="w-full p-6 md:p-12 lg:px-8 pt-12 md:pt-20" style={{ maxWidth: '1200px' }}>

          {/* Breadcrumb */}
          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-12 text-xs md:text-sm tracking-[0.2em] uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <span style={{ color: '#E01020', fontWeight: 'bold' }} className="flex items-center gap-1.5">
              01 SERVICE
            </span>
            <span style={{ color: '#888888', opacity: 0.3 }}>/</span>
            <span style={{ color: '#888888', opacity: 0.3 }}>02 VEHICLE</span>
            <span style={{ color: '#888888', opacity: 0.3 }}>/</span>
            <span style={{ color: '#888888', opacity: 0.3 }}>03 DATE &amp; TIME</span>
            <span style={{ color: '#888888', opacity: 0.3 }}>/</span>
            <span style={{ color: '#888888', opacity: 0.3 }}>04 YOUR INFO</span>
            <span style={{ color: '#888888', opacity: 0.3 }}>/</span>
            <span style={{ color: '#888888', opacity: 0.3 }}>05 PAYMENT</span>
            <span style={{ color: '#888888', opacity: 0.3 }}>/</span>
            <span style={{ color: '#888888', opacity: 0.3 }}>06 CONFIRM</span>
          </div>

          {/* Heading */}
          <div className="mb-12 pl-6" style={{ borderLeft: '4px solid #E01020' }}>
            <h1
              className="text-5xl md:text-6xl font-bold uppercase tracking-tighter mb-4 text-white"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Select Service
            </h1>
            <p className="text-lg max-w-2xl" style={{ color: '#888888' }}>
              Choose the service tier that matches your vehicle.
            </p>
          </div>

          {/* Service Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isSelected={selectedId === service.id}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: '#111111',
          borderTop: '1px solid #222222',
          position: 'sticky',
          bottom: 0,
          zIndex: 50,
          boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
        }}
      >
        <div
          className="w-full mx-auto p-4 md:p-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6"
          style={{ maxWidth: '1200px' }}
        >
          {/* Progress */}
          <div className="flex flex-col w-full md:w-auto">
            <span
              className="text-sm tracking-[0.2em] uppercase mb-3"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: '#888888' }}
            >
              Step 1 of 6
            </span>
            <div
              className="w-full md:w-64 relative"
              style={{
                height: '6px',
                backgroundColor: '#1a1a1a',
                border: '1px solid #222222',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: '16.66%',
                  backgroundColor: '#E01020',
                  boxShadow: '0 0 10px rgba(224,16,32,0.5)',
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            {/* Price readout */}
            {isSelected && (
              <div
                className="hidden md:flex flex-col text-right pr-6"
                style={{ borderRight: '1px solid #222222' }}
              >
                <span
                  className="text-[10px] tracking-widest uppercase mb-1"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: '#888888' }}
                >
                  Total Est.
                </span>
                <span
                  className="text-2xl font-bold text-white tracking-tighter leading-none"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  ${selectedPrice}.00
                </span>
              </div>
            )}

            {/* Continue button */}
            <button
              disabled={!isSelected}
              style={
                isSelected
                  ? {
                      backgroundColor: '#E01020',
                      border: '1px solid #E01020',
                      color: 'white',
                      boxShadow: '0 0 20px rgba(224,16,32,0.2)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }
                  : {
                      backgroundColor: '#222222',
                      border: '1px solid transparent',
                      color: '#888888',
                      cursor: 'not-allowed',
                      transition: 'all 0.2s ease',
                    }
              }
              className="w-full md:w-auto px-10 py-5 font-bold tracking-[0.15em] uppercase flex items-center justify-center gap-3"
              onMouseEnter={(e) => {
                if (isSelected) {
                  e.currentTarget.style.backgroundColor = '#ff1a2b';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(224,16,32,0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (isSelected) {
                  e.currentTarget.style.backgroundColor = '#E01020';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(224,16,32,0.2)';
                }
              }}
            >
              <span
                className="mt-0.5"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Continue
              </span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;