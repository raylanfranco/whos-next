import React, { useState, useEffect, useCallback } from 'react';

const ZONES = {
  windshield: { label: 'Windshield', shortId: 'WS', price: 150, match: null, legalMin: 70 },
  sunroof: { label: 'Sunroof', shortId: 'SR', price: 50, match: null, legalMin: 0 },
  fl: { label: 'Front Driver', shortId: 'FL', price: 60, match: 'fr', legalMin: 35 },
  fr: { label: 'Front Pass.', shortId: 'FR', price: 60, match: 'fl', legalMin: 35 },
  rl: { label: 'Rear Driver', shortId: 'RL', price: 60, match: 'rr', legalMin: 0 },
  rr: { label: 'Rear Pass.', shortId: 'RR', price: 60, match: 'rl', legalMin: 0 },
  rear: { label: 'Rear Hatch', shortId: 'RE', price: 120, match: null, legalMin: 0 },
};

const SHADES = [
  { val: 70, name: 'Clear', desc: 'UV Only' },
  { val: 50, name: 'Light', desc: 'Subtle' },
  { val: 35, name: 'Medium', desc: 'Balanced' },
  { val: 20, name: 'Dark', desc: 'Privacy' },
  { val: 5, name: 'Limo', desc: 'Max Block' },
];

const App = () => {
  const [selected, setSelected] = useState(null);
  const [config, setConfig] = useState({});
  const [syncSymmetry, setSyncSymmetry] = useState(true);
  const [hoveredZone, setHoveredZone] = useState(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
      :root {
        --brand-red: #ff2a2a;
        --brand-red-dim: rgba(255, 42, 42, 0.15);
        --brand-red-glow: rgba(255, 42, 42, 0.4);
        --bg-base: #030303;
        --bg-panel: #0a0a0c;
        --bg-panel-elevated: #121215;
        --border-subtle: #222225;
        --border-focus: #44444a;
        --text-main: #f4f4f5;
        --text-muted: #a1a1aa;
        --font-display: 'Space Grotesk', sans-serif;
        --font-mono: 'JetBrains Mono', monospace;
      }
      body { margin: 0; padding: 0; background-color: #030303; overflow: hidden; }
      * { box-sizing: border-box; }
      .font-mono-custom { font-family: 'JetBrains Mono', monospace; }
      .font-display-custom { font-family: 'Space Grotesk', sans-serif; }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #44444a; border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: #a1a1aa; }
      .dot-matrix {
        background-image: radial-gradient(#44444a 1px, transparent 1px);
        background-size: 24px 24px;
      }
      .scanline {
        position: absolute;
        top: 0; left: 0; right: 0; height: 100%;
        background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.25) 51%);
        background-size: 100% 4px;
        pointer-events: none;
        z-index: 10;
        opacity: 0.3;
      }
      .svg-container { filter: drop-shadow(0 0 30px rgba(0,0,0,0.8)); }
      .zone-poly {
        fill: rgba(0,0,0,0.5);
        stroke: #44444a;
        stroke-width: 1;
        transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
        cursor: crosshair;
      }
      .zone-poly-hovered {
        stroke: #a1a1aa;
        fill: rgba(255,255,255,0.05);
      }
      .zone-poly-active {
        stroke: #ff2a2a;
        stroke-width: 2;
        filter: drop-shadow(0 0 8px rgba(255,42,42,0.4));
      }
      .zone-label {
        font-family: 'JetBrains Mono', monospace;
        font-size: 20px;
        font-weight: 800;
        fill: #fff;
        text-anchor: middle;
        dominant-baseline: middle;
        pointer-events: none;
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
      }
      .zone-label-visible {
        opacity: 1;
      }
      @keyframes pulse-glow {
        0% { box-shadow: 0 0 0 0 rgba(255,42,42,0.4); }
        70% { box-shadow: 0 0 0 10px rgba(255,42,42,0); }
        100% { box-shadow: 0 0 0 0 rgba(255,42,42,0); }
      }
      .pulse-glow-anim { animation: pulse-glow 2s infinite; }
      @keyframes pulse-dot {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
      .animate-pulse-dot { animation: pulse-dot 2s infinite; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const selectZone = useCallback((id) => {
    setSelected(id);
  }, []);

  const setShade = useCallback((val) => {
    if (!selected) return;
    setConfig(prev => {
      const next = { ...prev, [selected]: val };
      const def = ZONES[selected];
      if (syncSymmetry && def.match) {
        next[def.match] = val;
      }
      return next;
    });
  }, [selected, syncSymmetry]);

  const handleSyncChange = (e) => {
    const checked = e.target.checked;
    setSyncSymmetry(checked);
    if (checked && selected) {
      const def = ZONES[selected];
      if (def.match && config[selected]) {
        setConfig(prev => ({ ...prev, [def.match]: prev[selected] }));
      }
    }
  };

  const total = Object.entries(config).reduce((sum, [id, val]) => {
    if (val) return sum + ZONES[id].price;
    return sum;
  }, 0);

  const count = Object.values(config).filter(Boolean).length;

  const getZonePolyClass = (id) => {
    const isActive = id === selected;
    const isHovered = id === hoveredZone;
    if (isActive) return 'zone-poly zone-poly-active';
    if (isHovered) return 'zone-poly zone-poly-hovered';
    return 'zone-poly';
  };

  const getZonePolyStyle = (id) => {
    const val = config[id];
    if (val) {
      const darkness = 1 - (val / 100);
      return { fill: `rgba(255, 42, 42, ${Math.max(darkness * 0.8, 0.2)})` };
    }
    return {};
  };

  const getLabelClass = (id) => {
    const val = config[id];
    return val ? 'zone-label zone-label-visible' : 'zone-label';
  };

  const def = selected ? ZONES[selected] : null;
  const currentVal = selected ? config[selected] : null;

  return (
    <div
      className="font-display-custom"
      style={{
        backgroundColor: '#030303',
        color: '#f4f4f5',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div style={{ width: '100%', maxWidth: '1440px', height: '90vh', minHeight: '700px', display: 'flex', gap: '24px', padding: '24px' }}>

        {/* Left Panel - Build Status */}
        <div style={{ width: '320px', backgroundColor: '#0a0a0c', borderRadius: '16px', border: '1px solid #222225', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)', flexShrink: 0 }}>
          {/* Header */}
          <div style={{ padding: '24px', borderBottom: '1px solid #222225', backgroundColor: '#121215' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <div className="animate-pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff2a2a' }}></div>
              <span className="font-mono-custom" style={{ fontSize: '10px', color: '#ff2a2a', letterSpacing: '0.2em', textTransform: 'uppercase' }}>System Active</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.025em', textTransform: 'uppercase', margin: 0 }}>Build Status</h1>
          </div>

          {/* Summary List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {Object.entries(ZONES).map(([id, zone]) => {
              const val = config[id];
              const isSel = id === selected;
              return (
                <div
                  key={id}
                  onClick={() => selectZone(id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    marginBottom: '12px',
                    borderRadius: '12px',
                    border: isSel ? '1px solid #ff2a2a' : '1px solid #222225',
                    backgroundColor: isSel ? '#0a0a0c' : '#030303',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: isSel ? '#ff2a2a' : '#f4f4f5', transition: 'color 0.2s' }}>{zone.label}</span>
                    <span className="font-mono-custom" style={{ fontSize: '10px', color: '#a1a1aa', marginTop: '4px' }}>+${zone.price}</span>
                  </div>
                  {val ? (
                    <div style={{
                      backgroundColor: '#121215',
                      border: isSel ? '1px solid #ff2a2a' : '1px solid #44444a',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      <span className="font-mono-custom" style={{ fontWeight: 700, color: '#f4f4f5' }}>{val}</span>
                      <span style={{ fontSize: '10px', color: '#a1a1aa' }}>%</span>
                    </div>
                  ) : (
                    <span className="font-mono-custom" style={{ fontSize: '10px', color: '#a1a1aa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Unset</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ padding: '24px', borderTop: '1px solid #222225', backgroundColor: '#050505' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
              <span className="font-mono-custom" style={{ fontSize: '14px', color: '#a1a1aa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Est. Total</span>
              <span className="font-mono-custom" style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-0.05em' }}>${total}</span>
            </div>
            <button
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: count > 0 ? '#ff2a2a' : '#121215',
                border: count > 0 ? '1px solid #ff2a2a' : '1px solid #44444a',
                color: '#fff',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                transition: 'all 0.3s',
                opacity: count > 0 ? 1 : 0.5,
                cursor: count > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: '8px',
              }}
              disabled={count === 0}
            >
              <span>Initialize Build</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Center Panel - Car Diagram */}
        <div style={{ flex: 1, backgroundColor: '#0a0a0c', borderRadius: '16px', border: '1px solid #222225', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)' }}>
          {/* Top Label */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20, pointerEvents: 'none' }}>
            <div className="font-mono-custom" style={{ fontSize: '10px', color: '#a1a1aa', letterSpacing: '0.3em', textTransform: 'uppercase' }}>Top-Down Sensor View</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <div style={{ width: '4px', height: '16px', backgroundColor: '#44444a' }}></div>
              <div style={{ width: '4px', height: '16px', backgroundColor: '#44444a' }}></div>
              <div style={{ width: '4px', height: '16px', backgroundColor: '#ff2a2a' }}></div>
            </div>
          </div>

          {/* Dot Matrix + SVG */}
          <div className="dot-matrix" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="scanline"></div>
            <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '1px', backgroundColor: '#222225', pointerEvents: 'none' }}></div>
            <div style={{ position: 'absolute', left: '50%', top: 0, width: '1px', height: '100%', backgroundColor: '#222225', pointerEvents: 'none' }}></div>

            <svg viewBox="0 0 400 600" className="svg-container" style={{ width: '100%', maxWidth: '500px', height: '85%', zIndex: 10 }} preserveAspectRatio="xMidYMid meet">
              {/* Car outline */}
              <path style={{ stroke: '#333', strokeWidth: 1.5, fill: '#050505', transition: 'stroke 0.3s ease' }} d="M 140 50 L 260 50 L 290 120 L 300 250 L 300 400 L 280 520 L 260 550 L 140 550 L 120 520 L 100 400 L 100 250 L 110 120 Z" />
              <path d="M 140 50 L 145 130 M 260 50 L 255 130 M 120 520 L 130 500 M 280 520 L 270 500" stroke="#44444a" strokeWidth="1" strokeDasharray="4 4" fill="none" />

              {/* Windshield */}
              <g style={{ cursor: 'crosshair' }} onClick={() => selectZone('windshield')} onMouseEnter={() => setHoveredZone('windshield')} onMouseLeave={() => setHoveredZone(null)}>
                <polygon className={getZonePolyClass('windshield')} style={getZonePolyStyle('windshield')} points="145,130 255,130 275,210 125,210" />
                <text className={getLabelClass('windshield')} x="200" y="175">{config['windshield']}%</text>
              </g>

              {/* Sunroof */}
              <g style={{ cursor: 'crosshair' }} onClick={() => selectZone('sunroof')} onMouseEnter={() => setHoveredZone('sunroof')} onMouseLeave={() => setHoveredZone(null)}>
                <polygon className={getZonePolyClass('sunroof')} style={getZonePolyStyle('sunroof')} points="160,240 240,240 240,310 160,310" />
                <text className={getLabelClass('sunroof')} x="200" y="280">{config['sunroof']}%</text>
              </g>

              {/* Front Left */}
              <g style={{ cursor: 'crosshair' }} onClick={() => selectZone('fl')} onMouseEnter={() => setHoveredZone('fl')} onMouseLeave={() => setHoveredZone(null)}>
                <polygon className={getZonePolyClass('fl')} style={getZonePolyStyle('fl')} points="115,225 140,225 140,320 105,320" />
                <text className={getLabelClass('fl')} x="122" y="275" style={{ fontSize: '16px' }}>{config['fl']}%</text>
              </g>

              {/* Front Right */}
              <g style={{ cursor: 'crosshair' }} onClick={() => selectZone('fr')} onMouseEnter={() => setHoveredZone('fr')} onMouseLeave={() => setHoveredZone(null)}>
                <polygon className={getZonePolyClass('fr')} style={getZonePolyStyle('fr')} points="260,225 285,225 295,320 260,320" />
                <text className={getLabelClass('fr')} x="278" y="275" style={{ fontSize: '16px' }}>{config['fr']}%</text>
              </g>

              {/* Rear Left */}
              <g style={{ cursor: 'crosshair' }} onClick={() => selectZone('rl')} onMouseEnter={() => setHoveredZone('rl')} onMouseLeave={() => setHoveredZone(null)}>
                <polygon className={getZonePolyClass('rl')} style={getZonePolyStyle('rl')} points="105,330 140,330 140,420 115,420" />
                <text className={getLabelClass('rl')} x="122" y="375" style={{ fontSize: '16px' }}>{config['rl']}%</text>
              </g>

              {/* Rear Right */}
              <g style={{ cursor: 'crosshair' }} onClick={() => selectZone('rr')} onMouseEnter={() => setHoveredZone('rr')} onMouseLeave={() => setHoveredZone(null)}>
                <polygon className={getZonePolyClass('rr')} style={getZonePolyStyle('rr')} points="260,330 295,330 285,420 260,420" />
                <text className={getLabelClass('rr')} x="278" y="375" style={{ fontSize: '16px' }}>{config['rr']}%</text>
              </g>

              {/* Rear */}
              <g style={{ cursor: 'crosshair' }} onClick={() => selectZone('rear')} onMouseEnter={() => setHoveredZone('rear')} onMouseLeave={() => setHoveredZone(null)}>
                <polygon className={getZonePolyClass('rear')} style={getZonePolyStyle('rear')} points="145,440 255,440 270,500 130,500" />
                <text className={getLabelClass('rear')} x="200" y="475">{config['rear']}%</text>
              </g>
            </svg>
          </div>

          {/* Bottom coords */}
          <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
            <div className="font-mono-custom" style={{ fontSize: '10px', color: '#44444a' }}>COORD: X.492 Y.110</div>
            <div className="font-mono-custom" style={{ fontSize: '10px', color: '#44444a' }}>SCALE: 1:20</div>
          </div>
        </div>

        {/* Right Panel - Config */}
        <div style={{ width: '380px', backgroundColor: '#0a0a0c', borderRadius: '16px', border: '1px solid #222225', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)', flexShrink: 0, position: 'relative' }}>

          {/* Idle State */}
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '32px', textAlign: 'center', backgroundColor: '#0a0a0c', zIndex: 20,
            transition: 'opacity 0.3s',
            opacity: selected ? 0 : 1,
            pointerEvents: selected ? 'none' : 'auto',
          }}>
            <div style={{ width: '64px', height: '64px', border: '1px solid #44444a', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', backgroundColor: '#121215', position: 'relative', overflow: 'hidden' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
              </svg>
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '20px', marginBottom: '8px', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>Awaiting Selection</h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px', margin: 0 }}>Select a window segment from the diagram to configure tint properties.</p>
          </div>

          {/* Active State */}
          <div style={{
            display: 'flex', flexDirection: 'column', height: '100%',
            transition: 'opacity 0.3s', opacity: selected ? 1 : 0,
            pointerEvents: selected ? 'auto' : 'none',
            zIndex: 10,
          }}>
            {/* Active Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid #222225', backgroundColor: '#121215', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-16px', top: '-16px', fontSize: '120px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#222225', opacity: 0.2, pointerEvents: 'none', userSelect: 'none', lineHeight: 1 }}>
                {def ? def.shortId : ''}
              </div>
              <div style={{ position: 'relative', zIndex: 10 }}>
                <span className="font-mono-custom" style={{ fontSize: '10px', color: '#ff2a2a', letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Target Acquired</span>
                <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.025em', textTransform: 'uppercase', margin: 0, lineHeight: 1.2 }}>{def ? def.label : ''}</h2>
                <div className="font-mono-custom" style={{ color: '#a1a1aa', fontSize: '14px', marginTop: '4px' }}>{def ? `+$${def.price}.00` : ''}</div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Sync Symmetry */}
              {def && def.match && (
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', border: '1px solid #222225', backgroundColor: '#030303', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Sync Symmetry</span>
                    <span style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '2px' }}>Apply same tint to opposite side</span>
                  </div>
                  <input type="checkbox" checked={syncSymmetry} onChange={handleSyncChange} style={{ display: 'none' }} />
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '6px',
                    border: syncSymmetry ? '1px solid #ff2a2a' : '1px solid #44444a',
                    backgroundColor: syncSymmetry ? '#ff2a2a' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}>
                    {syncSymmetry && (
                      <svg style={{ width: '14px', height: '14px', color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </label>
              )}

              {/* Warning */}
              {def && currentVal && currentVal < def.legalMin && (
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <div style={{ fontSize: '12px', color: 'rgb(254,215,170)', lineHeight: 1.6 }}>
                    Warning: {currentVal}% is below the legal limit ({def.legalMin}%) for this window location. Off-road use only.
                  </div>
                </div>
              )}

              {/* Shade Grid */}
              <div>
                <div className="font-mono-custom" style={{ fontSize: '10px', color: '#a1a1aa', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>VLT% Properties</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {SHADES.map(shade => {
                    const isSel = currentVal === shade.val;
                    const darkness = 1 - (shade.val / 100);
                    const visualBg = `rgba(0,0,0,${darkness})`;
                    return (
                      <button
                        key={shade.val}
                        onClick={() => setShade(shade.val)}
                        className={isSel ? 'pulse-glow-anim' : ''}
                        style={{
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          padding: '16px',
                          borderRadius: '12px',
                          border: isSel ? '1px solid #ff2a2a' : '1px solid #222225',
                          backgroundColor: isSel ? '#121215' : '#030303',
                          textAlign: 'left',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: visualBg, opacity: 0.2, zIndex: 0, transition: 'opacity 0.2s' }}></div>
                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                            <span className="font-mono-custom" style={{ fontSize: '30px', fontWeight: 700, color: isSel ? '#f4f4f5' : '#a1a1aa' }}>{shade.val}</span>
                            <span className="font-mono-custom" style={{ fontSize: '14px', color: '#44444a' }}>%</span>
                          </div>
                          {isSel && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff2a2a' }}></div>}
                        </div>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px', color: '#f4f4f5' }}>{shade.name}</div>
                          <div className="font-mono-custom" style={{ fontSize: '10px', color: '#a1a1aa', textTransform: 'uppercase' }}>{shade.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;