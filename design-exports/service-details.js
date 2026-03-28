import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const customStyles = {
  bgBase: '#0D0B0A',
  accent: '#FFB347',
  accentGlow: 'rgba(255, 179, 71, 0.15)',
};

const globalStyles = `
  :root {
    --bg-base: #0D0B0A;
    --accent: #FFB347;
    --accent-glow: rgba(255, 179, 71, 0.15);
  }
  body {
    background-color: #0D0B0A;
    font-family: 'Space Grotesk', sans-serif;
    color: #E2E8F0;
  }
  .font-mono-custom {
    font-family: 'JetBrains Mono', monospace;
  }
  .glass-panel {
    background: rgba(255, 179, 71, 0.03);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 179, 71, 0.15);
  }
  .glass-panel:hover {
    border-color: rgba(255, 179, 71, 0.3);
    background: rgba(255, 179, 71, 0.05);
  }
  .ambient-arc {
    position: fixed;
    border-radius: 50%;
    border: 1px solid rgba(255, 179, 71, 0.03);
    pointer-events: none;
    z-index: 0;
  }
  .arc-1 { width: 140vw; height: 140vw; top: -50vw; left: -20vw; }
  .arc-2 { width: 100vw; height: 100vw; top: -30vw; left: -10vw; border-color: rgba(255, 179, 71, 0.05); }
  .arc-3 { width: 60vw; height: 60vw; top: -10vw; left: 10vw; border-color: rgba(255, 179, 71, 0.02); }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #0D0B0A; }
  ::-webkit-scrollbar-thumb { background: rgba(255, 179, 71, 0.2); border-radius: 0; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255, 179, 71, 0.4); }
  .tech-hover:hover { text-shadow: 0 0 8px rgba(255, 179, 71, 0.15); }
  ::selection { background: #FFB347; color: #0D0B0A; }
`;

const DragIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
    <circle cx="9" cy="12" r="1" /><circle cx="9" cy="5" r="1" /><circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="12" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="19" r="1" />
  </svg>
);

const EditIcon = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const QuestionRow = ({ question, type, required, onEdit, onDelete }) => (
  <div className="glass-panel flex items-center p-4 group transition-all duration-200 hover:-translate-y-[1px]">
    <div className="px-2 text-gray-600 cursor-grab opacity-40 group-hover:opacity-100 group-hover:text-[#FFB347] transition-all">
      <DragIcon />
    </div>
    <div className="flex-1 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <span className="text-gray-200 font-medium tracking-wide">{question}</span>
        {required && (
          <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded text-[9px] font-mono-custom border border-red-500/20">REQ</span>
        )}
      </div>
      <span className="bg-[#0D0B0A] border border-gray-700 text-gray-400 px-3 py-1 rounded-full text-[10px] font-mono-custom uppercase tracking-widest shadow-inner">
        {type}
      </span>
    </div>
    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pr-2 border-l border-[#FFB347]/10 pl-4">
      <button onClick={onEdit} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#FFB347] hover:bg-[#FFB347]/10 transition-colors">
        <EditIcon />
      </button>
      <button onClick={onDelete} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors">
        <TrashIcon />
      </button>
    </div>
  </div>
);

const EditServiceModal = ({ isOpen, onClose, service, onSave }) => {
  const [formData, setFormData] = useState({ ...service });

  useEffect(() => {
    setFormData({ ...service });
  }, [service]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0D0B0A] border border-[#FFB347]/30 p-8 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold uppercase tracking-wider text-gray-100">Edit Service</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-[#FFB347] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[10px] text-[#FFB347]/60 font-mono-custom tracking-widest uppercase block mb-2">Service Name</label>
            <input
              className="w-full bg-[#FFB347]/5 border border-[#FFB347]/20 text-gray-100 px-4 py-3 text-sm focus:outline-none focus:border-[#FFB347]/50 tracking-wide"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] text-[#FFB347]/60 font-mono-custom tracking-widest uppercase block mb-2">Category</label>
            <input
              className="w-full bg-[#FFB347]/5 border border-[#FFB347]/20 text-gray-100 px-4 py-3 text-sm focus:outline-none focus:border-[#FFB347]/50 tracking-wide"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] text-[#FFB347]/60 font-mono-custom tracking-widest uppercase block mb-2">Description</label>
            <textarea
              rows={4}
              className="w-full bg-[#FFB347]/5 border border-[#FFB347]/20 text-gray-100 px-4 py-3 text-sm focus:outline-none focus:border-[#FFB347]/50 tracking-wide resize-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-[10px] text-[#FFB347]/60 font-mono-custom tracking-widest uppercase block mb-2">Duration</label>
              <input
                className="w-full bg-[#FFB347]/5 border border-[#FFB347]/20 text-gray-100 px-4 py-3 text-sm focus:outline-none focus:border-[#FFB347]/50 tracking-wide"
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-[#FFB347]/60 font-mono-custom tracking-widest uppercase block mb-2">Base Price</label>
              <input
                className="w-full bg-[#FFB347]/5 border border-[#FFB347]/20 text-gray-100 px-4 py-3 text-sm focus:outline-none focus:border-[#FFB347]/50 tracking-wide"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => { onSave(formData); onClose(); }}
              className="flex-1 bg-[#FFB347] text-[#0D0B0A] py-3 font-mono-custom text-sm font-bold uppercase tracking-widest hover:bg-white transition-all duration-200"
            >
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="flex-1 border border-[#FFB347]/30 text-gray-400 py-3 font-mono-custom text-sm uppercase tracking-widest hover:border-[#FFB347]/60 hover:text-gray-200 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddQuestionModal = ({ isOpen, onClose, onAdd }) => {
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('Short Text');
  const [isRequired, setIsRequired] = useState(false);

  const handleAdd = () => {
    if (!questionText.trim()) return;
    onAdd({ question: questionText, type: questionType, required: isRequired });
    setQuestionText('');
    setQuestionType('Short Text');
    setIsRequired(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0D0B0A] border border-[#FFB347]/30 p-8 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold uppercase tracking-wider text-gray-100">Add Question</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-[#FFB347] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[10px] text-[#FFB347]/60 font-mono-custom tracking-widest uppercase block mb-2">Question</label>
            <input
              className="w-full bg-[#FFB347]/5 border border-[#FFB347]/20 text-gray-100 px-4 py-3 text-sm focus:outline-none focus:border-[#FFB347]/50 tracking-wide"
              placeholder="Enter your question..."
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] text-[#FFB347]/60 font-mono-custom tracking-widest uppercase block mb-2">Type</label>
            <select
              className="w-full bg-[#FFB347]/5 border border-[#FFB347]/20 text-gray-100 px-4 py-3 text-sm focus:outline-none focus:border-[#FFB347]/50 tracking-wide"
              value={questionType}
              onChange={e => setQuestionType(e.target.value)}
              style={{ backgroundColor: '#1a1714' }}
            >
              <option>Short Text</option>
              <option>Long Text</option>
              <option>Multiple Choice</option>
              <option>Yes / No</option>
              <option>Number</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRequired(!isRequired)}
              className={`w-5 h-5 border flex items-center justify-center transition-all ${isRequired ? 'bg-[#FFB347] border-[#FFB347]' : 'border-gray-600 hover:border-[#FFB347]/50'}`}
            >
              {isRequired && (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0D0B0A" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
            <span className="text-gray-400 text-sm">Mark as required</span>
          </div>
          <div className="flex gap-3 mt-2">
            <button
              onClick={handleAdd}
              className="flex-1 bg-[#FFB347] text-[#0D0B0A] py-3 font-mono-custom text-sm font-bold uppercase tracking-widest hover:bg-white transition-all duration-200"
            >
              Add Question
            </button>
            <button
              onClick={onClose}
              className="flex-1 border border-[#FFB347]/30 text-gray-400 py-3 font-mono-custom text-sm uppercase tracking-widest hover:border-[#FFB347]/60 hover:text-gray-200 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ activePage, onNavigate }) => {
  const navItems = [
    {
      id: 'bookings', label: 'Bookings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="group-hover:text-[#FFB347] transition-colors">
          <rect x="3" y="4" width="18" height="18" rx="0" ry="0" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    },
    {
      id: 'services', label: 'Services',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      )
    },
    {
      id: 'customers', label: 'Customers',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="group-hover:text-[#FFB347] transition-colors">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      id: 'settings', label: 'Settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="group-hover:text-[#FFB347] transition-colors">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    },
  ];

  return (
    <aside className="w-[260px] h-full border-r border-[#FFB347]/10 bg-[#0D0B0A]/90 backdrop-blur-md z-20 flex flex-col relative shrink-0">
      <div className="h-20 flex items-center px-6 border-b border-[#FFB347]/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FFB347] flex items-center justify-center text-[#0D0B0A]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-wider text-gray-100 uppercase">Bay<span className="text-[#FFB347]">Ready</span></span>
        </div>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center gap-4 px-4 py-3 border-l-2 transition-all group w-full text-left ${
              activePage === item.id
                ? 'text-[#FFB347] bg-[#FFB347]/10 border-[#FFB347]'
                : 'text-gray-500 hover:text-gray-200 hover:bg-[#FFB347]/5 border-transparent'
            }`}
          >
            {item.icon}
            <span className="font-medium tracking-wide uppercase text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-[#FFB347]/10">
        <div className="flex items-center gap-2 text-[#FFB347]/70 text-[11px] font-mono-custom uppercase tracking-widest">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span>Powered by BayReady</span>
        </div>
      </div>
    </aside>
  );
};

const ServiceDetailPage = () => {
  const [service, setService] = useState({
    name: 'Full Engine Rebuild',
    category: 'Heavy Repair',
    description: 'Complete teardown, inspection, and rebuilding of the engine block. Includes replacement of all gaskets, seals, rings, and bearings. Machining services outsourced if necessary (billed separately). Final dyno testing included to ensure optimal performance metrics.',
    duration: '14 DAYS',
    price: '$4,500.00',
    status: 'ACTIVE',
  });

  const [questions, setQuestions] = useState([
    { id: 1, question: 'What is the exact year, make, and model of the motorcycle?', type: 'Short Text', required: true },
    { id: 2, question: 'Are there any known aftermarket engine modifications?', type: 'Multiple Choice', required: false },
  ]);

  const [editServiceOpen, setEditServiceOpen] = useState(false);
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const handleDeleteQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleAddQuestion = (newQ) => {
    setQuestions(prev => [...prev, { ...newQ, id: Date.now() }]);
  };

  const handleEditQuestion = (q) => {
    setEditingQuestion(q);
    setAddQuestionOpen(true);
  };

  const handleSaveEditedQuestion = (updated) => {
    if (editingQuestion) {
      setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? { ...updated, id: q.id } : q));
      setEditingQuestion(null);
    } else {
      handleAddQuestion(updated);
    }
  };

  return (
    <>
      <EditServiceModal
        isOpen={editServiceOpen}
        onClose={() => setEditServiceOpen(false)}
        service={service}
        onSave={setService}
      />

      <AddQuestionModal
        isOpen={addQuestionOpen}
        onClose={() => { setAddQuestionOpen(false); setEditingQuestion(null); }}
        onAdd={handleSaveEditedQuestion}
      />

      <header className="h-20 border-b border-[#FFB347]/10 px-8 flex items-center justify-between bg-[#0D0B0A]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 hover:text-[#FFB347] transition-colors uppercase tracking-wider cursor-pointer">Services</span>
          <span className="text-gray-700 font-mono-custom">/</span>
          <span className="text-gray-200 uppercase tracking-wider tech-hover cursor-default">{service.name}</span>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
          <span className="text-green-500 font-mono-custom text-[11px] uppercase tracking-widest font-bold">Connected ✓</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 pb-24">
        <div className="max-w-5xl mx-auto flex flex-col gap-8">

          <div className="glass-panel p-6 flex flex-col md:flex-row gap-8 relative group transition-all duration-300">
            <button
              onClick={() => setEditServiceOpen(true)}
              className="absolute top-6 right-6 border border-[#FFB347]/50 text-[#FFB347] px-4 py-2 text-xs font-mono-custom uppercase tracking-widest hover:bg-[#FFB347] hover:text-[#0D0B0A] transition-all duration-200 flex items-center gap-2"
            >
              <EditIcon size={14} />
              Edit Service
            </button>

            <div className="w-full md:w-64 h-64 shrink-0 bg-[#0D0B0A] border border-[#FFB347]/20 relative overflow-hidden group-hover:border-[#FFB347]/40 transition-colors">
              <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at center, #FFB347, transparent)', mixBlendMode: 'overlay' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FFB347" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter" className="opacity-30">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3" style={{ background: 'linear-gradient(to top, #0D0B0A, transparent)' }}>
                <span className="text-[10px] font-mono-custom text-gray-500 uppercase tracking-widest">IMG_REF_0842.RAW</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-between py-2">
              <div>
                <div className="flex flex-col items-start gap-3 mb-4 pr-32">
                  <h1 className="text-3xl font-bold tracking-tight text-white uppercase tech-hover">{service.name}</h1>
                  <span className="bg-[#FFB347]/10 border border-[#FFB347]/30 text-[#FFB347] px-3 py-1 rounded-full text-[11px] font-mono-custom uppercase tracking-widest shadow-[0_0_10px_rgba(255,179,71,0.1)]">
                    {service.category}
                  </span>
                </div>
                <p className="text-gray-400 leading-relaxed max-w-2xl text-sm border-l-2 border-[#FFB347]/20 pl-4 mt-6">
                  {service.description}
                </p>
              </div>

              <div className="flex items-center gap-8 mt-8 pt-6 border-t border-[#FFB347]/10">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFB347" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="opacity-70">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono-custom mb-1">Duration</span>
                    <span className="font-mono-custom text-lg text-gray-100 tracking-wider">{service.duration}</span>
                  </div>
                </div>

                <div className="w-px h-8 bg-[#FFB347]/10"></div>

                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFB347" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="opacity-70">
                    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono-custom mb-1">Base Price</span>
                    <span className="font-mono-custom text-lg text-[#FFB347] tracking-wider">{service.price}</span>
                  </div>
                </div>

                <div className="w-px h-8 bg-[#FFB347]/10"></div>

                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFB347" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="opacity-70">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono-custom mb-1">Status</span>
                    <span className="font-mono-custom text-sm text-green-500 tracking-wider">{service.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wider text-gray-100">Intake Questions</h2>
                <p className="text-sm text-gray-500 mt-1 font-mono-custom">DATA_COLLECTION_PROTOCOL // PRE-SERVICE</p>
              </div>
              {questions.length > 0 && (
                <button
                  onClick={() => { setEditingQuestion(null); setAddQuestionOpen(true); }}
                  className="border border-[#FFB347]/50 text-[#FFB347] px-4 py-2 text-xs font-mono-custom uppercase tracking-widest hover:bg-[#FFB347] hover:text-[#0D0B0A] transition-all duration-200 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Question
                </button>
              )}
            </div>

            <div className="flex flex-col gap-8">
              {questions.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="text-[10px] text-[#FFB347]/60 font-mono-custom tracking-[0.2em] mb-2 pl-2">ACTIVE_PARAMETERS ({questions.length})</div>
                  {questions.map(q => (
                    <QuestionRow
                      key={q.id}
                      question={q.question}
                      type={q.type}
                      required={q.required}
                      onEdit={() => handleEditQuestion(q)}
                      onDelete={() => handleDeleteQuestion(q.id)}
                    />
                  ))}
                </div>
              )}

              {questions.length === 0 && (
                <div className="mt-4">
                  <div className="text-[10px] text-[#FFB347]/60 font-mono-custom tracking-[0.2em] mb-2 pl-2">NEW_PARAMETER_INPUT // STANDBY</div>
                  <div
                    className="border border-dashed border-[#FFB347]/20 bg-[#FFB347]/[0.02] p-12 flex flex-col items-center justify-center text-center group hover:bg-[#FFB347]/[0.04] hover:border-[#FFB347]/40 transition-all duration-300 cursor-pointer"
                    onClick={() => { setEditingQuestion(null); setAddQuestionOpen(true); }}
                  >
                    <div className="w-16 h-16 rounded-full bg-[#FFB347]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(255,179,71,0.1)] group-hover:shadow-[0_0_30px_rgba(255,179,71,0.2)]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFB347" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <line x1="9" y1="15" x2="15" y2="15" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-200 mb-2 uppercase tracking-wide">No intake questions yet</h3>
                    <p className="text-gray-500 text-sm max-w-md mb-8">Gather necessary details from customers before they arrive. Add required fields like VIN, engine codes, or symptom descriptions.</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingQuestion(null); setAddQuestionOpen(true); }}
                      className="bg-[#FFB347] text-[#0D0B0A] px-8 py-3 rounded-full font-mono-custom text-sm font-bold uppercase tracking-widest hover:bg-white hover:shadow-[0_0_15px_rgba(255,179,71,0.4)] transition-all duration-200 flex items-center gap-3"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add your first question
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

const PlaceholderPage = ({ title }) => (
  <>
    <header className="h-20 border-b border-[#FFB347]/10 px-8 flex items-center justify-between bg-[#0D0B0A]/80 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-200 uppercase tracking-wider">{title}</span>
      </div>
      <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
        <span className="text-green-500 font-mono-custom text-[11px] uppercase tracking-widest font-bold">Connected ✓</span>
      </div>
    </header>
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="text-[10px] text-[#FFB347]/60 font-mono-custom tracking-[0.2em] mb-4 uppercase">{title}_MODULE // LOADING</div>
        <h2 className="text-2xl font-bold uppercase tracking-wider text-gray-300">{title}</h2>
        <p className="text-gray-600 text-sm mt-2 font-mono-custom">Module under construction</p>
      </div>
    </div>
  </>
);

const App = () => {
  const [activePage, setActivePage] = useState('services');

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = globalStyles;
    document.head.appendChild(style);

    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap';
    document.head.appendChild(fontLink);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'services': return <ServiceDetailPage />;
      case 'bookings': return <PlaceholderPage title="Bookings" />;
      case 'customers': return <PlaceholderPage title="Customers" />;
      case 'settings': return <PlaceholderPage title="Settings" />;
      default: return <ServiceDetailPage />;
    }
  };

  return (
    <div
      className="h-screen w-screen overflow-hidden flex antialiased"
      style={{ backgroundColor: '#0D0B0A', fontFamily: "'Space Grotesk', sans-serif", color: '#E2E8F0' }}
    >
      <div className="ambient-arc arc-1"></div>
      <div className="ambient-arc arc-2"></div>
      <div className="ambient-arc arc-3"></div>

      <div className="fixed top-3 left-3 text-[10px] text-[#FFB347]/40 font-mono-custom tracking-[0.2em] z-50 pointer-events-none uppercase">
        SYS.CORE // ON-LINE
      </div>
      <div className="fixed bottom-3 right-3 text-[10px] text-[#FFB347]/40 font-mono-custom tracking-[0.2em] z-50 pointer-events-none uppercase">
        UPLINK_ESTABLISHED_
      </div>

      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="flex-1 flex flex-col h-full relative z-20 overflow-hidden">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;