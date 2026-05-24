import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const customStyles = {
  noScrollbar: {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  },
  autofillOverride: `
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 30px #0a0a0a inset !important;
      -webkit-text-fill-color: white !important;
      transition: background-color 5000s ease-in-out 0s;
    }
    * { border-radius: 0 !important; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
  `,
};

const steps = [
  { num: '01', label: 'SERVICE', done: true },
  { num: '02', label: 'VEHICLE', done: true },
  { num: '03', label: 'DATE & TIME', done: true },
  { num: '04', label: 'YOUR INFO', active: true },
  { num: '05', label: 'PAYMENT', upcoming: true },
  { num: '06', label: 'CONFIRM', upcoming: true },
];

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#E01020" strokeWidth="3" strokeLinecap="square" className="w-4 h-4">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" className="w-5 h-5 flex-shrink-0 mt-0.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const Header = () => (
  <header className="w-full border-b border-[#333333] bg-[#0a0a0a]/95 backdrop-blur-md sticky top-0 z-50">
    <div
      className="max-w-7xl mx-auto px-6 py-5 flex overflow-x-auto items-center gap-6 text-sm font-['Anton',sans-serif] tracking-[0.15em] whitespace-nowrap no-scrollbar"
      style={customStyles.noScrollbar}
    >
      {steps.map((step, index) => (
        <React.Fragment key={step.num}>
          <div
            className={`flex items-center gap-2 ${
              step.active
                ? 'text-[#E01020]'
                : step.upcoming
                ? 'text-gray-400 opacity-30'
                : 'text-gray-400'
            }`}
          >
            {step.done && <CheckIcon />}
            <span>{step.num} {step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <span className="text-[#333333] opacity-50">/</span>
          )}
        </React.Fragment>
      ))}
    </div>
  </header>
);

const FormField = ({ id, label, optionalLabel, error, children }) => (
  <div className="flex flex-col relative">
    <label
      htmlFor={id}
      className="text-[0.65rem] md:text-xs font-semibold text-[#666666] uppercase tracking-[0.15em] mb-3 transition-colors"
    >
      {label}
      {optionalLabel && (
        <>
          <span className="text-[#333333] mx-1">|</span>
          <span className="text-gray-500 normal-case tracking-normal font-normal">{optionalLabel}</span>
        </>
      )}
    </label>
    {children}
    {error && (
      <div className="absolute -bottom-5 left-0 text-[0.65rem] text-[#E01020] font-medium tracking-wide">
        {error}
      </div>
    )}
  </div>
);

const BookingForm = ({ formData, errors, touched, onChange, onBlur }) => (
  <div className="bg-[#111111] border border-[#333333] p-6 md:p-10 shadow-2xl">
    <form
      id="bookingForm"
      className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="md:col-span-2 flex flex-col relative">
        <label
          htmlFor="fullName"
          className="text-[0.65rem] md:text-xs font-semibold text-[#666666] uppercase tracking-[0.15em] mb-3 transition-colors"
        >
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          className={`peer w-full bg-[#0a0a0a] border px-4 py-3 md:py-4 text-white focus:outline-none focus:border-[#E01020] transition-colors text-base ${
            touched.fullName && errors.fullName ? 'border-[#E01020]/50' : 'border-[#333333]'
          }`}
          placeholder="John Doe"
          autoComplete="name"
          value={formData.fullName}
          onChange={onChange}
          onBlur={onBlur}
        />
        {touched.fullName && errors.fullName && (
          <div className="absolute -bottom-5 left-0 text-[0.65rem] text-[#E01020] font-medium tracking-wide">
            PLEASE ENTER YOUR FULL NAME
          </div>
        )}
      </div>

      <div className="flex flex-col relative">
        <label
          htmlFor="email"
          className="text-[0.65rem] md:text-xs font-semibold text-[#666666] uppercase tracking-[0.15em] mb-3 transition-colors"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className={`peer w-full bg-[#0a0a0a] border px-4 py-3 md:py-4 text-white focus:outline-none focus:border-[#E01020] transition-colors text-base ${
            touched.email && errors.email ? 'border-[#E01020]/50' : 'border-[#333333]'
          }`}
          placeholder="john@example.com"
          autoComplete="email"
          value={formData.email}
          onChange={onChange}
          onBlur={onBlur}
        />
        {touched.email && errors.email && (
          <div className="absolute -bottom-5 left-0 text-[0.65rem] text-[#E01020] font-medium tracking-wide">
            PLEASE ENTER A VALID EMAIL
          </div>
        )}
      </div>

      <div className="flex flex-col relative">
        <label
          htmlFor="phone"
          className="text-[0.65rem] md:text-xs font-semibold text-[#666666] uppercase tracking-[0.15em] mb-3 transition-colors"
        >
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className={`peer w-full bg-[#0a0a0a] border px-4 py-3 md:py-4 text-white focus:outline-none focus:border-[#E01020] transition-colors text-base ${
            touched.phone && errors.phone ? 'border-[#E01020]/50' : 'border-[#333333]'
          }`}
          placeholder="(555) 000-0000"
          autoComplete="tel"
          value={formData.phone}
          onChange={onChange}
          onBlur={onBlur}
        />
        {touched.phone && errors.phone && (
          <div className="absolute -bottom-5 left-0 text-[0.65rem] text-[#E01020] font-medium tracking-wide">
            PLEASE ENTER A VALID PHONE NUMBER
          </div>
        )}
      </div>

      <div className="md:col-span-2 flex flex-col mt-4 relative">
        <label
          htmlFor="notes"
          className="text-[0.65rem] md:text-xs font-semibold text-[#666666] uppercase tracking-[0.15em] mb-3 transition-colors"
        >
          Additional Notes
          <span className="text-[#333333] mx-1">|</span>
          <span className="text-gray-500 normal-case tracking-normal font-normal">Optional</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          className="peer w-full bg-[#0a0a0a] border border-[#333333] px-4 py-4 text-white focus:outline-none focus:border-[#E01020] transition-colors text-base resize-y"
          placeholder="Anything we should know before your appointment?"
          value={formData.notes}
          onChange={onChange}
        />
      </div>
    </form>
  </div>
);

const Footer = ({ isFormValid, onContinue }) => (
  <footer className="fixed bottom-0 left-0 w-full bg-[#0a0a0a] border-t border-[#333333] z-50">
    <div className="max-w-7xl mx-auto px-6 py-4 md:py-5 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto">
        <span className="text-gray-400 font-['Anton',sans-serif] tracking-[0.15em] text-sm md:text-base flex-shrink-0">
          STEP 4 OF 6
        </span>
        <div className="h-[2px] bg-[#333333] w-full md:w-64 overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full bg-[#E01020] transition-all duration-500" style={{ width: '66.66%' }} />
        </div>
      </div>

      <button
        id="continueBtn"
        disabled={!isFormValid}
        onClick={onContinue}
        className={`w-full md:w-auto px-10 py-4 font-['Anton',sans-serif] tracking-[0.15em] text-lg transition-all flex items-center justify-center gap-3 group ${
          isFormValid
            ? 'bg-[#E01020] text-[#0a0a0a] cursor-pointer hover:opacity-90'
            : 'bg-[#333333] text-gray-500 opacity-50 cursor-not-allowed'
        }`}
      >
        <span>CONTINUE</span>
        <ArrowRightIcon
          className={`w-5 h-5 transition-transform ${isFormValid ? 'group-hover:translate-x-1' : ''}`}
        />
      </button>
    </div>
  </footer>
);

const formatPhone = (value) => {
  if (!value) return value;
  const phoneNumber = value.replace(/[^\d]/g, '');
  const len = phoneNumber.length;
  if (len < 4) return phoneNumber;
  if (len < 7) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

const HomePage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    notes: '',
  });

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    phone: false,
  });

  const [submitted, setSubmitted] = useState(false);

  const validate = useCallback((data) => {
    const errs = {};
    if (data.fullName.trim().length < 2) errs.fullName = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) errs.email = true;
    if (data.phone.replace(/[^\d]/g, '').length !== 10) errs.phone = true;
    return errs;
  }, []);

  const errors = validate(formData);
  const isFormValid = Object.keys(errors).length === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const formatted = formatPhone(value);
      setFormData((prev) => ({ ...prev, phone: formatted }));
      setTouched((prev) => ({ ...prev, phone: true }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (name !== 'notes') {
        setTouched((prev) => ({ ...prev, [name]: true }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    if (name !== 'notes') {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }
  };

  const handleContinue = () => {
    setTouched({ fullName: true, email: true, phone: true });
    if (isFormValid) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 md:py-16 pb-40 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 border-2 border-[#E01020] flex items-center justify-center">
              <CheckIcon />
            </div>
          </div>
          <h2 className="font-['Anton',sans-serif] text-4xl tracking-wide uppercase mb-4 text-[#E01020]">
            Info Saved
          </h2>
          <p className="text-gray-400 text-base mb-2">
            Proceeding to payment step...
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-6 px-8 py-3 border border-[#333333] text-gray-400 font-['Anton',sans-serif] tracking-[0.15em] text-sm hover:border-[#E01020] hover:text-white transition-colors"
          >
            BACK TO FORM
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 md:py-16 pb-40">
      <div className="mb-10">
        <h1 className="font-['Anton',sans-serif] text-5xl md:text-6xl tracking-wide uppercase mb-4">
          Your Information
        </h1>
        <p className="text-gray-400 text-base md:text-lg">
          We use this to confirm your appointment and send reminders.
        </p>
      </div>

      <BookingForm
        formData={formData}
        errors={errors}
        touched={touched}
        onChange={handleChange}
        onBlur={handleBlur}
      />

      <div className="mt-8 flex items-start gap-3 text-[#666666] max-w-2xl">
        <ShieldIcon />
        <p className="text-xs md:text-sm leading-relaxed font-medium">
          Your information is used only for appointment management. We do not share or sell customer data.
        </p>
      </div>

      <Footer isFormValid={isFormValid} onContinue={handleContinue} />
    </main>
  );
};

const App = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = customStyles.autofillOverride;
    document.head.appendChild(style);

    const linkPreconnect1 = document.createElement('link');
    linkPreconnect1.rel = 'preconnect';
    linkPreconnect1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(linkPreconnect1);

    const linkPreconnect2 = document.createElement('link');
    linkPreconnect2.rel = 'preconnect';
    linkPreconnect2.href = 'https://fonts.gstatic.com';
    linkPreconnect2.crossOrigin = '';
    document.head.appendChild(linkPreconnect2);

    const linkFont = document.createElement('link');
    linkFont.rel = 'stylesheet';
    linkFont.href = 'https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600&display=swap';
    document.head.appendChild(linkFont);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <Router basename="/">
      <div
        className="bg-[#0a0a0a] text-white min-h-screen flex flex-col"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;