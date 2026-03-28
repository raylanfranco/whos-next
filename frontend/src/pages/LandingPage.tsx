import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Clock, Users, Zap, ArrowRight, Car, ClipboardCheck, Wifi,
  Check, ChevronDown, ChevronUp, Shield, CreditCard, BarChart3,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Calendar,
    title: 'Online Scheduling',
    desc: 'Customers pick a service, date, and time slot. No phone tag. Availability updates in real-time so you never double-book.',
  },
  {
    icon: Car,
    title: 'Vehicle Intake',
    desc: 'Structured Year / Make / Model capture with existing mods and known issues. No more deciphering free-text notes.',
  },
  {
    icon: Users,
    title: 'Customer Management',
    desc: 'Every customer, vehicle, and booking in one place. Return visits auto-fill so regulars breeze through.',
  },
  {
    icon: Clock,
    title: 'Availability Control',
    desc: 'Set weekly hours, block off dates, and let the system prevent conflicts. You focus on installs, not scheduling.',
  },
  {
    icon: ClipboardCheck,
    title: 'Parts Checklist',
    desc: 'Auto-generate required parts from the service + vehicle combo. Techs prep before the customer pulls up.',
  },
  {
    icon: Wifi,
    title: 'Online Payments',
    desc: 'Collect deposits at booking time with secure Stripe payment processing. Reduce no-shows and protect your time.',
  },
];

const STEPS = [
  {
    number: '1',
    title: 'Create Your Account',
    desc: 'Sign up with your email and business name. Takes under 60 seconds.',
  },
  {
    number: '2',
    title: 'Configure',
    desc: 'Add your services, set your availability, and customize your booking page. Takes about 10 minutes.',
  },
  {
    number: '3',
    title: 'Go Live',
    desc: 'Share your hosted booking link or embed the widget on your website. Customers start booking immediately.',
  },
];

const PRICING_FEATURES = [
  'Unlimited bookings',
  'Online scheduling page',
  'Vehicle intake forms',
  'Customer & vehicle database',
  'Availability & calendar management',
  'Deposit collection',
  'Email notifications',
  'Stripe payment processing',
];

const FAQS = [
  {
    q: 'How do my customers book appointments?',
    a: 'You get a hosted booking page (e.g. whosnext.vercel.app/book/your-shop) that you can link from your website, Google Business listing, or social media. Customers pick a service, choose a date/time, enter their vehicle info, and optionally pay a deposit — all self-service.',
  },
  {
    q: 'Can I collect deposits online?',
    a: 'Yes. Set a deposit percentage (e.g. 25%) in your settings and Who's Next? will collect it during booking via Stripe\'s secure payment processing. The charge shows up in your Stripe dashboard.',
  },
  {
    q: 'What kind of shops is this built for?',
    a: 'Car audio, window tint, auto accessories, PPF, vinyl wrap — any install shop that needs structured vehicle data and appointment scheduling. If your workflow involves "what vehicle, what service, when," Who's Next? is for you.',
  },
  {
    q: 'Is there a contract or setup fee?',
    a: 'No contracts, no setup fees. Start with a free 14-day trial, then $39/month. Cancel anytime.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="text-base font-medium text-slate-900">{q}</span>
        {open
          ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
          : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
        }
      </button>
      {open && (
        <p className="pb-5 text-sm text-slate-600 leading-relaxed pr-8">{a}</p>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* -- Header -- */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Who's Next?" className="w-9 h-9" />
            <span className="text-xl font-bold text-slate-900">
              Who's <span className="text-primary">Next?</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hidden sm:inline text-sm text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#pricing" className="hidden sm:inline text-sm text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
            <a href="#faq" className="hidden sm:inline text-sm text-slate-600 hover:text-slate-900 transition-colors">FAQ</a>
            <Link
              to="/login"
              className="btn-primary inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* -- Hero -- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-50/80 via-white to-white pointer-events-none" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(to right, #0891b2 1px, transparent 1px), linear-gradient(to bottom, #0891b2 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/8 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-primary/15">
              <Zap className="w-3.5 h-3.5" />
              Built for auto install shops
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 leading-[1.1] tracking-tight">
              Stop scribbling vehicle details<br className="hidden md:inline" /> on sticky notes
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Who's Next? gives your shop online booking, structured vehicle intake, and
              payment processing — so every appointment starts with the right info, not a phone call.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                to="/register"
                className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-lg font-semibold rounded-lg"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#features" className="inline-flex items-center gap-2 px-6 py-3.5 text-lg font-medium text-slate-600 hover:text-slate-900 transition-colors">
                See how it works
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <p className="text-sm text-slate-400 mt-4">14-day free trial &middot; No credit card required &middot; Cancel anytime</p>
          </div>

          {/* Dashboard preview */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-t from-primary/5 to-primary/10 rounded-2xl blur-2xl" />
            <div className="relative bg-slate-900 rounded-xl overflow-hidden shadow-2xl shadow-slate-900/20 border border-slate-800">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/80 border-b border-slate-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="flex-1 mx-8">
                  <div className="bg-slate-700/60 rounded-md px-3 py-1 text-xs text-slate-400 text-center max-w-xs mx-auto">
                    whosnext.vercel.app/dashboard
                  </div>
                </div>
              </div>
              {/* Screenshot placeholder */}
              <div className="aspect-[16/9] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-8">
                <img
                  src="/dashboard-preview.png"
                  alt="Who's Next? dashboard showing a weekly calendar with booked appointments"
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `
                      <div class="text-center">
                        <div class="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p class="text-slate-400 text-lg font-medium mb-1">Your calendar, fully loaded</p>
                        <p class="text-slate-500 text-sm">Bookings, vehicle info, and payments — all in one view</p>
                      </div>
                    `;
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -- Built for -- */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <p className="text-center text-sm font-medium text-slate-400 uppercase tracking-wider mb-6">
            Purpose-built for
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-slate-500">
            {['Car Audio Shops', 'Window Tint Studios', 'Auto Accessories', 'PPF & Wrap Installers', 'Custom Lighting', 'Remote Start Installers'].map((label) => (
              <span key={label} className="flex items-center gap-2 text-sm font-medium">
                <Check className="w-4 h-4 text-primary" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* -- Features -- */}
      <section id="features" className="scroll-mt-16">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything your shop needs</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">
              Not another generic salon scheduler. Who's Next? is built around the install shop workflow.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="card-hover group bg-white rounded-xl p-6 border border-slate-200 hover:border-primary/30 transition-colors"
              >
                <div className="w-11 h-11 bg-primary/8 group-hover:bg-primary/15 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- How it works -- */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Up and running in minutes</h2>
            <p className="text-slate-500 text-lg">Three steps to replace your booking workflow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative text-center">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-px bg-slate-300 -z-0" />
                )}
                <div className="relative z-10 w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-5 shadow-lg shadow-primary/20">
                  {s.number}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- Pricing -- */}
      <section id="pricing" className="scroll-mt-16">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-500 text-lg">One plan. Everything included. No surprises.</p>
          </div>
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-xl shadow-primary/5 overflow-hidden">
              <div className="p-8 text-center border-b border-slate-100">
                <div className="inline-flex items-center gap-1.5 bg-primary/8 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                  14-day free trial
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-5xl font-extrabold text-slate-900">$39</span>
                  <span className="text-slate-400 text-lg font-medium">/mo</span>
                </div>
                <p className="text-sm text-slate-400">per location &middot; billed monthly</p>
              </div>
              <div className="p-8">
                <ul className="space-y-3.5 mb-8">
                  {PRICING_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className="btn-primary w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold rounded-lg"
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-xs text-slate-400 text-center mt-3">No credit card required to start</p>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12 text-slate-400">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4" />
              <span>PCI Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="w-4 h-4" />
              <span>Powered by Stripe</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4" />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* -- FAQ -- */}
      <section id="faq" className="bg-slate-50 border-y border-slate-200 scroll-mt-16">
        <div className="max-w-3xl mx-auto px-6 py-20 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Frequently asked questions</h2>
            <p className="text-slate-500">Got a question? We've probably answered it below.</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 px-6 md:px-8 divide-y divide-slate-200">
            {FAQS.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* -- Final CTA -- */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-24">
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-10 md:p-14 text-center text-white relative overflow-hidden">
          {/* Subtle pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to modernize your shop?</h2>
            <p className="text-cyan-100 max-w-lg mx-auto mb-8 text-lg">
              Join install shops using Who's Next? to book smarter, capture vehicle data,
              and collect payments — automatically.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-primary hover:bg-cyan-50 px-8 py-3.5 text-lg font-semibold rounded-lg transition-colors shadow-lg"
            >
              Create Your Account
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* -- Footer -- */}
      <footer className="border-t border-slate-200 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Who's Next?" className="w-7 h-7 opacity-50" />
              <span className="text-sm text-slate-400">
                &copy; {new Date().getFullYear()} Who's Next?
              </span>
            </div>
            <p className="text-sm text-slate-400 text-center md:text-right">
              Built for auto shops, by people who understand the workflow.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
