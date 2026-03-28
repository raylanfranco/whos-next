import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const customStyles = {
  scrollbar: `
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #0D0B0A; border-left: 1px solid rgba(255, 179, 71, 0.1); }
    ::-webkit-scrollbar-thumb { background: rgba(255, 179, 71, 0.2); border: 1px solid rgba(255, 179, 71, 0.1); }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255, 179, 71, 0.4); }
  `,
  bgNoise: {
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`,
    pointerEvents: 'none',
  },
  scanlines: {
    background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1))',
    backgroundSize: '100% 4px',
    pointerEvents: 'none',
  },
  ambientArc: {
    background: 'radial-gradient(circle at 50% -20%, rgba(255, 179, 71, 0.08) 0%, rgba(13, 11, 10, 0) 60%)',
  },
  ambientArcBottom: {
    background: 'radial-gradient(circle at 100% 100%, rgba(255, 179, 71, 0.05) 0%, rgba(13, 11, 10, 0) 50%)',
  },
};

const allCustomers = [
  { id: '00192A', name: 'Marcus Holloway', email: 'marcus.h@dedsec.net', phone: '+1 (415) 555-0198', vehicles: 2, bookings: 4 },
  { id: '00192B', name: 'Sarah Connor', email: 's.connor@resist.org', phone: '+1 (310) 555-0122', vehicles: 1, bookings: 12 },
  { id: '00192C', name: 'Johnny Silverhand', email: 'js@samurai.band', phone: '+1 (213) 555-0177', vehicles: 4, bookings: 2 },
  { id: '00192D', name: 'Ellen Ripley', email: 'eripley@weyland.corp', phone: '+1 (619) 555-0155', vehicles: 1, bookings: 1 },
  { id: '00192E', name: 'Henry Dorsett Case', email: 'case@sprawl.net', phone: '+1 (206) 555-0144', vehicles: 0, bookings: 5 },
  { id: '00192F', name: 'Molly Millions', email: 'mm@chiba.city', phone: '+1 (415) 555-0199', vehicles: 3, bookings: 8 },
  { id: '00192G', name: 'Hiro Protagonist', email: 'hiro@meta.verse', phone: '+1 (310) 555-0188', vehicles: 2, bookings: 3 },
  { id: '00192H', name: 'Takeshi Kovacs', email: 'tk@envoy.corps', phone: '+1 (213) 555-0166', vehicles: 1, bookings: 7 },
  { id: '00193A', name: 'Motoko Kusanagi', email: 'major@section9.jp', phone: '+1 (650) 555-0101', vehicles: 2, bookings: 9 },
  { id: '00193B', name: 'Neuromancer', email: 'neuro@wintermute.ai', phone: '+1 (312) 555-0102', vehicles: 0, bookings: 6 },
  { id: '00193C', name: 'Dani Rojas', email: 'dani@guerrilla.cu', phone: '+1 (305) 555-0103', vehicles: 3, bookings: 11 },
  { id: '00193D', name: 'V (Cyberpunk)', email: 'v@nightcity.net', phone: '+1 (702) 555-0104', vehicles: 2, bookings: 14 },
  { id: '00193E', name: 'Niko Bellic', email: 'niko@liberty.city', phone: '+1 (917) 555-0105', vehicles: 5, bookings: 20 },
  { id: '00193F', name: 'Aloy (Horizon)', email: 'aloy@nora.tribe', phone: '+1 (720) 555-0106', vehicles: 0, bookings: 3 },
  { id: '00193G', name: 'Commander Shepard', email: 'shepard@n7.mil', phone: '+1 (508) 555-0107', vehicles: 1, bookings: 5 },
  { id: '00193H', name: 'Lara Croft', email: 'lara@croft.manor', phone: '+1 (207) 555-0108', vehicles: 2, bookings: 8 },
];

const PAGE_SIZE = 8;

const Sidebar = ({ activeNav, setActiveNav }) => {
  const navItems = [
    { key: 'bookings', icon: 'ph-calendar-blank', label: 'Bookings' },
    { key: 'services', icon: 'ph-wrench', label: 'Services' },
    { key: 'customers', icon: 'ph-users', label: 'Customers' },
    { key: 'settings', icon: 'ph-sliders-horizontal', label: 'Settings' },
  ];

  return (
    <aside className="w-64 border-r flex flex-col justify-between relative z-20 flex-shrink-0" style={{ borderColor: 'rgba(255, 179, 71, 0.15)', backgroundColor: 'rgba(13, 11, 10, 0.8)', backdropFilter: 'blur(4px)' }}>
      <div>
        <div className="h-20 flex items-center px-6" style={{ borderBottom: '1px solid rgba(255, 179, 71, 0.15)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center text-yellow-400 font-bold text-xl relative" style={{ background: 'rgba(255, 179, 71, 0.05)', border: '1px solid rgba(255, 179, 71, 0.15)' }}>
              B
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 animate-pulse"></div>
            </div>
            <span className="font-bold text-xl tracking-wide text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>BayReady</span>
          </div>
        </div>

        <nav className="p-4 space-y-1 mt-4">
          {navItems.map((item) => {
            const isActive = activeNav === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveNav(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors group relative text-left ${isActive ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}
                style={isActive ? { background: 'rgba(255, 179, 71, 0.05)', borderLeft: '2px solid #FFB347' } : {}}
              >
                {!isActive && (
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(255, 179, 71, 0.05)' }}></span>
                )}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-[1px]" style={{ background: '#FFB347', boxShadow: '0 0 10px 2px rgba(255,179,71,0.5)' }}></div>
                )}
                <i className={`ph ${item.icon} text-xl ${isActive ? '' : 'group-hover:text-yellow-400'} transition-colors relative z-10`}></i>
                <span className="font-medium relative z-10" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6" style={{ borderTop: '1px solid rgba(255, 179, 71, 0.15)' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 flex items-center justify-center text-gray-400 font-mono text-xs" style={{ background: 'rgba(255, 179, 71, 0.05)', border: '1px solid rgba(255, 179, 71, 0.15)', fontFamily: "'JetBrains Mono', monospace" }}>
            WS
          </div>
          <div>
            <div className="text-sm font-medium text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Wrench &amp; Spoke</div>
            <div className="text-gray-500" style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace" }}>ID: WS-00192</div>
          </div>
        </div>
        <div className="text-yellow-400 flex items-center gap-2" style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.15em' }}>
          POWERED BY BAYREADY
          <div className="w-1 h-1 bg-yellow-400"></div>
        </div>
      </div>
    </aside>
  );
};

const AddCustomerModal = ({ isOpen, onClose, onAdd }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', vehicles: '', bookings: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onAdd({
      id: `NEW_${Date.now()}`,
      name: form.name,
      email: form.email,
      phone: form.phone,
      vehicles: parseInt(form.vehicles) || 0,
      bookings: parseInt(form.bookings) || 0,
    });
    setForm({ name: '', email: '', phone: '', vehicles: '', bookings: '' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const inputStyle = {
    background: '#050404',
    border: '1px solid rgba(255, 179, 71, 0.15)',
    color: 'white',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '13px',
    padding: '10px 12px',
    outline: 'none',
    width: '100%',
    borderRadius: '0',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
  };

  const inputFocusStyle = {
    ...inputStyle,
    border: '1px solid #FFB347',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="relative w-[480px]" style={{ background: '#0D0B0A', border: '1px solid rgba(255, 179, 71, 0.4)', boxShadow: '0 0 40px rgba(255,179,71,0.1)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255, 179, 71, 0.15)' }}>
          <div>
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Add Customer</h2>
            <div className="text-gray-500 mt-0.5" style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>NEW_RECORD // CUSTOMER_DB</div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <i className="ph ph-x text-xl"></i>
          </button>
        </div>
        <div className="p-6 space-y-4">
          {[
            { key: 'name', label: 'FULL NAME', placeholder: 'e.g. John Doe' },
            { key: 'email', label: 'EMAIL', placeholder: 'e.g. john@example.com' },
            { key: 'phone', label: 'PHONE', placeholder: 'e.g. +1 (415) 555-0100' },
            { key: 'vehicles', label: 'VEHICLES (optional)', placeholder: '0' },
            { key: 'bookings', label: 'BOOKINGS (optional)', placeholder: '0' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-gray-500 mb-1" style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.15em' }}>{field.label}</label>
              <input
                type={['vehicles', 'bookings'].includes(field.key) ? 'number' : 'text'}
                placeholder={field.placeholder}
                value={form[field.key]}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                style={inputStyle}
                onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={e => Object.assign(e.target.style, inputStyle)}
              />
              {errors[field.key] && <div className="text-red-400 mt-1" style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace" }}>{errors[field.key]}</div>}
            </div>
          ))}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors" style={{ border: '1px solid rgba(255, 179, 71, 0.15)', background: 'rgba(255, 179, 71, 0.05)', fontFamily: "'Space Grotesk', sans-serif" }}>
            CANCEL
          </button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 text-sm font-bold transition-colors" style={{ background: '#FFB347', color: '#0D0B0A', fontFamily: "'Space Grotesk', sans-serif" }}>
            ADD CUSTOMER
          </button>
        </div>
      </div>
    </div>
  );
};

const CustomerRow = ({ customer, isLast, onMenuClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <tr
      className="transition-all group relative cursor-pointer"
      style={{
        borderBottom: isLast ? '1px solid transparent' : '1px solid rgba(255, 179, 71, 0.1)',
        background: hovered ? 'rgba(255, 179, 71, 0.08)' : 'transparent',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <td className="absolute inset-0 pointer-events-none z-10" style={{ border: '1px solid #FFB347' }}></td>
      )}
      <td className="py-4 px-6 relative z-0">
        <div className="font-bold text-white text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{customer.name}</div>
        <div className="text-gray-600 mt-1" style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace" }}>CUST_ID: {customer.id}</div>
      </td>
      <td className="py-4 px-6 text-gray-400 relative z-0" style={{ opacity: 0.8, fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>{customer.email}</td>
      <td className="py-4 px-6 text-gray-300 relative z-0" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>{customer.phone}</td>
      <td className="py-4 px-6 text-right relative z-0" style={{ color: customer.vehicles === 0 ? '#4b5563' : '#FFB347', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>{customer.vehicles}</td>
      <td className="py-4 px-6 text-right text-white relative z-0" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>{customer.bookings}</td>
      <td className="py-4 px-6 relative z-0 text-right transition-opacity" style={{ opacity: hovered ? 1 : 0 }}>
        <button className="text-gray-400 hover:text-yellow-400 transition-colors" onClick={(e) => { e.stopPropagation(); onMenuClick(customer); }}>
          <i className="ph ph-dots-three-vertical text-lg"></i>
        </button>
      </td>
    </tr>
  );
};

const CustomersPage = () => {
  const [customers, setCustomers] = useState(allCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleAddCustomer = (newCustomer) => {
    setCustomers(prev => [newCustomer, ...prev]);
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Name', 'Email', 'Phone', 'Vehicles', 'Bookings'],
      ...customers.map(c => [c.id, c.name, c.email, c.phone, c.vehicles, c.bookings])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'customers.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const visiblePages = [];
  for (let i = 1; i <= Math.min(totalPages, 3); i++) visiblePages.push(i);

  return (
    <main className="flex-1 flex flex-col z-20 relative overflow-hidden" style={{ background: 'rgba(13,11,10,0.4)', backdropFilter: 'blur(2px)' }}>
      <AddCustomerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddCustomer} />

      {contextMenu && (
        <div className="fixed z-50" style={{ top: contextMenu.y, left: contextMenu.x, background: '#0D0B0A', border: '1px solid rgba(255, 179, 71, 0.4)', minWidth: '160px' }} onMouseLeave={() => setContextMenu(null)}>
          {['View Profile', 'Edit Customer', 'New Booking', 'Delete'].map((item, i) => (
            <button key={i} className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${item === 'Delete' ? 'text-red-400 hover:bg-red-400/10' : 'text-gray-300 hover:text-white hover:bg-yellow-400/5'}`} style={{ fontFamily: "'Space Grotesk', sans-serif", borderBottom: i < 3 ? '1px solid rgba(255,179,71,0.08)' : 'none' }} onClick={() => setContextMenu(null)}>
              {item}
            </button>
          ))}
        </div>
      )}

      <header className="h-20 flex items-center justify-between px-8 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255, 179, 71, 0.15)', background: 'rgba(13,11,10,0.9)' }}>
        <div className="relative w-[400px]">
          <i className="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search customers by name, phone, or email..."
            className="w-full text-white text-sm py-2.5 pl-10 pr-12 focus:outline-none transition-all placeholder-gray-600"
            style={{
              background: '#050404',
              border: searchTerm ? '1px solid #FFB347' : '1px solid rgba(255, 179, 71, 0.15)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '13px',
              borderRadius: '0',
              outline: 'none',
            }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace" }}>⌘K</div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-green-400 tracking-wider" style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", background: 'rgba(76,175,80,0.05)', border: '1px solid rgba(76,175,80,0.2)', padding: '6px 12px' }}>
            <div className="w-1.5 h-1.5 bg-green-400" style={{ boxShadow: '0 0 8px rgba(76,175,80,0.8)' }}></div>
            CONNECTED ✓
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="font-bold px-6 py-2.5 rounded-full flex items-center gap-2 transition-colors"
            style={{ background: '#FFB347', color: '#0D0B0A', boxShadow: '0 0 15px rgba(255,179,71,0.2)', fontFamily: "'Space Grotesk', sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.background = '#E69A33'; e.currentTarget.style.boxShadow = '0 0 20px rgba(255,179,71,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FFB347'; e.currentTarget.style.boxShadow = '0 0 15px rgba(255,179,71,0.2)'; }}
          >
            <i className="ph ph-plus-bold"></i>
            Add Customer
          </button>
        </div>
      </header>

      <div className="flex-1 p-8 overflow-auto relative">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Customer Database</h1>
            <div className="flex items-center gap-4" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#6b7280' }}>
              <span>TOTAL_RECORDS: {customers.length.toLocaleString()}</span>
              <span style={{ color: 'rgba(255, 179, 71, 0.15)' }}>|</span>
              <span style={{ color: 'rgba(255, 179, 71, 0.8)' }}>ACTIVE_LAST_30D: 142</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="text-sm flex items-center gap-2 transition-colors text-gray-400 hover:text-white" style={{ background: 'rgba(255, 179, 71, 0.05)', border: '1px solid rgba(255, 179, 71, 0.15)', padding: '6px 12px', fontFamily: "'JetBrains Mono', monospace" }}
              onMouseEnter={e => e.currentTarget.style.border = '1px solid rgba(255, 179, 71, 0.4)'}
              onMouseLeave={e => e.currentTarget.style.border = '1px solid rgba(255, 179, 71, 0.15)'}
            >
              <i className="ph ph-funnel"></i> FILTER
            </button>
            <button onClick={handleExport} className="text-sm flex items-center gap-2 transition-colors text-gray-400 hover:text-white" style={{ background: 'rgba(255, 179, 71, 0.05)', border: '1px solid rgba(255, 179, 71, 0.15)', padding: '6px 12px', fontFamily: "'JetBrains Mono', monospace" }}
              onMouseEnter={e => e.currentTarget.style.border = '1px solid rgba(255, 179, 71, 0.4)'}
              onMouseLeave={e => e.currentTarget.style.border = '1px solid rgba(255, 179, 71, 0.15)'}
            >
              <i className="ph ph-download-simple"></i> EXPORT
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden" style={{ background: 'rgba(255, 179, 71, 0.05)', border: '1px solid rgba(255, 179, 71, 0.15)' }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 179, 71, 0.15)', background: 'rgba(5, 4, 4, 0.5)' }}>
                {[
                  { label: 'Name', cls: 'w-1/4' },
                  { label: 'Email', cls: 'w-1/4' },
                  { label: 'Phone', cls: 'w-1/5' },
                  { label: 'Vehicles', cls: 'w-[10%] text-right' },
                  { label: 'Bookings', cls: 'w-[10%] text-right' },
                  { label: '', cls: 'w-12' },
                ].map((col, i) => (
                  <th key={i} className={`py-4 px-6 font-medium uppercase ${col.cls}`} style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '11px', letterSpacing: '0.15em', color: '#6b7280' }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-600" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>
                    NO_RECORDS_FOUND // QUERY: "{searchTerm}"
                  </td>
                </tr>
              ) : (
                paginated.map((customer, index) => (
                  <CustomerRow
                    key={customer.id}
                    customer={customer}
                    isLast={index === paginated.length - 1}
                    onMenuClick={(c) => setContextMenu({ customer: c, x: window.innerWidth / 2, y: window.innerHeight / 2 })}
                  />
                ))
              )}
            </tbody>
          </table>

          <div className="flex items-center justify-between p-4" style={{ borderTop: '1px solid rgba(255, 179, 71, 0.15)', background: 'rgba(5, 4, 4, 0.5)' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#6b7280' }}>
              SHOWING {filtered.length === 0 ? '0' : `${(safePage - 1) * PAGE_SIZE + 1}-${Math.min(safePage * PAGE_SIZE, filtered.length)}`} OF {filtered.length.toLocaleString()}
            </div>
            <div className="flex gap-1">
              <button
                disabled={safePage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="w-8 h-8 flex items-center justify-center transition-colors"
                style={{
                  border: '1px solid rgba(255, 179, 71, 0.15)',
                  background: 'rgba(255, 179, 71, 0.05)',
                  color: safePage === 1 ? '#374151' : '#9ca3af',
                  cursor: safePage === 1 ? 'not-allowed' : 'pointer',
                  opacity: safePage === 1 ? 0.5 : 1,
                }}
              >
                <i className="ph ph-caret-left"></i>
              </button>
              {visiblePages.map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className="w-8 h-8 flex items-center justify-center transition-colors"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '12px',
                    border: safePage === p ? '1px solid #FFB347' : '1px solid rgba(255, 179, 71, 0.15)',
                    background: safePage === p ? 'rgba(255, 179, 71, 0.1)' : 'rgba(255, 179, 71, 0.05)',
                    color: safePage === p ? '#FFB347' : '#9ca3af',
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={safePage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="w-8 h-8 flex items-center justify-center transition-colors"
                style={{
                  border: '1px solid rgba(255, 179, 71, 0.15)',
                  background: 'rgba(255, 179, 71, 0.05)',
                  color: safePage === totalPages ? '#374151' : '#9ca3af',
                  cursor: safePage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: safePage === totalPages ? 0.5 : 1,
                }}
              >
                <i className="ph ph-caret-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

const PlaceholderPage = ({ title }) => (
  <main className="flex-1 flex flex-col z-20 relative overflow-hidden items-center justify-center" style={{ background: 'rgba(13,11,10,0.4)' }}>
    <div className="text-center">
      <div className="text-yellow-400 text-4xl mb-4 opacity-30" style={{ fontFamily: "'JetBrains Mono', monospace" }}>404</div>
      <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h2>
      <div className="text-gray-600" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', letterSpacing: '0.15em' }}>MODULE_NOT_YET_LOADED //</div>
    </div>
  </main>
);

const App = () => {
  const [activeNav, setActiveNav] = useState('customers');

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = customStyles.scrollbar + `
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
    `;
    document.head.appendChild(style);

    const phosphorScript = document.createElement('script');
    phosphorScript.src = 'https://unpkg.com/@phosphor-icons/web';
    document.head.appendChild(phosphorScript);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const renderPage = () => {
    switch (activeNav) {
      case 'customers': return <CustomersPage />;
      case 'bookings': return <PlaceholderPage title="Bookings" />;
      case 'services': return <PlaceholderPage title="Services" />;
      case 'settings': return <PlaceholderPage title="Settings" />;
      default: return <CustomersPage />;
    }
  };

  return (
    <Router basename="/">
      <div className="text-white h-screen w-screen overflow-hidden flex relative selection:text-black" style={{ background: '#0D0B0A', fontFamily: "'Space Grotesk', sans-serif", userSelect: 'none', WebkitUserSelect: 'none' }}>
        <div className="absolute inset-0 z-0 pointer-events-none" style={customStyles.ambientArc}></div>
        <div className="absolute inset-0 z-0 pointer-events-none" style={customStyles.ambientArcBottom}></div>
        <div className="absolute inset-0 z-50 pointer-events-none" style={customStyles.bgNoise}></div>
        <div className="absolute inset-0 z-40 pointer-events-none opacity-30" style={customStyles.scanlines}></div>

        <div className="fixed top-4 left-4 z-10 pointer-events-none" style={{ fontSize: '10px', color: 'rgba(255, 179, 71, 0.3)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em' }}>SYS.CORE // ON-LINE</div>
        <div className="fixed bottom-4 right-4 z-10 pointer-events-none" style={{ fontSize: '10px', color: 'rgba(255, 179, 71, 0.3)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em' }}>UPLINK_ESTABLISHED_</div>

        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
        {renderPage()}
      </div>
    </Router>
  );
};

export default App;