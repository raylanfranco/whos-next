import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

const customStyles = {
  scrollbar: `
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #0D0B0A; border-left: 1px solid rgba(255, 179, 71, 0.1); }
    ::-webkit-scrollbar-thumb { background: rgba(255, 179, 71, 0.2); border-radius: 0px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255, 179, 71, 0.4); }
    .service-row { transition: all 0.2s ease; }
    .service-row:hover { transform: translateY(-1px); background-color: rgba(255, 179, 71, 0.06); box-shadow: inset 0 0 0 1px rgba(255, 179, 71, 0.4), 0 4px 20px rgba(0,0,0,0.5); z-index: 10; }
    .bg-grid { background-size: 40px 40px; background-image: linear-gradient(to right, rgba(255, 179, 71, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 179, 71, 0.02) 1px, transparent 1px); }
    .action-btns { opacity: 0; transition: opacity 0.2s; }
    .service-row:hover .action-btns { opacity: 1; }
  `
};

const initialServices = [
  {
    id: 1,
    name: 'Full Synthetic Oil Change',
    description: 'High-performance synthetic oil replacement and filter change.',
    icon: 'ph-engine',
    category: 'Maintenance',
    duration: '45m',
    price: '$85.00',
    status: 'Active',
    isDraft: false,
  },
  {
    id: 2,
    name: 'Custom Half-Sleeve Session',
    description: 'Custom design consultation, linework and initial shading.',
    icon: 'ph-pen-nib',
    category: 'Tattoo',
    duration: '04h 00m',
    price: '$600.00',
    status: 'Active',
    isDraft: false,
  },
  {
    id: 3,
    name: 'Tire Mount & Balance',
    description: 'Install and dynamically balance single motorcycle tire.',
    icon: 'ph-gear-fine',
    category: 'Service',
    duration: '30m',
    price: '$45.00',
    status: 'Active',
    isDraft: false,
  },
  {
    id: 4,
    name: 'Diagnostic Scan',
    description: 'Comprehensive ECU system scan and error code report.',
    icon: 'ph-desktop',
    category: 'Diagnostic',
    duration: '01h 00m',
    price: '$120.00',
    status: 'Active',
    isDraft: false,
  },
  {
    id: 5,
    name: 'Walk-in Piercing',
    description: 'Standard lobe or simple cartilage piercing setup.',
    icon: 'ph-drop',
    category: 'Piercing',
    duration: '15m',
    price: '$40.00',
    status: 'Draft',
    isDraft: true,
  },
  {
    id: 6,
    name: 'Premium Detailing',
    description: 'Full exterior wash, wax, and interior deep clean.',
    icon: 'ph-sparkle',
    category: 'Detailing',
    duration: '02h 30m',
    price: '$150.00',
    status: 'Active',
    isDraft: false,
  },
];

const AddServiceModal = ({ isOpen, onClose, onAdd }) => {
  const [form, setForm] = useState({ name: '', description: '', category: '', duration: '', price: '', status: 'Active' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.category.trim()) e.category = 'Category is required';
    if (!form.duration.trim()) e.duration = 'Duration is required';
    if (!form.price.trim()) e.price = 'Price is required';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onAdd({ ...form, id: Date.now(), icon: 'ph-wrench', isDraft: form.status === 'Draft' });
    setForm({ name: '', description: '', category: '', duration: '', price: '', status: 'Active' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="bg-[#0D0B0A] border border-[rgba(255,179,71,0.15)] w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,179,71,0.15)]">
          <h2 className="text-white font-bold text-lg tracking-wide">ADD SERVICE</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <i className="ph ph-x text-xl"></i>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block font-mono text-[10px] text-[rgba(255,179,71,0.7)] uppercase tracking-widest mb-1">Service Name</label>
            <input
              className="w-full bg-black/50 border border-[rgba(255,179,71,0.15)] px-3 py-2 text-white text-sm outline-none focus:border-[rgba(255,179,71,0.5)] transition-colors"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Full Synthetic Oil Change"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block font-mono text-[10px] text-[rgba(255,179,71,0.7)] uppercase tracking-widest mb-1">Description</label>
            <input
              className="w-full bg-black/50 border border-[rgba(255,179,71,0.15)] px-3 py-2 text-white text-sm outline-none focus:border-[rgba(255,179,71,0.5)] transition-colors"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Short description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10px] text-[rgba(255,179,71,0.7)] uppercase tracking-widest mb-1">Category</label>
              <input
                className="w-full bg-black/50 border border-[rgba(255,179,71,0.15)] px-3 py-2 text-white text-sm outline-none focus:border-[rgba(255,179,71,0.5)] transition-colors"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Maintenance"
              />
              {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className="block font-mono text-[10px] text-[rgba(255,179,71,0.7)] uppercase tracking-widest mb-1">Duration</label>
              <input
                className="w-full bg-black/50 border border-[rgba(255,179,71,0.15)] px-3 py-2 text-white text-sm outline-none focus:border-[rgba(255,179,71,0.5)] transition-colors"
                value={form.duration}
                onChange={e => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g. 45m"
              />
              {errors.duration && <p className="text-red-400 text-xs mt-1">{errors.duration}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10px] text-[rgba(255,179,71,0.7)] uppercase tracking-widest mb-1">Price</label>
              <input
                className="w-full bg-black/50 border border-[rgba(255,179,71,0.15)] px-3 py-2 text-white text-sm outline-none focus:border-[rgba(255,179,71,0.5)] transition-colors"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder="e.g. $85.00"
              />
              {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block font-mono text-[10px] text-[rgba(255,179,71,0.7)] uppercase tracking-widest mb-1">Status</label>
              <select
                className="w-full bg-black/50 border border-[rgba(255,179,71,0.15)] px-3 py-2 text-white text-sm outline-none focus:border-[rgba(255,179,71,0.5)] transition-colors"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 border border-white/10 hover:text-white hover:border-white/30 transition-colors font-medium">
            Cancel
          </button>
          <button onClick={handleSubmit} className="bg-[#FFB347] hover:bg-[#ffbe61] text-[#0D0B0A] font-bold px-5 py-2 text-sm flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(255,179,71,0.2)]">
            <i className="ph ph-plus-bold"></i>
            Add Service
          </button>
        </div>
      </div>
    </div>
  );
};

const EditServiceModal = ({ isOpen, service, onClose, onSave }) => {
  const [form, setForm] = useState({ name: '', description: '', category: '', duration: '', price: '', status: 'Active' });

  useEffect(() => {
    if (service) {
      setForm({
        name: service.name,
        description: service.description,
        category: service.category,
        duration: service.duration,
        price: service.price,
        status: service.status,
      });
    }
  }, [service]);

  const handleSubmit = () => {
    onSave({ ...service, ...form, isDraft: form.status === 'Draft' });
    onClose();
  };

  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="bg-[#0D0B0A] border border-[rgba(255,179,71,0.15)] w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,179,71,0.15)]">
          <h2 className="text-white font-bold text-lg tracking-wide">EDIT SERVICE</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <i className="ph ph-x text-xl"></i>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block font-mono text-[10px] text-[rgba(255,179,71,0.7)] uppercase tracking-widest mb-1">Service Name</label>
            <input
              className="w-full bg-black/50 border border-[rgba(255,179,71,0.15)] px-3 py-2 text-white text-sm outline-none focus:border-[rgba(255,179,71,0.5)] transition-colors"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-[rgba(255,179,71,0.7)] uppercase tracking-widest mb-1">Description</label>
            <input
              className="w-full bg-black/50 border border-[rgba(255,179,71,0.15)] px-3 py-2 text-white text-sm outline-none focus:border-[rgba(255,179,71,0.5)] transition-colors"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10px] text-[rgba(255,179,71,0.7)] uppercase tracking-widest mb-1">Category</label>
              <input
                className="w-full bg-black/50 border border-[rgba(255,179,71,0.15)] px-3 py-2 text-white text-sm outline-none focus:border-[rgba(255,179,71,0.5)] transition-colors"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] text-[rgba(255,179,71,0.7)] uppercase tracking-widest mb-1">Duration</label>
              <input
                className="w-full bg-black/50 border border-[rgba(255,179,71,0.15)] px-3 py-2 text-white text-sm outline-none focus:border-[rgba(255,179,71,0.5)] transition-colors"
                value={form.duration}
                onChange={e => setForm({ ...form, duration: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10px] text-[rgba(255,179,71,0.7)] uppercase tracking-widest mb-1">Price</label>
              <input
                className="w-full bg-black/50 border border-[rgba(255,179,71,0.15)] px-3 py-2 text-white text-sm outline-none focus:border-[rgba(255,179,71,0.5)] transition-colors"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] text-[rgba(255,179,71,0.7)] uppercase tracking-widest mb-1">Status</label>
              <select
                className="w-full bg-black/50 border border-[rgba(255,179,71,0.15)] px-3 py-2 text-white text-sm outline-none focus:border-[rgba(255,179,71,0.5)] transition-colors"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 border border-white/10 hover:text-white hover:border-white/30 transition-colors font-medium">
            Cancel
          </button>
          <button onClick={handleSubmit} className="bg-[#FFB347] hover:bg-[#ffbe61] text-[#0D0B0A] font-bold px-5 py-2 text-sm flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(255,179,71,0.2)]">
            <i className="ph ph-floppy-disk-bold"></i>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ isOpen, service, onClose, onConfirm }) => {
  if (!isOpen || !service) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="bg-[#0D0B0A] border border-[rgba(255,179,71,0.15)] w-full max-w-sm mx-4 shadow-2xl">
        <div className="px-6 py-5 border-b border-[rgba(255,179,71,0.15)]">
          <h2 className="text-white font-bold text-lg tracking-wide">DELETE SERVICE</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-400 text-sm">Are you sure you want to delete <span className="text-white font-semibold">"{service.name}"</span>? This action cannot be undone.</p>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 border border-white/10 hover:text-white hover:border-white/30 transition-colors font-medium">
            Cancel
          </button>
          <button onClick={() => { onConfirm(service.id); onClose(); }} className="bg-red-500 hover:bg-red-400 text-white font-bold px-5 py-2 text-sm flex items-center gap-2 transition-colors">
            <i className="ph ph-trash-bold"></i>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ServiceRow = ({ service, onEdit, onDelete }) => {
  const isDraft = service.isDraft;
  return (
    <tr className={`service-row group relative bg-transparent${isDraft ? ' opacity-60 hover:opacity-100' : ''}`}>
      <td className="py-4 px-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 bg-black flex items-center justify-center border shrink-0 ${isDraft ? 'border-white/10' : 'border-[rgba(255,179,71,0.15)]'}`}>
            <i className={`ph ${service.icon} text-xl ${isDraft ? 'text-gray-500' : 'text-[rgba(255,179,71,0.5)]'}`}></i>
          </div>
          <div>
            <div className={`font-semibold text-base mb-0.5 ${isDraft ? 'text-gray-300' : 'text-white'}`}>{service.name}</div>
            <div className={`text-xs font-sans line-clamp-1 ${isDraft ? 'text-gray-600' : 'text-gray-500'}`}>{service.description}</div>
          </div>
        </div>
      </td>
      <td className="py-4 px-6">
        <span className={`bg-white/5 border border-white/10 px-2 py-1 text-xs rounded-none ${isDraft ? 'text-gray-400' : 'text-gray-300'}`}>{service.category}</span>
      </td>
      <td className={`py-4 px-6 font-mono ${isDraft ? 'text-gray-500' : 'text-gray-300'}`}>{service.duration}</td>
      <td className={`py-4 px-6 font-mono ${isDraft ? 'text-gray-400' : 'text-white'}`}>{service.price}</td>
      <td className="py-4 px-6">
        {isDraft ? (
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full border border-gray-600 bg-gray-800/50 text-gray-400 text-xs font-medium">
            Draft
          </span>
        ) : (
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full border border-[rgba(255,179,71,0.5)] bg-[rgba(255,179,71,0.1)] text-[#FFB347] text-xs font-medium">
            Active
          </span>
        )}
      </td>
      <td className="py-4 px-6 text-right">
        <div className="action-btns flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(service)}
            className="w-8 h-8 flex items-center justify-center rounded-none bg-black/50 border border-white/10 text-gray-400 hover:text-[#FFB347] hover:border-[rgba(255,179,71,0.5)] transition-colors"
          >
            <i className="ph ph-pencil-simple text-lg"></i>
          </button>
          <button
            onClick={() => onDelete(service)}
            className="w-8 h-8 flex items-center justify-center rounded-none bg-black/50 border border-white/10 text-gray-400 hover:text-red-400 hover:border-red-400/50 transition-colors"
          >
            <i className="ph ph-trash text-lg"></i>
          </button>
        </div>
      </td>
    </tr>
  );
};

const ServicesPage = () => {
  const [services, setServices] = useState(initialServices);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleAdd = (newService) => {
    setServices(prev => [...prev, newService]);
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setEditModalOpen(true);
  };

  const handleSave = (updated) => {
    setServices(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const handleDeletePrompt = (service) => {
    setSelectedService(service);
    setDeleteModalOpen(true);
  };

  const handleDelete = (id) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col z-10 relative h-full">
      <header className="h-20 border-b border-[rgba(255,179,71,0.15)] bg-[rgba(13,11,10,0.8)] backdrop-blur-md px-8 flex items-center justify-between shrink-0">
        <h1 className="text-2xl font-bold text-white tracking-wide">SERVICES</h1>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-[#0D0B0A] border border-[rgba(74,222,128,0.2)] px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" style={{ boxShadow: '0 0 8px rgba(74,222,128,0.6)' }}></div>
            <span className="font-mono text-[11px] text-[#4ADE80] uppercase tracking-wider">
              Connected <i className="ph ph-check ml-1"></i>
            </span>
          </div>
          <button
            onClick={() => setAddModalOpen(true)}
            className="bg-[#FFB347] hover:bg-[#ffbe61] text-[#0D0B0A] font-bold px-5 py-2.5 rounded-full text-sm flex items-center gap-2 transition-colors"
            style={{ boxShadow: '0 0 15px rgba(255,179,71,0.2)' }}
          >
            <i className="ph ph-plus-bold"></i>
            Add Service
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-8">
        <div className="bg-[rgba(255,179,71,0.05)] backdrop-blur-md border border-[rgba(255,179,71,0.15)] max-w-7xl mx-auto shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[rgba(255,179,71,0.15)] bg-black/40">
                <th className="py-4 px-6 font-mono text-xs text-[rgba(255,179,71,0.7)] uppercase tracking-widest font-normal w-[40%]">Service</th>
                <th className="py-4 px-6 font-mono text-xs text-[rgba(255,179,71,0.7)] uppercase tracking-widest font-normal">Category</th>
                <th className="py-4 px-6 font-mono text-xs text-[rgba(255,179,71,0.7)] uppercase tracking-widest font-normal">Duration</th>
                <th className="py-4 px-6 font-mono text-xs text-[rgba(255,179,71,0.7)] uppercase tracking-widest font-normal">Price</th>
                <th className="py-4 px-6 font-mono text-xs text-[rgba(255,179,71,0.7)] uppercase tracking-widest font-normal">Status</th>
                <th className="py-4 px-6 font-mono text-xs text-[rgba(255,179,71,0.7)] uppercase tracking-widest font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,179,71,0.075)] text-sm">
              {services.map(service => (
                <ServiceRow
                  key={service.id}
                  service={service}
                  onEdit={handleEdit}
                  onDelete={handleDeletePrompt}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="max-w-7xl mx-auto mt-6 flex justify-between items-center text-gray-500 font-mono text-xs">
          <span>Total Services: <span className="text-white">{services.length}</span></span>
          <span>DATA.SYNC_STATUS: <span className="text-[#4ADE80]">OK</span></span>
        </div>
      </div>

      <AddServiceModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onAdd={handleAdd} />
      <EditServiceModal isOpen={editModalOpen} service={selectedService} onClose={() => setEditModalOpen(false)} onSave={handleSave} />
      <DeleteConfirmModal isOpen={deleteModalOpen} service={selectedService} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDelete} />
    </div>
  );
};

const Sidebar = ({ activeNav, setActiveNav }) => {
  const navItems = [
    { key: 'bookings', icon: 'ph-calendar-blank', label: 'Bookings' },
    { key: 'services', icon: 'ph-wrench', label: 'Services' },
    { key: 'customers', icon: 'ph-users', label: 'Customers' },
    { key: 'settings', icon: 'ph-sliders-horizontal', label: 'Settings' },
  ];

  return (
    <aside className="w-[260px] border-r border-[rgba(255,179,71,0.15)] bg-[rgba(13,11,10,0.8)] backdrop-blur-md flex flex-col justify-between z-20 relative">
      <div>
        <div className="h-20 px-6 flex items-center border-b border-[rgba(255,179,71,0.15)]">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[#FFB347] text-[#0D0B0A] flex items-center justify-center rounded-sm font-bold font-mono text-sm">B</div>
            <span className="font-bold text-xl text-white tracking-wide">BayReady</span>
          </div>
        </div>
        <nav className="p-4 space-y-1 mt-4">
          {navItems.map(item => (
            <div key={item.key} className="relative">
              {activeNav === item.key && (
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#FFB347]"></div>
              )}
              <button
                onClick={() => setActiveNav(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-none group ${
                  activeNav === item.key
                    ? 'text-[#FFB347] bg-[rgba(255,179,71,0.05)]'
                    : 'text-gray-400 hover:text-white hover:bg-[rgba(255,179,71,0.05)]'
                }`}
              >
                <i className={`ph ${item.icon} text-lg ${activeNav !== item.key ? 'group-hover:text-[#FFB347] transition-colors' : ''}`}></i>
                {item.label}
              </button>
            </div>
          ))}
        </nav>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 opacity-60">
          <i className="ph-fill ph-lightning text-[#FFB347] text-sm"></i>
          <span className="font-mono text-[10px] text-[#FFB347] tracking-widest uppercase">Powered by BayReady</span>
        </div>
      </div>
    </aside>
  );
};

const PlaceholderPage = ({ title }) => (
  <div className="flex-1 flex flex-col z-10 relative h-full">
    <header className="h-20 border-b border-[rgba(255,179,71,0.15)] bg-[rgba(13,11,10,0.8)] backdrop-blur-md px-8 flex items-center justify-between shrink-0">
      <h1 className="text-2xl font-bold text-white tracking-wide">{title.toUpperCase()}</h1>
    </header>
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="text-[rgba(255,179,71,0.2)] font-mono text-sm uppercase tracking-widest mb-2">MODULE</div>
        <div className="text-white font-bold text-3xl tracking-wide mb-4">{title}</div>
        <div className="text-gray-600 font-mono text-xs tracking-widest">COMING_SOON //</div>
      </div>
    </div>
  </div>
);

const App = () => {
  const [activeNav, setActiveNav] = useState('services');

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = customStyles.scrollbar;
    document.head.appendChild(style);

    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    const phosphorScript = document.createElement('script');
    phosphorScript.src = 'https://unpkg.com/@phosphor-icons/web';
    document.head.appendChild(phosphorScript);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const ambientGlow = {
    background: 'radial-gradient(circle at 70% 30%, rgba(255, 179, 71, 0.03) 0%, transparent 60%)'
  };

  const gridBg = {
    backgroundSize: '40px 40px',
    backgroundImage: 'linear-gradient(to right, rgba(255, 179, 71, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 179, 71, 0.02) 1px, transparent 1px)'
  };

  const fontStyle = {
    fontFamily: '"Space Grotesk", sans-serif'
  };

  return (
    <div
      className="bg-[#0D0B0A] text-gray-300 h-screen w-screen overflow-hidden flex relative"
      style={{ ...fontStyle, userSelect: 'none' }}
    >
      <div className="absolute inset-0 pointer-events-none z-0" style={ambientGlow}></div>
      <div className="absolute inset-0 bg-grid pointer-events-none z-0" style={gridBg}></div>

      <div
        className="absolute top-[-20%] right-[-10%] w-[80vw] h-[80vw] rounded-full border border-[rgba(255,179,71,0.05)] opacity-30 pointer-events-none z-0"
        style={{ boxShadow: 'inset 0 0 100px rgba(255,179,71,0.02)' }}
      ></div>
      <div className="absolute top-[10%] right-[10%] w-[40vw] h-[40vw] rounded-full border border-[rgba(255,179,71,0.1)] opacity-20 pointer-events-none z-0"></div>

      <div className="fixed top-4 left-6 font-mono text-[10px] text-[rgba(255,179,71,0.3)] tracking-[0.2em] z-0 pointer-events-none uppercase" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
        SYS.CORE // ON-LINE
      </div>
      <div className="fixed bottom-4 right-6 font-mono text-[10px] text-[rgba(255,179,71,0.3)] tracking-[0.2em] z-0 pointer-events-none uppercase" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
        UPLINK_ESTABLISHED_
      </div>

      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />

      {activeNav === 'services' && <ServicesPage />}
      {activeNav === 'bookings' && <PlaceholderPage title="Bookings" />}
      {activeNav === 'customers' && <PlaceholderPage title="Customers" />}
      {activeNav === 'settings' && <PlaceholderPage title="Settings" />}
    </div>
  );
};

export default App;