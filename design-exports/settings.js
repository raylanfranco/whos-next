import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const customStyles = {
  bgAmbient: {
    backgroundColor: '#0D0B0A',
    backgroundImage: `
      radial-gradient(100% 100% at 50% 0%, rgba(255, 179, 71, 0.04) 0%, transparent 50%),
      radial-gradient(100% 100% at 100% 100%, rgba(255, 179, 71, 0.03) 0%, transparent 60%)
    `,
    backgroundAttachment: 'fixed',
  },
  rangeInput: {
    WebkitAppearance: 'none',
    width: '100%',
    background: 'transparent',
  },
};

const Sidebar = ({ activeNav, setActiveNav }) => {
  const navItems = [
    { id: 'bookings', icon: 'ph ph-calendar-blank', label: 'BOOKINGS' },
    { id: 'services', icon: 'ph ph-wrench', label: 'SERVICES' },
    { id: 'customers', icon: 'ph ph-users', label: 'CUSTOMERS' },
    { id: 'settings', icon: 'ph-fill ph-gear', label: 'SETTINGS', active: true },
  ];

  return (
    <aside className="w-64 h-full border-r flex flex-col relative z-10 backdrop-blur-md" style={{ borderColor: 'rgba(255, 179, 71, 0.15)', backgroundColor: 'rgba(13, 11, 10, 0.8)' }}>
      <div className="h-20 flex items-center px-6 border-b" style={{ borderColor: 'rgba(255, 179, 71, 0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center font-bold text-black font-sans text-xl" style={{ backgroundColor: '#FFB347' }}>B</div>
          <span className="font-sans font-bold tracking-wide text-lg text-white">BayReady</span>
        </div>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
        {navItems.map((item) => {
          const isActive = item.id === 'settings';
          return (
            <a
              key={item.id}
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveNav(item.id); }}
              className={`flex items-center gap-3 px-3 py-2 transition-colors group relative ${
                isActive
                  ? 'text-white border-l-2'
                  : 'text-gray-400 hover:text-white hover:bg-[rgba(255,179,71,0.05)]'
              }`}
              style={isActive ? { backgroundColor: 'rgba(255, 179, 71, 0.05)', borderLeftColor: '#FFB347' } : {}}
            >
              <i className={`${item.icon} text-xl ${isActive ? 'text-[#FFB347]' : 'group-hover:text-[#FFB347]'} transition-colors`}></i>
              <span className={`font-sans text-sm tracking-wide ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
              {isActive && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 animate-pulse" style={{ backgroundColor: '#FFB347' }}></div>
              )}
            </a>
          );
        })}
      </nav>

      <div className="p-6 border-t" style={{ borderColor: 'rgba(255, 179, 71, 0.15)' }}>
        <div className="flex items-center gap-2">
          <i className="ph-fill ph-lightning" style={{ color: '#FFB347' }}></i>
          <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'rgba(255, 179, 71, 0.8)' }}>Powered by BayReady</span>
        </div>
        <div className="text-[9px] font-mono text-gray-600 mt-2 uppercase">v.2.4.1_b</div>
      </div>
    </aside>
  );
};

const TechBrackets = () => (
  <>
    <div
      className="absolute top-0 left-0 w-2.5 h-2.5 opacity-50"
      style={{
        backgroundColor: '#FFB347',
        clipPath: 'polygon(0 0, 10px 0, 10px 2px, 2px 2px, 2px 10px, 0 10px)',
      }}
    ></div>
    <div
      className="absolute bottom-0 right-0 w-2.5 h-2.5 opacity-50"
      style={{
        backgroundColor: '#FFB347',
        clipPath: 'polygon(10px 10px, 0 10px, 0 8px, 8px 8px, 8px 0, 10px 0)',
      }}
    ></div>
  </>
);

const BusinessProfileCard = () => {
  const [shopName, setShopName] = useState('Iron & Oil Moto');
  const [timezone, setTimezone] = useState('PST');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <section
      className="border p-6 relative group transition-colors backdrop-blur-md"
      style={{ backgroundColor: 'rgba(255, 179, 71, 0.05)', borderColor: 'rgba(255, 179, 71, 0.15)' }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255, 179, 71, 0.3)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 179, 71, 0.15)'}
    >
      <TechBrackets />
      <header className="flex justify-between items-end mb-6 border-b pb-3" style={{ borderColor: 'rgba(255, 179, 71, 0.25)' }}>
        <h2 className="font-sans text-sm text-gray-400 tracking-widest uppercase">Business Profile</h2>
        <span className="font-mono text-[10px]" style={{ color: 'rgba(255, 179, 71, 0.5)' }}>[SEC_01]</span>
      </header>

      <div className="space-y-5">
        <div>
          <label className="block font-mono text-xs text-gray-400 mb-2 uppercase">Shop Name</label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="w-full px-4 py-2.5 font-mono text-sm text-white focus:outline-none transition-all"
            style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255, 179, 71, 0.15)',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#FFB347'; e.target.style.boxShadow = '0 0 0 1px #FFB347'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 179, 71, 0.15)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        <div>
          <label className="block font-mono text-xs text-gray-400 mb-2 uppercase">Operational Timezone</label>
          <div className="relative">
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-2.5 font-mono text-sm text-white focus:outline-none appearance-none cursor-pointer"
              style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255, 179, 71, 0.15)',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#FFB347'; e.target.style.boxShadow = '0 0 0 1px #FFB347'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 179, 71, 0.15)'; e.target.style.boxShadow = 'none'; }}
            >
              <option value="PST">Pacific Time (US &amp; Canada)</option>
              <option value="MST">Mountain Time (US &amp; Canada)</option>
              <option value="CST">Central Time (US &amp; Canada)</option>
              <option value="EST">Eastern Time (US &amp; Canada)</option>
            </select>
            <i className="ph ph-caret-down absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#FFB347' }}></i>
          </div>
        </div>
        <div className="pt-2">
          <button
            onClick={handleSave}
            className="px-6 py-2 border font-sans text-sm font-bold transition-colors rounded-full uppercase tracking-wider"
            style={{ borderColor: '#FFB347', color: saved ? 'black' : '#FFB347', backgroundColor: saved ? '#FFB347' : 'transparent' }}
            onMouseEnter={(e) => { if (!saved) { e.currentTarget.style.backgroundColor = '#FFB347'; e.currentTarget.style.color = 'black'; } }}
            onMouseLeave={(e) => { if (!saved) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#FFB347'; } }}
          >
            {saved ? 'Saved!' : 'Save Profile'}
          </button>
        </div>
      </div>
    </section>
  );
};

const PaymentGatewayCard = () => {
  const [connected, setConnected] = useState(true);

  return (
    <section
      className="border p-6 relative group transition-colors backdrop-blur-md"
      style={{ backgroundColor: 'rgba(255, 179, 71, 0.05)', borderColor: 'rgba(255, 179, 71, 0.15)' }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255, 179, 71, 0.3)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 179, 71, 0.15)'}
    >
      <TechBrackets />
      <header className="flex justify-between items-end mb-6 border-b pb-3" style={{ borderColor: 'rgba(255, 179, 71, 0.25)' }}>
        <h2 className="font-sans text-sm text-gray-400 tracking-widest uppercase">Payment Gateway</h2>
        <span className="font-mono text-[10px]" style={{ color: 'rgba(255, 179, 71, 0.5)' }}>[SEC_02]</span>
      </header>

      <div className="flex flex-col h-[calc(100%-3rem)] justify-between">
        <div>
          <p className="font-mono text-sm text-gray-300 mb-4 leading-relaxed">Payments and deposits are processed securely through Stripe.</p>

          {connected ? (
            <div className="border p-4 flex items-center justify-between mb-6" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: 'rgba(74, 222, 128, 0.2)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(74, 222, 128, 0.2)' }}>
                  <i className="ph-fill ph-check-circle text-xl" style={{ color: '#4ade80' }}></i>
                </div>
                <div>
                  <div className="font-sans font-bold text-white tracking-wide">Stripe Connected</div>
                  <div className="font-mono text-xs text-gray-400 mt-1">acct_1M0xY2...</div>
                </div>
              </div>
              <span className="px-2 py-1 font-mono text-[10px] uppercase border" style={{ backgroundColor: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', borderColor: 'rgba(74, 222, 128, 0.3)' }}>Active</span>
            </div>
          ) : (
            <div className="border p-4 flex items-center justify-between mb-6" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>
                  <i className="ph-fill ph-x-circle text-xl text-red-500"></i>
                </div>
                <div>
                  <div className="font-sans font-bold text-white tracking-wide">Stripe Disconnected</div>
                  <div className="font-mono text-xs text-gray-400 mt-1">No account linked</div>
                </div>
              </div>
              <span className="px-2 py-1 font-mono text-[10px] uppercase border border-red-500/30 text-red-500 bg-red-500/10">Inactive</span>
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => setConnected(!connected)}
            className="px-5 py-2 border font-sans text-xs font-bold transition-colors rounded-full uppercase tracking-wider flex items-center gap-2"
            style={{ borderColor: connected ? '#4b5563' : '#4ade80', color: connected ? '#9ca3af' : '#4ade80' }}
            onMouseEnter={(e) => {
              if (connected) { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }
              else { e.currentTarget.style.borderColor = '#FFB347'; e.currentTarget.style.color = '#FFB347'; }
            }}
            onMouseLeave={(e) => {
              if (connected) { e.currentTarget.style.borderColor = '#4b5563'; e.currentTarget.style.color = '#9ca3af'; }
              else { e.currentTarget.style.borderColor = '#4ade80'; e.currentTarget.style.color = '#4ade80'; }
            }}
          >
            <i className="ph ph-plugs"></i>
            {connected ? 'Disconnect Account' : 'Connect Account'}
          </button>
        </div>
      </div>
    </section>
  );
};

const DepositProtocolCard = () => {
  const [depositValue, setDepositValue] = useState(50);

  return (
    <section
      className="border p-6 relative group transition-colors backdrop-blur-md"
      style={{ backgroundColor: 'rgba(255, 179, 71, 0.05)', borderColor: 'rgba(255, 179, 71, 0.15)' }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255, 179, 71, 0.3)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 179, 71, 0.15)'}
    >
      <TechBrackets />
      <header className="flex justify-between items-end mb-6 border-b pb-3" style={{ borderColor: 'rgba(255, 179, 71, 0.25)' }}>
        <h2 className="font-sans text-sm text-gray-400 tracking-widest uppercase">Deposit Protocol</h2>
        <span className="font-mono text-[10px]" style={{ color: 'rgba(255, 179, 71, 0.5)' }}>[SEC_03]</span>
      </header>

      <div>
        <p className="font-mono text-sm text-gray-300 mb-8">Set the percentage of the total service cost required upfront to secure a booking.</p>

        <div className="px-2 mb-2">
          <input
            type="range"
            min="0"
            max="100"
            step="50"
            value={depositValue}
            onChange={(e) => setDepositValue(Number(e.target.value))}
            className="w-full"
            style={customStyles.rangeInput}
          />
        </div>

        <div className="flex justify-between font-mono text-xs text-gray-500 px-2 relative">
          <div className="absolute top-[-10px] left-[2%] w-px h-2 bg-gray-600"></div>
          <div className="absolute top-[-10px] left-[50%] w-px h-2 bg-gray-600"></div>
          <div className="absolute top-[-10px] left-[98%] w-px h-2 bg-gray-600"></div>
          <span>0%</span>
          <span className="font-bold" style={{ color: depositValue === 50 ? '#FFB347' : 'inherit' }}>{depositValue}%</span>
          <span>100%</span>
        </div>

        <div className="mt-8 p-4 flex items-start gap-3 border-l-2" style={{ backgroundColor: '#0D0B0A', border: '1px solid rgba(255, 179, 71, 0.2)', borderLeftColor: '#FFB347', borderLeftWidth: '2px' }}>
          <i className="ph-fill ph-info mt-0.5" style={{ color: '#FFB347' }}></i>
          <p className="font-mono text-xs leading-relaxed" style={{ color: 'rgba(255, 179, 71, 0.9)' }}>
            Currently requiring a <span className="font-bold text-white">{depositValue}%</span> deposit for all new appointments. Funds are held in escrow until service completion.
          </p>
        </div>
      </div>
    </section>
  );
};

const CommunicationsCard = () => {
  const [smsEnabled, setSmsEnabled] = useState(true);

  return (
    <section
      className="border p-6 relative group transition-colors backdrop-blur-md"
      style={{ backgroundColor: 'rgba(255, 179, 71, 0.05)', borderColor: 'rgba(255, 179, 71, 0.15)' }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255, 179, 71, 0.3)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 179, 71, 0.15)'}
    >
      <TechBrackets />
      <header className="flex justify-between items-end mb-6 border-b pb-3" style={{ borderColor: 'rgba(255, 179, 71, 0.25)' }}>
        <h2 className="font-sans text-sm text-gray-400 tracking-widest uppercase">Communications</h2>
        <span className="font-mono text-[10px]" style={{ color: 'rgba(255, 179, 71, 0.5)' }}>[SEC_04]</span>
      </header>

      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="font-sans font-bold text-lg mb-1 text-white">Automated SMS Reminders</h3>
          <p className="font-mono text-sm text-gray-400 leading-relaxed max-w-sm">
            Dispatch automated text messages to clients 24 hours prior to their scheduled appointment. Reduces no-shows by 40%.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-2 py-1 border" style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderColor: '#1f2937' }}>
            <i className="ph ph-chat-text text-gray-500"></i>
            <span className="font-mono text-[10px] text-gray-500 uppercase">Usage: 142/500 MSGs this mo.</span>
          </div>
        </div>

        <div className="pt-1">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={smsEnabled}
              onChange={() => setSmsEnabled(!smsEnabled)}
            />
            <div
              className="w-12 h-6 rounded-full relative transition-all cursor-pointer"
              style={{
                backgroundColor: smsEnabled ? '#FFB347' : '#1f2937',
                border: `1px solid ${smsEnabled ? '#FFB347' : '#4b5563'}`,
              }}
              onClick={() => setSmsEnabled(!smsEnabled)}
            >
              <div
                className="absolute top-[2px] h-5 w-5 rounded-full transition-all"
                style={{
                  left: smsEnabled ? 'calc(100% - 22px)' : '2px',
                  backgroundColor: smsEnabled ? 'black' : '#9ca3af',
                  border: `1px solid ${smsEnabled ? 'black' : '#9ca3af'}`,
                }}
              ></div>
            </div>
          </label>
          <div className="text-center mt-2 font-mono text-[10px] font-bold" style={{ color: smsEnabled ? '#FFB347' : '#6b7280' }}>
            {smsEnabled ? 'ACTIVE' : 'OFF'}
          </div>
        </div>
      </div>
    </section>
  );
};

const DayRow = ({ day, initialEnabled, initialOpen, initialClose, isWeekend }) => {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [openTime, setOpenTime] = useState(initialOpen);
  const [closeTime, setCloseTime] = useState(initialClose);

  return (
    <div
      className="flex items-center px-4 py-4 border-b transition-colors"
      style={{
        borderColor: 'rgba(255, 179, 71, 0.1)',
        backgroundColor: isWeekend ? 'rgba(0,0,0,0.2)' : 'transparent',
      }}
      onMouseEnter={(e) => { if (!isWeekend) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; }}
      onMouseLeave={(e) => { if (!isWeekend) e.currentTarget.style.backgroundColor = 'transparent'; else e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.2)'; }}
    >
      <div className={`w-32 font-mono text-sm ${isWeekend ? 'text-gray-500' : 'text-gray-300'}`}>{day}</div>
      <div className="w-24 flex justify-center">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only"
            checked={enabled}
            onChange={() => setEnabled(!enabled)}
          />
          <div
            className="w-10 h-5 rounded-full relative transition-all cursor-pointer"
            style={{
              backgroundColor: enabled ? '#FFB347' : '#1f2937',
              border: `1px solid ${enabled ? '#FFB347' : '#4b5563'}`,
            }}
            onClick={() => setEnabled(!enabled)}
          >
            <div
              className="absolute top-[2px] h-4 w-4 rounded-full transition-all"
              style={{
                left: enabled ? 'calc(100% - 18px)' : '2px',
                backgroundColor: enabled ? 'black' : '#9ca3af',
              }}
            ></div>
          </div>
        </label>
      </div>
      <div className="flex-1 ml-8 flex items-center gap-3">
        {enabled ? (
          <>
            <input
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              className="px-3 py-1.5 font-mono text-sm focus:outline-none transition-colors"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255, 179, 71, 0.15)', color: '#FFB347' }}
              onFocus={(e) => { e.target.style.borderColor = '#FFB347'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 179, 71, 0.15)'; }}
            />
            <span className="font-mono text-gray-500">—</span>
            <input
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className="px-3 py-1.5 font-mono text-sm focus:outline-none transition-colors"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255, 179, 71, 0.15)', color: '#FFB347' }}
              onFocus={(e) => { e.target.style.borderColor = '#FFB347'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 179, 71, 0.15)'; }}
            />
          </>
        ) : (
          <span className="font-mono text-sm text-gray-600 px-3 py-1.5 border border-transparent" style={{ backgroundColor: 'rgba(17,24,39,0.5)' }}>CLOSED</span>
        )}
      </div>
    </div>
  );
};

const OperationalScheduleCard = () => {
  const days = [
    { day: 'MONDAY', initialEnabled: true, initialOpen: '09:00', initialClose: '18:00', isWeekend: false },
    { day: 'TUESDAY', initialEnabled: true, initialOpen: '09:00', initialClose: '18:00', isWeekend: false },
    { day: 'WEDNESDAY', initialEnabled: true, initialOpen: '09:00', initialClose: '18:00', isWeekend: false },
    { day: 'THURSDAY', initialEnabled: true, initialOpen: '09:00', initialClose: '18:00', isWeekend: false },
    { day: 'FRIDAY', initialEnabled: true, initialOpen: '09:00', initialClose: '16:00', isWeekend: false },
    { day: 'SATURDAY', initialEnabled: false, initialOpen: '10:00', initialClose: '14:00', isWeekend: true },
    { day: 'SUNDAY', initialEnabled: false, initialOpen: '10:00', initialClose: '14:00', isWeekend: true },
  ];

  return (
    <section
      className="lg:col-span-2 border p-6 relative group transition-colors backdrop-blur-md"
      style={{ backgroundColor: 'rgba(255, 179, 71, 0.05)', borderColor: 'rgba(255, 179, 71, 0.15)' }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255, 179, 71, 0.3)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 179, 71, 0.15)'}
    >
      <TechBrackets />
      <header className="flex justify-between items-end mb-6 border-b pb-3" style={{ borderColor: 'rgba(255, 179, 71, 0.25)' }}>
        <h2 className="font-sans text-sm text-gray-400 tracking-widest uppercase">Operational Schedule</h2>
        <span className="font-mono text-[10px]" style={{ color: 'rgba(255, 179, 71, 0.5)' }}>[SEC_05]</span>
      </header>

      <div className="w-full">
        <div className="flex items-center px-4 pb-3 border-b font-mono text-xs text-gray-500 uppercase" style={{ borderColor: '#1f2937' }}>
          <div className="w-32">Day</div>
          <div className="w-24 text-center">Status</div>
          <div className="flex-1 ml-8">Hours</div>
        </div>

        {days.map((d, idx) => (
          <DayRow
            key={d.day}
            day={d.day}
            initialEnabled={d.initialEnabled}
            initialOpen={d.initialOpen}
            initialClose={d.initialClose}
            isWeekend={d.isWeekend}
          />
        ))}
      </div>
    </section>
  );
};

const SettingsPage = () => {
  const [activeNav, setActiveNav] = useState('settings');

  return (
    <div className="flex text-white h-screen w-screen overflow-hidden antialiased font-sans relative" style={{ ...customStyles.bgAmbient, fontFamily: "'Space Grotesk', sans-serif" }}>
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />

      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        <div className="absolute top-4 left-6 text-[10px] font-mono tracking-widest pointer-events-none z-0" style={{ color: 'rgba(255, 179, 71, 0.3)', fontFamily: "'JetBrains Mono', monospace" }}>SYS.CORE // ON-LINE</div>
        <div className="absolute bottom-4 right-6 text-[10px] font-mono tracking-widest pointer-events-none z-0" style={{ color: 'rgba(255, 179, 71, 0.3)', fontFamily: "'JetBrains Mono', monospace" }}>UPLINK_ESTABLISHED_</div>

        <header className="h-20 px-8 flex justify-between items-center border-b relative z-10 backdrop-blur-sm" style={{ borderColor: 'rgba(255, 179, 71, 0.15)', backgroundColor: 'rgba(13, 11, 10, 0.5)' }}>
          <div>
            <h1 className="font-sans text-2xl font-bold tracking-tight text-white">System Settings</h1>
            <div className="text-xs font-mono text-gray-400 mt-1">Configure operational parameters</div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 border" style={{ backgroundColor: 'rgba(74, 222, 128, 0.1)', borderColor: 'rgba(74, 222, 128, 0.2)' }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#4ade80', boxShadow: '0 0 8px rgba(74,222,128,0.8)' }}></div>
              <span className="font-mono text-xs tracking-wide" style={{ color: '#4ade80' }}>
                CONNECTED <i className="ph ph-check ml-1"></i>
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative z-10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
            <BusinessProfileCard />
            <PaymentGatewayCard />
            <DepositProtocolCard />
            <CommunicationsCard />
            <OperationalScheduleCard />
          </div>
        </div>
      </main>
    </div>
  );
};

const App = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');

      * { box-sizing: border-box; }

      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-track { background: #0D0B0A; border-left: 1px solid rgba(255, 179, 71, 0.1); }
      ::-webkit-scrollbar-thumb { background: rgba(255, 179, 71, 0.2); border-radius: 0; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(255, 179, 71, 0.4); }

      input[type=range] { -webkit-appearance: none; width: 100%; background: transparent; }
      input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        height: 16px; width: 16px; border-radius: 50%;
        background: #FFB347; cursor: pointer; margin-top: -6px;
        box-shadow: 0 0 10px rgba(255, 179, 71, 0.6);
        transition: transform 0.1s ease;
      }
      input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.2); }
      input[type=range]::-webkit-slider-runnable-track {
        width: 100%; height: 4px; cursor: pointer;
        background: rgba(255, 179, 71, 0.2); border-radius: 0;
      }
      input[type=range]:focus { outline: none; }

      input[type="time"]::-webkit-calendar-picker-indicator {
        filter: invert(0.7) sepia(1) saturate(5) hue-rotate(340deg);
        cursor: pointer; opacity: 0.5;
      }
      input[type="time"]::-webkit-calendar-picker-indicator:hover { opacity: 1; }

      ::selection { background-color: #FFB347; color: black; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <Router basename="/">
      <Routes>
        <Route path="/" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
};

export default App;