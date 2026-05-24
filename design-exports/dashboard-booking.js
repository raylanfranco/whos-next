import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const customStyles = {
  noRadius: { borderRadius: '0' },
  scrollbar: `
    * { border-radius: 0 !important; }
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #0a0a0a; border-left: 1px solid #222222; }
    ::-webkit-scrollbar-thumb { background: #222222; }
    ::-webkit-scrollbar-thumb:hover { background: #333333; }
  `
};

const BookingCard = ({ time, timeColor, name, service, status, statusBg, statusColor, statusBorder, contactIcon, contactText, hoverBorderColor, opacity }) => {
  const [hovered, setHovered] = useState(false);

  const borderColorMap = {
    primary: hovered ? '#E01020' : '#222222',
    amber: hovered ? '#f59e0b' : '#222222',
    emerald: hovered ? '#10b981' : '#222222',
  };

  const nameColorMap = {
    primary: hovered ? '#E01020' : '#ffffff',
    amber: hovered ? '#f59e0b' : '#ffffff',
    emerald: hovered ? '#10b981' : '#ffffff',
  };

  return (
    <div
      className="bg-[#0a0a0a] p-4 cursor-pointer transition-colors"
      style={{ border: `1px solid ${borderColorMap[hoverBorderColor]}`, opacity: opacity || 1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="font-mono text-sm font-bold tracking-wider" style={{ color: timeColor }}>{time}</span>
        <span
          className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest"
          style={{ background: statusBg, color: statusColor, border: `1px solid ${statusBorder}` }}
        >
          {status}
        </span>
      </div>
      <h4 className="font-sans text-base font-bold mb-1 transition-colors" style={{ color: nameColorMap[hoverBorderColor] }}>{name}</h4>
      <p className="font-mono text-[11px] text-[#a1a1aa] uppercase tracking-wider mb-4">{service}</p>
      <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid #222222' }}>
        <div className="w-6 h-6 bg-[#222222] flex items-center justify-center flex-shrink-0">
          {contactIcon === 'phone' && (
            <svg className="w-3 h-3 text-[#a1a1aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          )}
          {contactIcon === 'email' && (
            <svg className="w-3 h-3 text-[#a1a1aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          )}
          {contactIcon === 'check' && (
            <svg className="w-3 h-3 text-[#a1a1aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
        </div>
        <span className="font-mono text-[10px] text-[#a1a1aa] tracking-widest">{contactText}</span>
      </div>
    </div>
  );
};

const CalendarEvent = ({ time, name, service, type }) => {
  const bgMap = {
    primary: 'bg-[#E01020]',
    amber: 'bg-[#f59e0b]',
    emerald: 'bg-[#10b981]',
  };
  const textMap = {
    primary: 'text-white',
    amber: 'text-black',
    emerald: 'text-black',
  };
  const subTextMap = {
    primary: 'text-white/80',
    amber: 'opacity-80',
    emerald: 'opacity-80',
  };

  return (
    <div className={`${bgMap[type]} text-black p-1.5 flex flex-col border-l-[3px] border-black`}>
      <span className={`font-mono text-[9px] font-bold tracking-wider uppercase leading-none mb-0.5 ${textMap[type]}`}>{time} - {name}</span>
      <span className={`font-mono text-[8px] tracking-widest uppercase ${subTextMap[type]}`}>{service}</span>
    </div>
  );
};

const CancelledEvent = ({ time, name }) => (
  <div className="border border-[#222222] text-[#52525b] p-1.5 flex flex-col relative overflow-hidden">
    <div className="absolute inset-0 bg-[#52525b]/10"></div>
    <span className="font-mono text-[9px] font-bold tracking-wider uppercase leading-none mb-0.5 line-through relative z-10">{time} - {name}</span>
  </div>
);

const Sidebar = ({ activeNav, setActiveNav }) => {
  const navItems = [
    {
      id: 'bookings',
      label: 'Bookings',
      icon: (
        <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
          <rect x="3" y="4" width="18" height="18"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      )
    },
    {
      id: 'services',
      label: 'Services',
      icon: (
        <svg className="w-5 h-5 mr-4 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
      )
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: (
        <svg className="w-5 h-5 mr-4 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg className="w-5 h-5 mr-4 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      )
    }
  ];

  return (
    <aside className="w-[240px] flex-shrink-0 bg-[#111111] border-r border-[#222222] flex flex-col z-20 relative">
      <div className="h-20 flex items-center px-6 border-b border-[#222222]">
        <div className="w-4 h-4 bg-[#E01020] mr-3 flex-shrink-0"></div>
        <h1 className="font-mono text-base tracking-widest font-bold uppercase mt-1">Who's Next?</h1>
      </div>

      <nav className="flex-1 py-8 flex flex-col gap-2">
        {navItems.map((item) => (
          item.id === activeNav ? (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className="flex items-center px-6 py-3 bg-[#1a1a1a] border-l-4 border-[#E01020] text-white font-mono text-sm uppercase tracking-wider transition-colors w-full text-left"
            >
              <span className="text-[#E01020]">{item.icon}</span>
              <span className="mt-0.5">{item.label}</span>
            </button>
          ) : (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className="flex items-center px-[28px] py-3 text-[#a1a1aa] hover:text-white hover:bg-[#151515] font-mono text-sm uppercase tracking-wider group transition-colors w-full text-left"
            >
              {item.icon}
              <span className="mt-0.5">{item.label}</span>
            </button>
          )
        ))}
      </nav>

      <div className="p-6 border-t border-[#222222] bg-[#111111]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#222222] flex items-center justify-center font-bold text-lg text-white" style={{ fontFamily: 'Anton, sans-serif' }}>
            AD
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-sm font-bold tracking-wide uppercase text-white">Admin User</span>
            <span className="font-mono text-[10px] tracking-widest text-[#a1a1aa] uppercase">System Admin</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

const RightPanel = ({ onClose, onAddWalkIn }) => {
  return (
    <aside className="w-[280px] flex-shrink-0 bg-[#111111] border-l border-[#222222] flex flex-col z-20 relative" style={{ boxShadow: '-10px 0 30px rgba(0,0,0,0.5)' }}>
      <div className="p-6 border-b border-[#222222] bg-[#151515]">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#E01020] font-bold">Selected Day</span>
          <button className="text-[#a1a1aa] hover:text-white transition-colors" onClick={onClose}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <h3 className="text-2xl uppercase tracking-wide" style={{ fontFamily: 'Anton, sans-serif' }}>Tuesday, Apr 15</h3>
        <p className="font-mono text-xs text-[#a1a1aa] mt-1 uppercase tracking-widest">4 Appointments</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <BookingCard
          time="09:00 AM"
          timeColor="#E01020"
          name="Michael Smith"
          service="Service: Premium Haircut"
          status="Confirmed"
          statusBg="rgba(224,16,32,0.2)"
          statusColor="#E01020"
          statusBorder="rgba(224,16,32,0.3)"
          contactIcon="phone"
          contactText="555-0192"
          hoverBorderColor="primary"
        />

        <BookingCard
          time="11:30 AM"
          timeColor="#f59e0b"
          name="John Doe"
          service="Service: Beard Trim"
          status="Pending"
          statusBg="rgba(245,158,11,0.2)"
          statusColor="#f59e0b"
          statusBorder="rgba(245,158,11,0.3)"
          contactIcon="email"
          contactText="J.DOE@EMAIL.COM"
          hoverBorderColor="amber"
        />

        <BookingCard
          time="02:00 PM"
          timeColor="#E01020"
          name="Alice Johnson"
          service="Service: Full Package"
          status="Confirmed"
          statusBg="rgba(224,16,32,0.2)"
          statusColor="#E01020"
          statusBorder="rgba(224,16,32,0.3)"
          contactIcon="phone"
          contactText="555-0842"
          hoverBorderColor="primary"
        />

        <BookingCard
          time="04:15 PM"
          timeColor="#10b981"
          name="Kevin Williams"
          service="Service: Fade & Style"
          status="Completed"
          statusBg="rgba(16,185,129,0.2)"
          statusColor="#10b981"
          statusBorder="rgba(16,185,129,0.3)"
          contactIcon="check"
          contactText="PAID IN FULL"
          hoverBorderColor="emerald"
          opacity={0.7}
        />

        <button
          onClick={onAddWalkIn}
          className="w-full py-4 mt-2 border border-dashed border-[#222222] text-[#a1a1aa] font-mono text-xs uppercase tracking-widest hover:border-[#E01020] hover:text-[#E01020] transition-colors flex flex-col items-center justify-center gap-2 bg-[#111] hover:bg-[#151515]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Add Walk-In</span>
        </button>
      </div>
    </aside>
  );
};

const NewBookingModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ name: '', service: '', date: '', time: '', phone: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', service: '', date: '', time: '', phone: '' });
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="bg-[#111111] border border-[#222222] w-[500px] flex flex-col" style={{ boxShadow: '0 0 40px rgba(0,0,0,0.8)' }}>
        <div className="flex items-center justify-between p-6 border-b border-[#222222] bg-[#151515]">
          <h2 className="text-2xl uppercase tracking-wide text-white" style={{ fontFamily: 'Anton, sans-serif' }}>New Booking</h2>
          <button onClick={onClose} className="text-[#a1a1aa] hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {submitted ? (
            <div className="py-8 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 bg-[#10b981] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="font-mono text-sm text-[#10b981] uppercase tracking-widest">Booking Created!</span>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-[#a1a1aa] uppercase tracking-widest">Customer Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-[#0a0a0a] border border-[#222222] text-white font-mono text-sm px-3 py-2.5 focus:border-[#E01020] focus:outline-none transition-colors"
                  placeholder="FULL NAME"
                  style={{ color: 'white' }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-[#a1a1aa] uppercase tracking-widest">Service</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  required
                  className="bg-[#0a0a0a] border border-[#222222] text-white font-mono text-sm px-3 py-2.5 focus:border-[#E01020] focus:outline-none transition-colors"
                >
                  <option value="">SELECT SERVICE</option>
                  <option value="haircut">Premium Haircut</option>
                  <option value="beard">Beard Trim</option>
                  <option value="color">Color Treatment</option>
                  <option value="full">Full Package</option>
                  <option value="styling">Styling</option>
                  <option value="consult">Consultation</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-[#a1a1aa] uppercase tracking-widest">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="bg-[#0a0a0a] border border-[#222222] text-white font-mono text-sm px-3 py-2.5 focus:border-[#E01020] focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-[#a1a1aa] uppercase tracking-widest">Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="bg-[#0a0a0a] border border-[#222222] text-white font-mono text-sm px-3 py-2.5 focus:border-[#E01020] focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-[#a1a1aa] uppercase tracking-widest">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-[#0a0a0a] border border-[#222222] text-white font-mono text-sm px-3 py-2.5 focus:border-[#E01020] focus:outline-none transition-colors"
                  placeholder="555-0000"
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-[#222222] text-[#a1a1aa] font-mono text-sm uppercase tracking-widest hover:border-[#333] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#E01020] hover:bg-red-700 text-white font-mono text-sm uppercase tracking-widest font-bold transition-colors"
                >
                  Create Booking
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

const BookingsPage = () => {
  const [viewMode, setViewMode] = useState('month');
  const [currentMonth, setCurrentMonth] = useState('April 2025');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [activeNav, setActiveNav] = useState('bookings');

  const months = ['January 2025', 'February 2025', 'March 2025', 'April 2025', 'May 2025', 'June 2025', 'July 2025', 'August 2025', 'September 2025', 'October 2025', 'November 2025', 'December 2025'];

  const handlePrevMonth = () => {
    const idx = months.indexOf(currentMonth);
    if (idx > 0) setCurrentMonth(months[idx - 1]);
  };

  const handleNextMonth = () => {
    const idx = months.indexOf(currentMonth);
    if (idx < months.length - 1) setCurrentMonth(months[idx + 1]);
  };

  return (
    <div className="bg-[#0a0a0a] text-white h-screen w-screen flex overflow-hidden" style={{ fontFamily: 'Inter, sans-serif', userSelect: 'none' }}>
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />

      <main className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a] z-10 relative overflow-hidden">
        <header className="flex items-center justify-between px-8 py-6 border-b border-[#222222] bg-[#111111] flex-shrink-0">
          <div>
            <h2 className="text-5xl uppercase tracking-wide text-white mb-1" style={{ fontFamily: 'Anton, sans-serif' }}>Bookings</h2>
            <p className="font-mono text-sm text-[#a1a1aa] tracking-wider uppercase">Today: Tuesday, April 15</p>
          </div>
          <button
            onClick={() => setShowNewBooking(true)}
            className="bg-[#E01020] hover:bg-red-700 text-white font-mono text-sm px-6 py-3 uppercase tracking-widest font-bold flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span className="mt-0.5">New Booking</span>
          </button>
        </header>

        <div className="grid grid-cols-4 border-b border-[#222222] flex-shrink-0" style={{ gap: '1px', background: '#222222' }}>
          {[
            { label: 'Total Bookings', value: '142', color: 'text-white' },
            { label: 'Pending', value: '18', color: 'text-[#f59e0b]' },
            { label: 'Today', value: '12', color: 'text-[#E01020]' },
            { label: 'This Week', value: '48', color: 'text-white' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#111111] p-5">
              <h3 className="font-mono text-[11px] text-[#a1a1aa] uppercase tracking-widest mb-2">{stat.label}</h3>
              <p className={`text-4xl ${stat.color}`} style={{ fontFamily: 'Anton, sans-serif' }}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-8 py-4 border-b border-[#222222] bg-[#0a0a0a] flex-shrink-0">
          <div className="flex border border-[#222222]">
            {['Day', 'Week', 'Month'].map((mode, i) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode.toLowerCase())}
                className={`px-5 py-2 text-xs font-mono tracking-widest uppercase transition-colors ${i < 2 ? 'border-r border-[#222222]' : ''} ${viewMode === mode.toLowerCase() ? 'bg-[#E01020] text-white font-bold' : 'text-[#a1a1aa] hover:text-white hover:bg-[#111111]'}`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <button onClick={handlePrevMonth} className="text-[#a1a1aa] hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <span className="font-mono text-lg font-bold tracking-widest uppercase w-48 text-center mt-0.5">{currentMonth}</span>
            <button onClick={handleNextMonth} className="text-[#a1a1aa] hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>

          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a1a1aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="SEARCH BOOKINGS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#111111] border border-[#222222] text-xs pl-10 pr-4 py-2.5 font-mono tracking-widest w-[280px] focus:border-[#E01020] focus:outline-none text-white transition-colors"
              style={{ color: 'white', caretColor: 'white' }}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col p-8 overflow-hidden bg-[#0a0a0a]">
          <div className="grid grid-cols-7 border-b border-[#222222] pb-3 mb-4 flex-shrink-0">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-[11px] font-mono text-[#a1a1aa] uppercase tracking-[0.2em] font-bold">{day}</div>
            ))}
          </div>

          <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto" style={{ gap: '1px', background: '#222222', border: '1px solid #222222' }}>
            {/* Row 1 */}
            <div className="bg-[#0f0f0f] p-2 flex flex-col gap-1 min-h-[110px] hover:bg-[#141414] cursor-pointer transition-colors group">
              <span className="text-xs font-mono text-[#444] group-hover:text-[#a1a1aa] transition-colors">30</span>
            </div>
            <div className="bg-[#0f0f0f] p-2 flex flex-col gap-1 min-h-[110px] hover:bg-[#141414] cursor-pointer transition-colors group">
              <span className="text-xs font-mono text-[#444] group-hover:text-[#a1a1aa] transition-colors">31</span>
            </div>
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">01</span>
              <CalendarEvent time="09:00" name="L. Croft" service="Styling" type="primary" />
            </div>
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">02</span>
              <CalendarEvent time="14:30" name="B. Wayne" service="Consult" type="emerald" />
            </div>
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">03</span>
            </div>
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">04</span>
              <CalendarEvent time="11:00" name="T. Stark" service="Premium" type="amber" />
              <CancelledEvent time="16:00" name="P. Parker" />
            </div>
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">05</span>
            </div>

            {/* Row 2 */}
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">06</span>
            </div>
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">07</span>
              <CalendarEvent time="10:00" name="N. Romanoff" service="Color" type="primary" />
            </div>
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">08</span>
              <CalendarEvent time="09:30" name="S. Rogers" service="Standard" type="emerald" />
              <CalendarEvent time="13:00" name="C. Danvers" service="Premium" type="primary" />
            </div>
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">09</span>
            </div>
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">10</span>
              <CalendarEvent time="15:00" name="D. Prince" service="Consult" type="amber" />
            </div>
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">11</span>
            </div>
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">12</span>
            </div>

            {/* Row 3 */}
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">13</span>
            </div>
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">14</span>
              <CalendarEvent time="11:00" name="B. Banner" service="Trim" type="emerald" />
            </div>
            <div
              className="bg-[#111] p-1.5 flex flex-col gap-1.5 min-h-[110px] relative z-10 cursor-pointer"
              style={{ border: '2px solid #E01020', boxShadow: '0 0 15px rgba(224,16,32,0.15)' }}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono text-[#E01020] font-bold">15</span>
                <div className="w-2 h-2 bg-[#E01020]"></div>
              </div>
              <CalendarEvent time="09:00" name="M. Smith" service="Haircut" type="primary" />
              <CalendarEvent time="11:30" name="J. Doe" service="Beard Trim" type="amber" />
              <CalendarEvent time="14:00" name="A. Johnson" service="Full Pkg" type="primary" />
              <div className="text-[9px] font-mono text-[#a1a1aa] uppercase tracking-widest text-center mt-1">+1 MORE</div>
            </div>
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">16</span>
              <CancelledEvent time="10:00" name="C. Kent" />
            </div>
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">17</span>
            </div>
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">18</span>
              <CalendarEvent time="16:30" name="W. Wilson" service="Styling" type="primary" />
            </div>
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">19</span>
            </div>

            {/* Row 4 */}
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">20</span>
            </div>
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">21</span>
            </div>
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">22</span>
              <CalendarEvent time="13:00" name="R. Swanson" service="Standard" type="amber" />
            </div>
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">23</span>
            </div>
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">24</span>
              <CalendarEvent time="09:00" name="L. Knope" service="Color" type="primary" />
            </div>
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">25</span>
            </div>
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">26</span>
            </div>

            {/* Row 5 */}
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">27</span>
            </div>
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">28</span>
            </div>
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">29</span>
              <CalendarEvent time="15:30" name="T. Haverford" service="Styling" type="primary" />
              <CalendarEvent time="17:00" name="A. Dwyer" service="Trim" type="amber" />
            </div>
            <div className="bg-[#0a0a0a] p-2 flex flex-col gap-1.5 min-h-[110px] hover:bg-[#0f0f0f] cursor-pointer transition-colors">
              <span className="text-xs font-mono text-white">30</span>
            </div>
            <div className="bg-[#0f0f0f] p-2 flex flex-col gap-1 min-h-[110px] hover:bg-[#141414] cursor-pointer transition-colors group">
              <span className="text-xs font-mono text-[#444] group-hover:text-[#a1a1aa] transition-colors">01</span>
            </div>
            <div className="bg-[#0f0f0f] p-2 flex flex-col gap-1 min-h-[110px] hover:bg-[#141414] cursor-pointer transition-colors group">
              <span className="text-xs font-mono text-[#444] group-hover:text-[#a1a1aa] transition-colors">02</span>
            </div>
            <div className="bg-[#0f0f0f] p-2 flex flex-col gap-1 min-h-[110px] hover:bg-[#141414] cursor-pointer transition-colors group">
              <span className="text-xs font-mono text-[#444] group-hover:text-[#a1a1aa] transition-colors">03</span>
            </div>
          </div>
        </div>
      </main>

      {showRightPanel && (
        <RightPanel
          onClose={() => setShowRightPanel(false)}
          onAddWalkIn={() => setShowNewBooking(true)}
        />
      )}

      <NewBookingModal isOpen={showNewBooking} onClose={() => setShowNewBooking(false)} />
    </div>
  );
};

const App = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = customStyles.scrollbar;
    document.head.appendChild(style);

    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap';
    document.head.appendChild(fontLink);

    return () => {
      document.head.removeChild(style);
    };
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