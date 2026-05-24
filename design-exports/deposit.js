import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const customStyles = {
  scrollbar: `
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #0a0a0a; }
    ::-webkit-scrollbar-thumb { background: #222222; }
    ::-webkit-scrollbar-thumb:hover { background: #333333; }
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 30px #0a0a0a inset !important;
      -webkit-text-fill-color: #F3F4F6 !important;
      transition: background-color 5000s ease-in-out 0s;
    }
    @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');
  `
};

const Header = ({ currentStep }) => {
  const steps = [
    { num: '01', label: 'SERVICE' },
    { num: '02', label: 'VEHICLE' },
    { num: '03', label: 'DATE & TIME' },
    { num: '04', label: 'YOUR INFO' },
    { num: '05', label: 'PAYMENT' },
    { num: '06', label: 'CONFIRM' },
  ];

  return (
    <header className="w-full border-b border-[#222222] bg-[#0a0a0a] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center">
        <nav className="flex items-center space-x-4 text-xs tracking-widest uppercase w-full overflow-hidden whitespace-nowrap" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {steps.map((step, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum < currentStep;
            const isActive = stepNum === currentStep;
            const isFuture = stepNum > currentStep;

            return (
              <React.Fragment key={step.num}>
                <div
                  className={`flex items-center transition-colors cursor-pointer group ${
                    isActive
                      ? 'text-[#E01020] font-bold'
                      : isFuture
                      ? 'text-[#6B7280] opacity-30'
                      : 'text-[#6B7280] hover:text-gray-400'
                  }`}
                >
                  {isCompleted && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 opacity-70 group-hover:opacity-100" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span>{step.num} {step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <span className="text-[#222222]">/</span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

const BookingSummary = () => {
  const summaryItems = [
    { label: 'SERVICE', value: 'MID-SIZE VEHICLES' },
    { label: 'VEHICLE', value: '2018 MAZDA MX-5' },
    { label: 'DATE & TIME', value: 'TUE MAY 12 · 9:00 AM' },
    { label: 'DURATION', value: '120 MIN' },
  ];

  return (
    <section className="bg-[#111111] border border-[#222222] mb-12 relative shadow-2xl shadow-black/50">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#222222] to-transparent"></div>

      <div className="p-8 md:p-10">
        <div className="space-y-5">
          {summaryItems.map((item) => (
            <div key={item.label} className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] sm:items-baseline gap-1 sm:gap-4">
              <div className="text-[#6B7280] text-xs tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{item.label}</div>
              <div className="text-base font-medium text-white" style={{ fontFamily: "'Inter', sans-serif" }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div className="h-px bg-[#222222] w-full my-8"></div>

        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <div className="text-[#6B7280] text-xs tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>SERVICE TOTAL</div>
            <div className="text-base text-white" style={{ fontFamily: "'Inter', sans-serif" }}>$299.99</div>
          </div>

          <div className="flex justify-between items-baseline">
            <div className="text-[#E01020] font-bold text-sm tracking-widest uppercase flex items-center" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 fill-current" viewBox="0 0 256 256">
                <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z" />
              </svg>
              DEPOSIT (50%)
            </div>
            <div className="font-bold text-xl text-[#E01020]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>$150.00</div>
          </div>

          <div className="flex justify-between items-baseline pt-1">
            <div className="flex items-center">
              <div className="text-[#6B7280] text-xs tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>REMAINING</div>
              <div className="text-[#6B7280] text-sm ml-3 hidden sm:block" style={{ fontFamily: "'Inter', sans-serif" }}>(due at appointment)</div>
            </div>
            <div className="text-base text-[#6B7280]" style={{ fontFamily: "'Inter', sans-serif" }}>$149.99</div>
          </div>
          <div className="text-[#6B7280] text-sm sm:hidden block mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>(due at appointment)</div>
        </div>
      </div>
    </section>
  );
};

const CardDetailsForm = ({ cardNumber, setCardNumber, expiry, setExpiry, cvc, setCvc }) => {
  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ').substring(0, 19) : '';
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleCardChange = (e) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setExpiry(formatExpiry(raw));
  };

  const handleCvcChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCvc(cleaned);
  };

  return (
    <section>
      <label className="block text-[#6B7280] text-xs tracking-widest uppercase mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        CARD DETAILS
      </label>

      <div className="group relative bg-[#0a0a0a] border border-[#222222] focus-within:border-[#E01020] transition-colors duration-200">
        <div className="flex items-center h-14 px-4 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#6B7280] mr-3 flex-shrink-0 group-focus-within:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="square" strokeLinejoin="miter" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>

          <input
            type="text"
            placeholder="Card number"
            className="bg-transparent border-none outline-none focus:ring-0 flex-grow text-sm text-white placeholder-[#6B7280]/50 min-w-[140px]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            aria-label="Credit card number"
            maxLength={19}
            value={cardNumber}
            onChange={handleCardChange}
          />

          <input
            type="text"
            placeholder="MM/YY"
            className="bg-transparent border-none outline-none focus:ring-0 w-[56px] text-sm text-white placeholder-[#6B7280]/50 text-center flex-shrink-0"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            aria-label="Expiration date"
            maxLength={5}
            value={expiry}
            onChange={handleExpiryChange}
          />

          <input
            type="text"
            placeholder="CVC"
            className="bg-transparent border-none outline-none focus:ring-0 w-[48px] text-sm text-white placeholder-[#6B7280]/50 text-center flex-shrink-0 ml-1"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            aria-label="CVC"
            maxLength={4}
            value={cvc}
            onChange={handleCvcChange}
          />

          <div className="h-6 border-l border-[#222222] ml-3 pl-3 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 36 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-auto opacity-40 group-focus-within:opacity-100 transition-opacity">
              <path d="M13.2505 0.177734L8.68115 11.8227H4.11182L6.16849 2.13329C6.34582 1.2444 7.15115 0.177734 8.24315 0.177734H13.2505ZM26.3332 7.82218C26.3332 5.06662 22.3852 4.88884 22.3852 3.55551C22.3852 3.11107 22.8425 2.57773 23.9532 2.40003C24.4858 2.31115 25.5518 2.22226 26.6178 2.75559L27.4172 0.444478C26.8838 0.2667 26.0845 0 25.0185 0C20.6632 0 17.6418 2.22222 17.6418 5.42222C17.6418 7.73333 19.8632 9.06667 21.4625 9.86667C23.1505 10.6667 23.6838 11.1111 23.6838 11.8222C23.6838 12.8889 22.3512 13.3333 21.2845 13.3333C19.7745 13.3333 18.6192 12.8889 17.7305 12.4444L16.8425 14.8444C17.4645 15.1111 18.7078 15.4667 20.0412 15.4667C24.6618 15.4667 27.6832 13.1556 27.6832 10.0444C27.6825 9.42218 27.5052 8.53329 26.3332 7.82218ZM34.2585 0.177734H30.6152C29.8152 0.177734 29.1045 0.622178 28.7492 1.33329L24.6612 11.8222H29.3705C29.3705 11.8222 30.0818 9.86662 30.2592 9.42218H36.0352C36.2125 9.95551 36.6565 11.8222 36.6565 11.8222H40.7445L37.1012 0.177734H34.2585ZM31.5918 5.77773L33.0138 1.86662L34.3465 5.77773H31.5918ZM17.1612 0.177734H12.9845L8.45249 11.8222H13.0732L17.1612 0.177734Z" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center text-xs text-[#6B7280]" style={{ fontFamily: "'Inter', sans-serif" }}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 opacity-80" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        Payments secured by Stripe. We never store your card.
      </div>
    </section>
  );
};

const BottomBar = ({ isLoading, onPay }) => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#111111] border-t border-[#222222] h-24 z-50" style={{ boxShadow: '0 -10px 40px rgba(0,0,0,0.5)' }}>
      <div className="max-w-7xl mx-auto px-8 h-full flex flex-col md:flex-row items-center justify-between gap-4 py-4 md:py-0">
        <div className="w-full md:w-64 flex flex-col justify-center">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[#6B7280] text-xs tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>STEP 5 OF 6</span>
          </div>
          <div className="h-[2px] bg-[#222222] w-full relative">
            <div
              className="absolute top-0 left-0 h-full bg-[#E01020] transition-all duration-500 ease-out"
              style={{ width: '83.33%' }}
            ></div>
          </div>
        </div>

        <button
          onClick={onPay}
          disabled={isLoading}
          className="w-full md:w-auto bg-[#E01020] hover:bg-[#b50c19] text-[#050505] text-sm font-bold tracking-widest uppercase h-14 px-8 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#E01020] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] relative overflow-hidden group"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <div className="absolute inset-0 w-0 bg-white/10 transition-[width] duration-300 ease-out group-hover:w-full"></div>

          {!isLoading ? (
            <span className="relative z-10 flex items-center">
              PAY $150.00 DEPOSIT
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-3 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="square" strokeLinejoin="miter" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          ) : (
            <span className="relative z-10 flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 text-[#050505]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

const DepositPaymentPage = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState('');

  const handlePay = () => {
    setError('');
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      setError('Please enter a valid card number.');
      return;
    }
    if (!expiry || expiry.length < 5) {
      setError('Please enter a valid expiry date.');
      return;
    }
    if (!cvc || cvc.length < 3) {
      setError('Please enter a valid CVC.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setPaymentSuccess(true);
    }, 2000);
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-8">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[#E01020]/10 border-2 border-[#E01020] flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#E01020]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-white uppercase mb-3" style={{ fontFamily: "'Anton', sans-serif", letterSpacing: '0.05em' }}>PAYMENT SUCCESS</h2>
          <p className="text-[#6B7280] text-lg mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Your $150.00 deposit has been received.</p>
          <p className="text-[#6B7280] text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>Confirmation details will be sent to your email.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] text-[#F3F4F6] min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header currentStep={5} />

      <main className="flex-grow flex justify-center pt-16 pb-36 px-8">
        <div className="w-full max-w-[640px]">
          <div className="mb-10">
            <h1 className="text-5xl md:text-6xl tracking-wide uppercase mb-3 text-white" style={{ fontFamily: "'Anton', sans-serif" }}>
              DEPOSIT REQUIRED
            </h1>
            <p className="text-[#6B7280] text-lg" style={{ fontFamily: "'Inter', sans-serif" }}>
              A deposit secures your appointment. Balance due at service.
            </p>
          </div>

          <BookingSummary />

          <CardDetailsForm
            cardNumber={cardNumber}
            setCardNumber={setCardNumber}
            expiry={expiry}
            setExpiry={setExpiry}
            cvc={cvc}
            setCvc={setCvc}
          />

          {error && (
            <div className="mt-4 p-3 border border-[#E01020]/50 bg-[#E01020]/10 text-[#E01020] text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
              {error}
            </div>
          )}
        </div>
      </main>

      <BottomBar isLoading={isLoading} onPay={handlePay} />
    </div>
  );
};

const App = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = customStyles.scrollbar;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <Router basename="/">
      <Routes>
        <Route path="/" element={<DepositPaymentPage />} />
      </Routes>
    </Router>
  );
};

export default App;