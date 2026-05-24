import React, { useState, useEffect, useRef } from 'react';

const customStyles = {
  root: {
    '--wn-primary': '#E01020',
    '--wn-primary-dim': 'rgba(224, 16, 32, 0.1)',
    '--bg-base': '#0a0a0a',
    '--bg-surface': '#111111',
    '--bg-surface-elevated': '#161616',
    '--border-subtle': '#222222',
    '--border-focus': '#444444',
    '--text-main': '#ffffff',
    '--text-muted': '#888888',
    '--text-dark': '#000000',
  }
};

const vehicleDB = {
  'Audi': ['A4', 'Q5', 'RS6', 'R8'],
  'BMW': ['3 Series', 'X5', 'M4', 'i4'],
  'Mazda': ['CX-5', 'Mazda3', 'MX-5', 'CX-90'],
  'Porsche': ['911', 'Taycan', 'Macan', 'Cayenne'],
  'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X']
};

const getMetadata = (make, model) => {
  const data = {
    'MX-5': { class: 'CONVERTIBLE', zones: '4 ZONES' },
    '911': { class: 'COUPE', zones: '5 ZONES' },
    'Model Y': { class: 'SUV', zones: '7 ZONES' },
    'RS6': { class: 'WAGON', zones: '7 ZONES' }
  };
  return data[model] || { class: 'SEDAN', zones: '5 ZONES' };
};

const App = () => {
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [trim, setTrim] = useState('');
  const [models, setModels] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewAnimated, setPreviewAnimated] = useState(false);
  const [scanBar, setScanBar] = useState(false);
  const previewRef = useRef(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700;800&display=swap');
      
      * { border-radius: 0 !important; }
      
      body {
        background-color: #0a0a0a;
        color: #ffffff;
        font-family: 'Inter', sans-serif;
        -webkit-font-smoothing: antialiased;
        margin: 0;
        padding: 0;
        min-height: 100vh;
      }

      .font-heading { font-family: 'JetBrains Mono', monospace; }
      .font-body { font-family: 'Inter', sans-serif; }

      .hide-scrollbar::-webkit-scrollbar { display: none; }
      .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

      .wn-select {
        appearance: none;
        background-color: #111111;
        border: 1px solid #222222;
        color: #ffffff;
        outline: none;
        transition: all 0.2s ease;
        width: 100%;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 1rem;
        cursor: pointer;
      }

      .wn-select:focus:not(:disabled) {
        border-color: #E01020;
        background-color: #161616;
      }

      .wn-select:disabled {
        opacity: 0.3;
        cursor: not-allowed;
        background-color: transparent;
      }

      .wn-select option {
        background-color: #111111;
        color: #ffffff;
      }

      .select-wrapper {
        position: relative;
      }

      .select-wrapper::after {
        content: '';
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        width: 10px;
        height: 6px;
        background-color: #888888;
        clip-path: polygon(100% 0%, 0 0%, 50% 100%);
        pointer-events: none;
        transition: background-color 0.2s;
      }

      .select-wrapper:focus-within::after {
        background-color: #E01020;
      }

      .select-wrapper[data-disabled="true"]::after {
        opacity: 0.3;
      }

      .bg-grid-pattern {
        background-image:
          linear-gradient(#222222 1px, transparent 1px),
          linear-gradient(90deg, #222222 1px, transparent 1px);
        background-size: 40px 40px;
        background-position: center center;
      }

      .preview-section {
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .preview-section.visible {
        opacity: 1;
        transform: translateY(0);
      }

      .inner-glow {
        box-shadow: inset 0 0 80px rgba(224, 16, 32, 0.03);
      }

      .tech-line {
        stroke: #888888;
        stroke-width: 1;
        fill: none;
      }
      .tech-line-accent {
        stroke: #E01020;
        stroke-width: 1.5;
        fill: none;
      }
      .tech-measure {
        stroke: #444444;
        stroke-width: 0.5;
        stroke-dasharray: 2 2;
      }

      .scan-bar {
        height: 100%;
        background-color: #E01020;
        width: 100%;
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 1s ease-out;
      }

      .scan-bar.active {
        transform: scaleX(1);
      }

      .continue-btn-active:hover {
        background-color: #ffffff;
        border-color: #ffffff;
      }

      .continue-btn-active:hover .btn-arrow {
        transform: translateX(4px);
      }

      .btn-arrow {
        transition: transform 0.2s ease;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleYearChange = (e) => {
    setYear(e.target.value);
    setMake('');
    setModel('');
    setTrim('');
    setModels([]);
    hidePreview();
  };

  const handleMakeChange = (e) => {
    const selectedMake = e.target.value;
    setMake(selectedMake);
    setModel('');
    setTrim('');
    setModels(vehicleDB[selectedMake] || []);
    hidePreview();
  };

  const handleModelChange = (e) => {
    const selectedModel = e.target.value;
    setModel(selectedModel);
    setTrim('');
    showPreview(selectedModel);
  };

  const handleTrimChange = (e) => {
    setTrim(e.target.value);
  };

  const showPreview = (selectedModel) => {
    setPreviewVisible(true);
    setScanBar(false);
    setTimeout(() => {
      setPreviewAnimated(true);
      setScanBar(true);
      if (previewRef.current) {
        setTimeout(() => {
          previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
      }
    }, 10);
  };

  const hidePreview = () => {
    setPreviewAnimated(false);
    setScanBar(false);
    setTimeout(() => {
      setPreviewVisible(false);
    }, 400);
  };

  const getPreviewTitle = () => {
    let title = '';
    if (year) title += year;
    if (make) title += ` ${make}`;
    if (model) title += ` ${model}`;
    if (trim) title += ` ${trim}`;
    return title || '--';
  };

  const meta = model ? getMetadata(make, model) : { class: 'COUPE', zones: '5 ZONES' };
  const isComplete = year && make && model;

  return (
    <div style={{ backgroundColor: '#0a0a0a', color: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '6rem' }}>

      {/* Nav Bar */}
      <div style={{ width: '100%', borderBottom: '1px solid #222222', backgroundColor: '#0a0a0a', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="hide-scrollbar" style={{ maxWidth: '64rem', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888888' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square">
              <path d="M20 6L9 17l-5-5"></path>
            </svg>
            <span>01 SERVICE</span>
          </div>
          <div style={{ color: '#222222' }}>/</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#E01020', fontWeight: 'bold' }}>
            <span style={{ width: '6px', height: '6px', backgroundColor: '#E01020', display: 'inline-block' }}></span>
            <span>02 VEHICLE</span>
          </div>
          <div style={{ color: '#222222' }}>/</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888888', opacity: 0.3 }}>
            <span>03 DATE &amp; TIME</span>
          </div>
          <div style={{ color: '#222222' }}>/</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888888', opacity: 0.3 }}>
            <span>04 YOUR INFO</span>
          </div>
          <div style={{ color: '#222222' }}>/</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888888', opacity: 0.3 }}>
            <span>05 PAYMENT</span>
          </div>
          <div style={{ color: '#222222' }}>/</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888888', opacity: 0.3 }}>
            <span>06 CONFIRM</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <main style={{ flexGrow: 1, width: '100%', maxWidth: '64rem', margin: '0 auto', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

        {/* Header */}
        <header style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h1 style={{ fontSize: '3rem', fontFamily: "'JetBrains Mono', monospace", fontWeight: 'bold', letterSpacing: '-0.025em', textTransform: 'uppercase', color: '#ffffff', margin: 0 }}>Your Vehicle</h1>
          <p style={{ color: '#888888', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", maxWidth: '42rem', margin: 0, lineHeight: '1.625' }}>
            We use this to render the exact silhouette for tint configuration.
          </p>
        </header>

        {/* Form Card */}
        <div style={{ backgroundColor: '#111111', border: '1px solid #222222', padding: '2rem', position: 'relative' }}>
          {/* Corner decorations */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '8px', height: '8px', borderTop: '1px solid #888888', borderLeft: '1px solid #888888' }}></div>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', borderTop: '1px solid #888888', borderRight: '1px solid #888888' }}></div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '8px', height: '8px', borderBottom: '1px solid #888888', borderLeft: '1px solid #888888' }}></div>
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', borderBottom: '1px solid #888888', borderRight: '1px solid #888888' }}></div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem 2rem' }}>

            {/* Year */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: '#888888', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Year</label>
              <div className="select-wrapper" data-disabled="false">
                <select className="wn-select" value={year} onChange={handleYearChange}>
                  <option value="" disabled>Select Year</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                  <option value="2019">2019</option>
                  <option value="2018">2018</option>
                </select>
              </div>
            </div>

            {/* Make */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: '#888888', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Make</label>
              <div className="select-wrapper" data-disabled={!year ? 'true' : 'false'}>
                <select className="wn-select" value={make} onChange={handleMakeChange} disabled={!year}>
                  <option value="" disabled>Select Make</option>
                  <option value="Audi">Audi</option>
                  <option value="BMW">BMW</option>
                  <option value="Mazda">Mazda</option>
                  <option value="Porsche">Porsche</option>
                  <option value="Tesla">Tesla</option>
                </select>
              </div>
            </div>

            {/* Model */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: '#888888', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Model</label>
              <div className="select-wrapper" data-disabled={!make ? 'true' : 'false'}>
                <select className="wn-select" value={model} onChange={handleModelChange} disabled={!make}>
                  <option value="" disabled>Select Model</option>
                  {models.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Trim */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <label style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: '#888888', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Trim</label>
                <span style={{ fontSize: '9px', fontFamily: "'JetBrains Mono', monospace", color: '#444444', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Optional</span>
              </div>
              <div className="select-wrapper" data-disabled={!model ? 'true' : 'false'}>
                <select className="wn-select" value={trim} onChange={handleTrimChange} disabled={!model}>
                  <option value="" disabled>Select Trim</option>
                  <option value="Base">Base</option>
                  <option value="Sport">Sport</option>
                  <option value="Grand Touring">Grand Touring</option>
                  <option value="Performance">Performance</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* Preview Section */}
        {previewVisible && (
          <div
            ref={previewRef}
            className={`preview-section${previewAnimated ? ' visible' : ''}`}
            style={{ display: 'flex', flexDirection: 'column', border: '1px solid #222222', backgroundColor: '#050505', position: 'relative', overflow: 'hidden', marginTop: '1rem' }}
          >
            {/* Target Badge */}
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', border: '1px solid #444444', backgroundColor: '#0a0a0a', padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 10 }}>
              <div style={{ width: '6px', height: '6px', backgroundColor: '#E01020', animation: 'pulse 2s infinite' }}></div>
              <span style={{ fontSize: '9px', fontFamily: "'JetBrains Mono', monospace", color: '#888888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Target Acquired</span>
            </div>

            {/* SVG Viewport */}
            <div className="bg-grid-pattern" style={{ width: '100%', height: '300px', borderBottom: '1px solid #222222', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '1px', backgroundColor: '#222222' }}></div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', backgroundColor: '#222222' }}></div>

              <div style={{ width: '100%', maxWidth: '800px', height: '100%', position: 'relative', zIndex: 10, padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 800 300" style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))' }}>
                  <line x1="100" y1="260" x2="700" y2="260" className="tech-measure"></line>
                  <line x1="100" y1="250" x2="100" y2="270" className="tech-measure"></line>
                  <line x1="700" y1="250" x2="700" y2="270" className="tech-measure"></line>
                  <text x="400" y="285" fill="#888888" fontFamily="'JetBrains Mono', monospace" fontSize="10" textAnchor="middle" letterSpacing="0.1em">WHEELBASE SENSOR CALIBRATION</text>

                  <line x1="50" y1="240" x2="750" y2="240" stroke="#444444" strokeWidth="1"></line>

                  <path d="M 140 200 L 140 180 L 160 160 L 230 145 L 320 100 L 450 90 L 520 100 L 620 140 L 680 155 L 710 180 L 710 200 Z" className="tech-line" style={{ opacity: 0.3, fill: 'rgba(255,255,255,0.02)' }}></path>

                  <path d="M 140 200 L 140 180 L 160 160 L 230 145" className="tech-line"></path>
                  <path d="M 620 140 L 680 155 L 710 180 L 710 200" className="tech-line"></path>

                  <path d="M 280 140 L 330 105 L 440 95 L 510 105 L 560 140 Z" className="tech-line-accent" style={{ fill: 'rgba(224, 16, 32, 0.05)' }}></path>

                  <line x1="360" y1="100" x2="350" y2="140" className="tech-line-accent"></line>
                  <line x1="470" y1="98" x2="490" y2="140" className="tech-line-accent"></line>
                  <line x1="280" y1="140" x2="560" y2="140" className="tech-line-accent"></line>

                  <circle cx="240" cy="200" r="35" className="tech-line"></circle>
                  <circle cx="240" cy="200" r="25" stroke="#222222" strokeWidth="1" fill="none"></circle>
                  <circle cx="240" cy="200" r="4" fill="#444444"></circle>

                  <circle cx="600" cy="200" r="35" className="tech-line"></circle>
                  <circle cx="600" cy="200" r="25" stroke="#222222" strokeWidth="1" fill="none"></circle>
                  <circle cx="600" cy="200" r="4" fill="#444444"></circle>

                  <path d="M 195 200 A 45 45 0 0 1 285 200" className="tech-line"></path>
                  <path d="M 555 200 A 45 45 0 0 1 645 200" className="tech-line"></path>

                  <polyline points="400,120 420,70 500,70" className="tech-measure"></polyline>
                  <text x="505" y="73" fill="#E01020" fontFamily="'JetBrains Mono', monospace" fontSize="10" letterSpacing="0.1em">TINT ZONE ANALYSIS ACTIVE</text>
                </svg>
              </div>
            </div>

            {/* Preview Info */}
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ fontSize: '2rem', fontFamily: "'JetBrains Mono', monospace", fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '-0.025em', margin: 0, color: '#ffffff', lineHeight: 1 }}>
                {getPreviewTitle()}
              </h2>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ border: '1px solid #222222', backgroundColor: '#0a0a0a', padding: '0.375rem 0.75rem', fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', color: '#888888', textTransform: 'uppercase' }}>
                  {meta.class}
                </div>
                <div style={{ border: '1px solid #444444', backgroundColor: '#161616', padding: '0.375rem 0.75rem', fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', color: '#ffffff', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '6px', height: '6px', backgroundColor: '#E01020', display: 'inline-block' }}></span>
                  {meta.zones}
                </div>
                <div style={{ fontSize: '9px', fontFamily: "'JetBrains Mono', monospace", color: '#444444', letterSpacing: '0.1em', textTransform: 'uppercase', marginLeft: 'auto' }}>
                  DATA SOURCE: NHTSA
                </div>
              </div>
            </div>

            {/* Scan Bar */}
            <div style={{ height: '4px', width: '100%', backgroundColor: '#222222', position: 'absolute', bottom: 0, left: 0 }}>
              <div className={`scan-bar${scanBar ? ' active' : ''}`}></div>
            </div>
          </div>
        )}

      </main>

      {/* Footer CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', borderTop: '1px solid #222222', backgroundColor: 'rgba(10, 10, 10, 0.94)', backdropFilter: 'blur(12px)', zIndex: 50 }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>

          <div style={{ flexDirection: 'column', gap: '0.5rem', display: 'flex' }}>
            <span style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: '#888888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>STEP 2 OF 6</span>
            <div style={{ width: '12rem', height: '4px', backgroundColor: '#161616', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', backgroundColor: '#E01020', width: '33.33%' }}></div>
            </div>
          </div>

          <button
            disabled={!isComplete}
            className={isComplete ? 'continue-btn-active' : ''}
            style={isComplete ? {
              position: 'relative',
              padding: '1rem 2rem',
              backgroundColor: '#E01020',
              border: '1px solid #E01020',
              color: '#000000',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.875rem',
              fontWeight: 'bold',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginLeft: 'auto',
              transition: 'all 0.3s ease',
              overflow: 'hidden'
            } : {
              position: 'relative',
              padding: '1rem 2rem',
              backgroundColor: 'transparent',
              border: '1px solid #222222',
              color: '#888888',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.875rem',
              fontWeight: 'bold',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginLeft: 'auto',
              opacity: 0.5
            }}
          >
            <span style={{ position: 'relative', zIndex: 10 }}>Continue</span>
            {isComplete && (
              <svg className="btn-arrow" style={{ position: 'relative', zIndex: 10, width: '1rem', height: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="square" strokeLinejoin="miter" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            )}
          </button>

        </div>
      </div>

    </div>
  );
};

export default App;