import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const customStyles = {
  glassPanel: {
    background: 'rgba(255, 179, 71, 0.03)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  glassPanelAmber: {
    background: 'rgba(255, 179, 71, 0.06)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 179, 71, 0.15)',
  },
  ambientGlow: {
    boxShadow: '0 0 40px rgba(255, 179, 71, 0.05)',
  },
};

const BookingsPage = () => {
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [activeView, setActiveView] = useState('Week');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [walkInModalOpen, setWalkInModalOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col relative antialiased text-sm overflow-hidden" style={{ backgroundColor: '#0D0B0A', color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center opacity-40">
        <svg width="100%" height="100%" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="smallGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5" />
            </pattern>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFB347" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#0D0B0A" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#smallGrid)" />
          <rect width="100%" height="100%" fill="url(#glow)" />
          <circle cx="720" cy="1100" r="800" stroke="#FFB347" strokeWidth="1" strokeOpacity="0.1" fill="none" strokeDasharray="4 12" />
          <circle cx="720" cy="1100" r="600" stroke="#FFB347" strokeWidth="2" strokeOpacity="0.05" fill="none" />
          <circle cx="720" cy="1100" r="400" stroke="#FFB347" strokeWidth="1" strokeOpacity="0.15" fill="none" />
        </svg>
      </div>

      {/* Footer watermark */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none text-[10px] text-white/30 tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        UPLINK_ESTABLISHED_
      </div>

      <div className="flex flex-1 h-full w-full relative z-10 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-[240px] flex flex-col justify-between z-20" style={{ ...customStyles.glassPanel, borderTop: 'none', borderLeft: 'none', borderBottom: 'none', backgroundColor: 'rgba(13, 11, 10, 0.8)' }}>
          <div>
            {/* Logo */}
            <div className="h-20 flex items-center px-6 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center border relative" style={{ borderColor: 'rgba(255,179,71,0.3)', background: 'rgba(255,179,71,0.1)' }}>
                  <div className="absolute w-1 h-1 top-0 left-0" style={{ backgroundColor: '#FFB347' }}></div>
                  <div className="absolute w-1 h-1 bottom-0 right-0" style={{ backgroundColor: '#FFB347' }}></div>
                  <svg className="w-4 h-4" style={{ color: '#FFB347' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-bold text-lg tracking-wide uppercase">BayReady</span>
              </div>
            </div>

            {/* Nav */}
            <nav className="mt-6 flex flex-col px-4 gap-1">
              <a href="#" className="flex items-center gap-3 px-4 py-3 border-l-2 font-medium transition-colors" style={{ backgroundColor: 'rgba(255,179,71,0.1)', borderLeftColor: '#FFB347', color: '#FFB347' }}>
                <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="0" ry="0" strokeLinecap="square" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Bookings
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 border-l-2 border-transparent text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Services
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 border-l-2 border-transparent text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M16 3.13a4 4 0 010 7.75" />
                </svg>
                Customers
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 border-l-2 border-transparent text-gray-400 hover:text-white hover:bg-white/5 transition-colors mt-4">
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="3" />
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
                Settings
              </a>
            </nav>
          </div>

          <div className="p-6">
            <div className="text-[10px] tracking-widest uppercase mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'rgba(255,179,71,0.4)' }}>
              SYS.CORE // ON-LINE
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <svg className="w-3 h-3" style={{ color: '#FFB347' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13.5h-13L12 6.5z" />
              </svg>
              Powered by <span style={{ color: '#FFB347' }}>BayReady</span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden" style={{ backgroundColor: 'rgba(13,11,10,0.6)', backdropFilter: 'blur(4px)' }}>

          {/* Alert Banner */}
          {!alertDismissed && (
            <div className="border-b flex justify-between items-center relative z-20 px-6 py-2.5" style={{ backgroundColor: 'rgba(255,179,71,0.1)', borderBottomColor: 'rgba(255,179,71,0.2)' }}>
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 animate-pulse" style={{ color: '#FFB347' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="text-sm">
                  <span className="font-bold tracking-wide uppercase mr-2" style={{ color: '#FFB347' }}>SYS_ALERT:</span>
                  <span className="text-gray-300">Push notifications are disabled. Enable to receive real-time uplink status for walk-ins.</span>
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setAlertDismissed(true)} className="text-xs uppercase font-medium tracking-wider text-gray-400 hover:text-white transition-colors">Dismiss</button>
                <button className="text-black px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-colors" style={{ backgroundColor: '#FFB347', boxShadow: '0 0 10px rgba(255,179,71,0.3)' }}>
                  Enable
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <header className="px-6 h-20 border-b flex justify-between items-center z-20 shrink-0" style={{ ...customStyles.glassPanel, borderLeft: 'none', borderRight: 'none', borderTop: 'none', borderBottomColor: 'rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs tracking-wider px-2 py-1 border" style={{ color: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)', fontFamily: "'JetBrains Mono', monospace" }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981' }}></div>
                CONNECTED ✓
              </div>
              <div className="h-8 w-px bg-white/[0.08]"></div>

              <div className="flex items-center gap-3">
                <button className="w-8 h-8 flex items-center justify-center border hover:bg-white/5 hover:border-white/20 transition-all text-gray-400 hover:text-white" style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#0D0B0A' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="square" strokeLinejoin="miter" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button className="px-5 h-8 flex items-center justify-center border hover:bg-white/5 hover:border-white/20 transition-all text-sm uppercase tracking-wider font-medium text-gray-300" style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#0D0B0A' }}>
                  Today
                </button>
                <button className="w-8 h-8 flex items-center justify-center border hover:bg-white/5 hover:border-white/20 transition-all text-gray-400 hover:text-white" style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#0D0B0A' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="square" strokeLinejoin="miter" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>

              <h2 className="text-xl font-medium tracking-tight text-white ml-2">October 23 — 29, 2023</h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex border p-0.5" style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#0D0B0A' }}>
                {['Week', 'Day'].map(v => (
                  <button
                    key={v}
                    onClick={() => setActiveView(v)}
                    className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors"
                    style={activeView === v ? { backgroundColor: '#ffffff', color: '#000000' } : { color: '#6b7280' }}
                  >
                    {v}
                  </button>
                ))}
              </div>

              <div className="relative group">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="appearance-none text-sm text-gray-300 px-4 py-2 pr-10 outline-none transition-colors cursor-pointer"
                  style={{ backgroundColor: '#0D0B0A', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <option>All Statuses</option>
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Completed</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="square" strokeLinejoin="miter" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              <button
                onClick={() => setWalkInModalOpen(true)}
                className="text-black px-5 h-9 text-sm font-bold uppercase tracking-wider rounded-full transition-colors flex items-center gap-2 ml-2"
                style={{ backgroundColor: '#FFB347', boxShadow: '0 0 15px rgba(255,179,71,0.2)' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="square" strokeLinejoin="miter" d="M12 4v16m8-8H4" /></svg>
                Walk-in
              </button>
            </div>
          </header>

          {/* Calendar Content */}
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col relative overflow-hidden" style={{ backgroundColor: 'rgba(13,11,10,0.4)' }}>

              {/* Day Headers */}
              <div className="grid border-b sticky top-0 z-30 shrink-0" style={{ gridTemplateColumns: '70px 1fr 1fr 1fr 1fr 1fr 1fr 1fr', borderBottomColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(13,11,10,0.9)', backdropFilter: 'blur(12px)' }}>
                <div className="p-3 text-gray-500 font-mono text-[10px] tracking-widest text-center border-r flex items-end justify-center pb-2" style={{ borderRightColor: 'rgba(255,255,255,0.08)' }}>
                  TIME
                </div>
                {[
                  { day: 'Mon', date: '23', active: true },
                  { day: 'Tue', date: '24', active: false },
                  { day: 'Wed', date: '25', active: false },
                  { day: 'Thu', date: '26', active: false },
                  { day: 'Fri', date: '27', active: false },
                  { day: 'Sat', date: '28', active: false, weekend: true },
                  { day: 'Sun', date: '29', active: false, weekend: true },
                ].map(({ day, date, active, weekend }) => (
                  <div key={day} className={`p-3 border-r text-center transition-colors cursor-default relative ${weekend ? 'bg-white/[0.02]' : ''}`} style={{ borderRightColor: 'rgba(255,255,255,0.08)' }}>
                    {active && <div className="absolute top-0 left-0 w-full h-0.5" style={{ backgroundColor: '#FFB347' }}></div>}
                    <div className={`text-[10px] font-mono uppercase tracking-widest mb-1 ${active ? '' : weekend ? 'text-gray-600' : 'text-gray-500'}`} style={active ? { color: '#FFB347' } : {}}>
                      {day}
                    </div>
                    <div className={`text-xl font-medium ${active ? 'text-white' : weekend ? 'text-gray-500' : 'text-gray-300'}`}>{date}</div>
                  </div>
                ))}
              </div>

              {/* Time Grid */}
              <div className="flex-1 overflow-y-auto relative pb-10" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="grid relative" style={{ gridTemplateColumns: '70px 1fr 1fr 1fr 1fr 1fr 1fr 1fr', minHeight: 'max-content' }}>

                  {/* Horizontal hour lines */}
                  <div className="absolute inset-0 pointer-events-none z-0 flex flex-col">
                    {[...Array(11)].map((_, i) => (
                      <div key={i} className="h-20 border-b" style={{ borderBottomColor: 'rgba(255,255,255,0.08)', borderBottomStyle: i === 5 ? 'dashed' : 'solid', opacity: i === 5 ? 0.5 : 1 }}></div>
                    ))}
                  </div>

                  {/* Time Labels */}
                  <div className="border-r z-10 sticky left-0 flex flex-col text-center" style={{ backgroundColor: 'rgba(13,11,10,0.8)', borderRightColor: 'rgba(255,255,255,0.08)', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#6b7280' }}>
                    {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((t, i) => (
                      <div key={t} className="h-20 flex items-start justify-center pt-2 relative">
                        <span className="px-1 relative" style={{ top: '-16px', backgroundColor: '#0D0B0A', color: (i === 4 || i === 5) ? 'rgba(255,255,255,0.4)' : undefined }}>{t}</span>
                      </div>
                    ))}
                  </div>

                  {/* Monday */}
                  <div className="border-r relative z-10" style={{ borderRightColor: 'rgba(255,255,255,0.08)', background: 'linear-gradient(rgba(255,179,71,0.02) 0%, transparent 10%)' }}>
                    {/* Current time indicator */}
                    <div className="absolute w-full h-px z-20 top-[200px] pointer-events-none" style={{ backgroundColor: '#FFB347', boxShadow: '0 0 8px #FFB347' }}>
                      <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#FFB347' }}></div>
                    </div>
                    {/* Full Service Tune-up */}
                    <div className="absolute left-1 right-1 top-[80px] h-[120px] p-2.5 z-20 cursor-pointer overflow-hidden flex flex-col group" style={{ ...customStyles.glassPanelAmber, borderLeft: '3px solid #FFB347' }}>
                      <div className="flex justify-between items-start mb-1">
                        <div className="text-[10px] tracking-wide" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#FFB347' }}>09:00 - 10:30</div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity border text-[9px] px-1.5 py-0.5 rounded-full font-mono uppercase tracking-widest shrink-0" style={{ backgroundColor: '#0D0B0A', borderColor: 'rgba(255,179,71,0.3)', color: '#FFB347' }}>Edit</div>
                      </div>
                      <div className="text-sm font-semibold text-white leading-tight mb-1 truncate">Full Service Tune-up</div>
                      <div className="text-xs text-gray-400 truncate">Marcus R. • Ducati V4</div>
                      <div className="mt-auto text-[10px] text-gray-500 font-mono flex items-center gap-1">
                        <div className="w-1 h-1 bg-gray-500"></div> Tech: Jax
                      </div>
                    </div>
                    {/* Custom Paint Consult */}
                    <div className="absolute left-1 right-1 top-[400px] h-[160px] p-2.5 z-20 cursor-pointer overflow-hidden flex flex-col group opacity-80" style={{ ...customStyles.glassPanel, borderLeft: '3px solid #4b5563', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <div className="flex justify-between items-start mb-1">
                        <div className="text-[10px] text-gray-400 tracking-wide" style={{ fontFamily: "'JetBrains Mono', monospace" }}>13:00 - 15:00</div>
                        <div className="w-2 h-2 rounded-full border border-gray-500"></div>
                      </div>
                      <div className="text-sm font-semibold text-gray-300 leading-tight mb-1">Custom Paint Consult</div>
                      <div className="text-xs text-gray-500 truncate">Sarah L.</div>
                      <div className="mt-2 text-[10px] font-mono uppercase tracking-widest border inline-block px-1 w-max" style={{ color: 'rgba(255,179,71,0.6)', borderColor: 'rgba(255,179,71,0.2)', backgroundColor: 'rgba(255,179,71,0.05)' }}>Awaiting Deposit</div>
                    </div>
                  </div>

                  {/* Tuesday */}
                  <div className="border-r relative z-10" style={{ borderRightColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="absolute left-1 right-1 top-[160px] h-[160px] p-2.5 z-20 cursor-pointer overflow-hidden flex flex-col group" style={{ ...customStyles.glassPanelAmber, borderLeft: '3px solid #FFB347' }}>
                      <div className="flex justify-between items-start mb-1">
                        <div className="text-[10px] tracking-wide" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#FFB347' }}>10:00 - 12:00</div>
                      </div>
                      <div className="text-sm font-semibold text-white leading-tight mb-1 truncate">Suspension Setup</div>
                      <div className="text-xs text-gray-400 truncate">David K. • MT-09</div>
                      <div className="mt-auto flex justify-between items-end">
                        <div className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                          <div className="w-1 h-1 bg-gray-500"></div> Tech: Mike
                        </div>
                        <svg className="w-3 h-3" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" /></svg>
                      </div>
                    </div>
                    <div className="absolute left-1 right-1 top-[600px] h-[120px] p-2.5 z-20 cursor-pointer overflow-hidden flex flex-col group opacity-80" style={{ ...customStyles.glassPanel, borderLeft: '3px solid #4b5563', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <div className="flex justify-between items-start mb-1">
                        <div className="text-[10px] text-gray-400 tracking-wide" style={{ fontFamily: "'JetBrains Mono', monospace" }}>15:30 - 17:00</div>
                      </div>
                      <div className="text-sm font-semibold text-gray-300 leading-tight mb-1">Tire Mount &amp; Balance</div>
                      <div className="text-xs text-gray-500 truncate">Walk-in</div>
                    </div>
                  </div>

                  {/* Wednesday */}
                  <div className="border-r relative z-10" style={{ borderRightColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="absolute left-1 right-1 top-[0px] h-[480px] p-2.5 z-20 cursor-pointer overflow-hidden flex flex-col group" style={{ ...customStyles.glassPanelAmber, borderLeft: '3px solid #FFB347' }}>
                      <div className="flex justify-between items-start mb-2 border-b pb-2" style={{ borderBottomColor: 'rgba(255,179,71,0.1)' }}>
                        <div className="text-[10px] tracking-wide" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#FFB347' }}>08:00 - 14:00</div>
                        <div className="text-[9px] px-1.5 py-0.5 rounded-full font-mono uppercase tracking-widest shrink-0 border" style={{ backgroundColor: 'rgba(255,179,71,0.2)', color: '#FFB347', borderColor: 'rgba(255,179,71,0.3)' }}>Major Service</div>
                      </div>
                      <div className="text-sm font-semibold text-white leading-tight mb-2">Engine Rebuild Phase 1</div>
                      <div className="text-xs text-gray-400 mb-4">Client: Tommy V.<br />Vehicle: HD Sportster 1200</div>
                      <div className="text-xs text-gray-500 mt-2">Notes:</div>
                      <div className="text-[11px] text-gray-400 mt-1 border-l-2 pl-2 opacity-70" style={{ fontFamily: "'JetBrains Mono', monospace", borderLeftColor: 'rgba(255,255,255,0.08)' }}>
                        Check primary chain tension.<br />Replace gaskets kit B.
                      </div>
                      <div className="mt-auto text-[10px] text-gray-500 font-mono flex items-center gap-1">
                        <div className="w-1 h-1" style={{ backgroundColor: '#FFB347' }}></div> Tech: Jax (Lead)
                      </div>
                    </div>
                  </div>

                  {/* Thursday */}
                  <div className="border-r relative z-10" style={{ borderRightColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="absolute left-1 right-1 top-[480px] h-[80px] p-2 z-20 cursor-pointer overflow-hidden flex flex-col group" style={{ ...customStyles.glassPanelAmber, borderLeft: '3px solid #FFB347' }}>
                      <div className="flex justify-between items-center mb-0.5">
                        <div className="text-[10px] tracking-wide" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#FFB347' }}>14:00 - 15:00</div>
                      </div>
                      <div className="text-sm font-semibold text-white truncate">Oil Change</div>
                      <div className="text-[10px] text-gray-400 truncate">Elena M.</div>
                    </div>
                  </div>

                  {/* Friday */}
                  <div className="border-r relative z-10" style={{ borderRightColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="absolute left-1 right-1 top-[80px] h-[80px] p-2 z-20 cursor-pointer overflow-hidden flex flex-col group opacity-80" style={{ ...customStyles.glassPanel, borderLeft: '3px solid #4b5563', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <div className="text-[10px] text-gray-400 tracking-wide mb-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>09:00 - 10:00</div>
                      <div className="text-sm font-semibold text-gray-300 truncate">Diagnostics</div>
                    </div>
                    <div className="absolute left-1 right-1 top-[240px] h-[160px] p-2.5 z-20 cursor-pointer overflow-hidden flex flex-col group" style={{ ...customStyles.glassPanelAmber, borderLeft: '3px solid #FFB347' }}>
                      <div className="text-[10px] tracking-wide mb-1" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#FFB347' }}>11:00 - 13:00</div>
                      <div className="text-sm font-semibold text-white truncate">Dyno Tuning</div>
                      <div className="text-xs text-gray-400 mt-1">Chris B.</div>
                    </div>
                  </div>

                  {/* Saturday */}
                  <div className="border-r relative z-10" style={{ borderRightColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                  </div>

                  {/* Sunday */}
                  <div className="relative z-10" style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                      <span className="font-mono text-4xl uppercase" style={{ writingMode: 'vertical-rl', letterSpacing: '20px' }}>Closed</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <aside className="w-[320px] flex flex-col z-20 shrink-0 border-l" style={{ ...customStyles.glassPanel, borderTop: 'none', borderBottom: 'none', borderRight: 'none', borderLeftColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(13,11,10,0.8)' }}>
              <div className="p-6 border-b shrink-0" style={{ borderBottomColor: 'rgba(255,255,255,0.08)' }}>
                <h3 className="text-xs text-gray-400 uppercase tracking-widest flex justify-between items-center" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  Weekly Uplink Stats
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 opacity-80" style={{ backgroundColor: '#FFB347' }}></span>
                    <span className="w-1.5 h-1.5 opacity-40" style={{ backgroundColor: '#FFB347' }}></span>
                    <span className="w-1.5 h-1.5 opacity-20" style={{ backgroundColor: '#FFB347' }}></span>
                  </div>
                </h3>
              </div>

              <div className="p-6 flex-1 flex flex-col gap-5 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {/* Revenue Booked */}
                <div className="p-5 relative overflow-hidden group hover:bg-white/5 transition-colors" style={customStyles.glassPanel}>
                  <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none" style={{ background: 'linear-gradient(to bottom left, rgba(255,179,71,0.2), transparent)' }}></div>
                  <div className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-medium">Revenue Booked</div>
                  <div className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#FFB347' }}>
                    $12,450<span className="text-lg" style={{ color: 'rgba(255,179,71,0.5)' }}>.00</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs font-mono flex items-center gap-1 px-2 py-1 border" style={{ color: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)' }}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="square" strokeLinejoin="miter" d="M5 15l7-7 7 7" /></svg>
                      14.2%
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase">vs last week</span>
                  </div>
                </div>

                {/* Revenue Completed */}
                <div className="p-5 relative overflow-hidden group hover:bg-white/5 transition-colors" style={customStyles.glassPanel}>
                  <div className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-medium">Revenue Completed</div>
                  <div className="text-3xl tracking-tight" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#ffffff' }}>
                    $4,820<span className="text-lg" style={{ color: 'rgba(255,255,255,0.4)' }}>.50</span>
                  </div>
                  <div className="mt-4 w-full h-1.5 relative border" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="absolute top-0 left-0 h-full" style={{ width: '38%', backgroundColor: '#FFB347', boxShadow: '0 0 8px rgba(255,179,71,0.5)' }}></div>
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-gray-500 flex justify-between">
                    <span>Current</span>
                    <span>Goal: $15k</span>
                  </div>
                </div>

                {/* Bookings & Completion */}
                <div className="flex gap-5">
                  <div className="p-4 flex-1 flex flex-col justify-center items-center text-center relative overflow-hidden group hover:bg-white/5 transition-colors" style={customStyles.glassPanel}>
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Bookings</div>
                    <div className="text-2xl" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#ffffff' }}>42</div>
                    <div className="absolute bottom-0 left-0 w-full h-0.5 group-hover:bg-amber/50 transition-colors" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}></div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-center items-center text-center relative overflow-hidden group hover:bg-white/5 transition-colors" style={customStyles.glassPanel}>
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Completion</div>
                    <div className="text-2xl" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#ffffff' }}>88%</div>
                    <div className="absolute bottom-0 left-0 w-full h-0.5 transition-colors" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}></div>
                  </div>
                </div>

                {/* Recent Uplinks */}
                <div className="mt-4">
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3 border-b pb-2" style={{ borderBottomColor: 'rgba(255,255,255,0.08)' }}>Recent Uplinks</div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 mt-1.5 shrink-0" style={{ backgroundColor: '#10B981' }}></div>
                      <div>
                        <div className="text-xs text-gray-300">Payment received: <span className="font-mono text-white">$450</span></div>
                        <div className="text-[10px] font-mono text-gray-500 mt-0.5">12 mins ago • Engine Rebuild</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 mt-1.5 shrink-0" style={{ backgroundColor: '#FFB347' }}></div>
                      <div>
                        <div className="text-xs text-gray-300">New booking added</div>
                        <div className="text-[10px] font-mono text-gray-500 mt-0.5">45 mins ago • Walk-in</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer decoration */}
                <div className="mt-auto pt-6 opacity-30">
                  <div className="w-full flex justify-between items-center border-t pt-4" style={{ borderTopColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="flex gap-1">
                      <div className="w-2 h-0.5 bg-white"></div>
                      <div className="w-1 h-0.5 bg-white"></div>
                      <div className="w-4 h-0.5 bg-white"></div>
                    </div>
                    <div className="font-mono text-[9px] tracking-widest">DATA.STREAM.ACTIVE</div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>

      {/* Walk-in Modal */}
      {walkInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-[480px] p-8 relative" style={{ ...customStyles.glassPanel, backgroundColor: '#0D0B0A' }}>
            <div className="absolute top-0 left-0 w-full h-0.5" style={{ backgroundColor: '#FFB347' }}></div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold uppercase tracking-wider" style={{ color: '#FFB347' }}>New Walk-in</h2>
              <button onClick={() => setWalkInModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Customer Name', placeholder: 'Enter customer name' },
                { label: 'Vehicle', placeholder: 'Make / Model / Year' },
                { label: 'Service', placeholder: 'Service type' },
              ].map(({ label, placeholder }) => (
                <div key={label}>
                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mb-1">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 text-sm text-white outline-none transition-colors"
                    style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onFocus={e => { e.target.style.borderColor = '#FFB347'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  />
                </div>
              ))}
              <div>
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mb-1">Technician</label>
                <select className="w-full px-4 py-2.5 text-sm text-white outline-none appearance-none" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <option value="">Assign technician</option>
                  <option>Jax</option>
                  <option>Mike</option>
                </select>
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setWalkInModalOpen(false)} className="flex-1 py-2.5 text-sm font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  Cancel
                </button>
                <button onClick={() => setWalkInModalOpen(false)} className="flex-1 py-2.5 text-sm font-bold uppercase tracking-wider text-black rounded-full transition-colors" style={{ backgroundColor: '#FFB347', boxShadow: '0 0 15px rgba(255,179,71,0.3)' }}>
                  Add Walk-in
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
      * { box-sizing: border-box; }
      body { margin: 0; padding: 0; overflow: hidden; }
      ::selection { background-color: #FFB347; color: #000; }
      ::-webkit-scrollbar { width: 4px; height: 4px; }
      ::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-left: 1px solid rgba(255,255,255,0.05); }
      ::-webkit-scrollbar-thumb { background: rgba(255,179,71,0.3); }
      ::-webkit-scrollbar-thumb:hover { background: rgba(255,179,71,0.6); }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <Router basename="/">
      <Routes>
        <Route path="/" element={<BookingsPage />} />
      </Routes>
    </Router>
  );
};

export default App;