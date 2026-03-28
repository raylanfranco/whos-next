/**
 * MockDashboard — a standalone page that renders the dashboard sidebar + calendar
 * filled with realistic sample bookings. Navigate to /preview, screenshot, and
 * use as the hero image on the landing page. Delete this file when done.
 */
import { Calendar, List, ChevronLeft, ChevronRight, Plus, Wrench, Users, Settings, Menu, CheckCircle } from 'lucide-react';
import CalendarGrid from '../components/CalendarGrid';
import type { Booking } from '../types';

function makeBooking(id: string, dayOffset: number, startHour: number, startMin: number, durationMins: number, service: string, customer: string, status: Booking['status'], baseMonday: Date): Booking {
  const start = new Date(baseMonday); start.setDate(start.getDate() + dayOffset); start.setHours(startHour, startMin, 0, 0);
  const end = new Date(start); end.setMinutes(end.getMinutes() + durationMins);
  return { id, merchantId: 'mock', serviceId: id, customerId: id, vehicleId: null, startsAt: start.toISOString(), endsAt: end.toISOString(), status, isWalkIn: false, cloverOrderId: null, intakeData: null, notes: null, depositAmountCents: null, depositPaidAt: null, cloverChargeId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), service: { id, merchantId: 'mock', cloverItemId: null, name: service, description: null, category: null, imageUrl: null, durationMins, priceCents: 0, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, customer: { id, merchantId: 'mock', cloverCustomerId: null, name: customer, email: null, phone: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, vehicle: null };
}

function getCurrentMonday(): Date { const d = new Date(); const day = d.getDay(); const diff = day === 0 ? -6 : 1 - day; d.setDate(d.getDate() + diff); d.setHours(0, 0, 0, 0); return d; }
const monday = getCurrentMonday();

const MOCK_BOOKINGS: Booking[] = [
  makeBooking('m1', 0, 9, 0, 120, 'Window Tint — Full', 'Marcus Johnson', 'CONFIRMED', monday),
  makeBooking('m2', 0, 11, 30, 90, 'Remote Start Install', 'David Chen', 'CONFIRMED', monday),
  makeBooking('m3', 0, 14, 0, 60, 'Backup Camera', 'Sarah Williams', 'PENDING', monday),
  makeBooking('m4', 0, 15, 30, 90, 'Speaker Upgrade', 'Tyler Brooks', 'CONFIRMED', monday),
  makeBooking('t1', 1, 8, 30, 180, 'Full Audio System', 'Mike Ramirez', 'IN_PROGRESS', monday),
  makeBooking('t2', 1, 12, 0, 60, 'LED Headlights', 'Jessica Park', 'CONFIRMED', monday),
  makeBooking('t3', 1, 13, 30, 120, 'Window Tint — Front', 'Andre Mitchell', 'CONFIRMED', monday),
  makeBooking('t4', 1, 16, 0, 60, 'Dash Cam Install', 'Lisa Tran', 'PENDING', monday),
  makeBooking('w1', 2, 9, 0, 90, 'Remote Start Install', 'Brian Foster', 'CONFIRMED', monday),
  makeBooking('w2', 2, 11, 0, 120, 'Sub & Amp Install', 'Carlos Diaz', 'CONFIRMED', monday),
  makeBooking('w3', 2, 13, 30, 60, 'Phone Mount + Charger', 'Emily Watson', 'COMPLETED', monday),
  makeBooking('w4', 2, 14, 30, 120, 'Window Tint — Full', 'Jason Lee', 'CONFIRMED', monday),
  makeBooking('w5', 2, 17, 0, 60, 'Alarm System', 'Nina Patel', 'PENDING', monday),
  makeBooking('th1', 3, 8, 0, 240, 'Custom Audio Build', 'Roberto Sanchez', 'IN_PROGRESS', monday),
  makeBooking('th2', 3, 13, 0, 90, 'Interior LED Kit', 'Amanda Cruz', 'CONFIRMED', monday),
  makeBooking('th3', 3, 15, 0, 120, 'Window Tint — SUV', 'Derek Thompson', 'PENDING', monday),
  makeBooking('f1', 4, 9, 0, 120, 'Window Tint — Full', "Kevin O'Brien", 'CONFIRMED', monday),
  makeBooking('f2', 4, 11, 30, 90, 'Head Unit Swap', 'Priya Sharma', 'CONFIRMED', monday),
  makeBooking('f3', 4, 13, 30, 60, 'Backup Camera', 'Tony Russo', 'PENDING', monday),
  makeBooking('f4', 4, 14, 30, 120, 'Remote Start + Security', 'Megan Clark', 'CONFIRMED', monday),
  makeBooking('f5', 4, 17, 0, 60, 'LED Underglow', 'Jamal Harris', 'PENDING', monday),
  makeBooking('s1', 5, 9, 0, 120, 'Full Audio System', 'Chris Nguyen', 'CONFIRMED', monday),
  makeBooking('s2', 5, 11, 30, 90, 'Window Tint — Sedan', 'Rachel Adams', 'CONFIRMED', monday),
];

const NAV_ITEMS = [
  { icon: Calendar, label: 'Bookings', active: true },
  { icon: Wrench, label: 'Services', active: false },
  { icon: Users, label: 'Customers', active: false },
  { icon: Settings, label: 'Settings', active: false },
];

function getWeekLabel(mon: Date): string {
  const sun = new Date(mon); sun.setDate(sun.getDate() + 6);
  return `${mon.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${sun.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

export default function MockDashboard() {
  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5 mb-3"><img src="/logo.svg" alt="Who's Next?" className="w-8 h-8" /><h1 className="text-xl font-bold text-slate-900">Who's <span className="text-primary">Next?</span></h1></div>
          <div className="flex items-center gap-3"><div className="w-9 h-9 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-sm">N</div><div className="flex-1 min-w-0"><div className="text-sm font-medium text-slate-900 truncate">Next Level Audio</div><div className="text-xs text-slate-400">Dashboard</div></div></div>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          {NAV_ITEMS.map((item) => (<div key={item.label} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium relative ${item.active ? 'bg-primary/8 text-primary' : 'text-slate-600'}`}>{item.active && <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-primary rounded-r" />}<item.icon className="w-5 h-5" />{item.label}</div>))}
        </nav>
        <div className="p-4 border-t border-slate-100"><div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-300"><img src="/logo.svg" alt="" className="w-4 h-4 opacity-30" />Powered by Who's Next?</div></div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 py-3.5 flex items-center gap-4 shadow-sm">
          <button className="lg:hidden text-slate-500 hover:text-slate-700"><Menu className="w-5 h-5" /></button>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full"><CheckCircle className="w-3.5 h-3.5" /><span className="text-xs font-medium">Connected</span></div>
        </header>
        <main className="flex-1 p-6 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3 shrink-0">
            <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex bg-slate-100 rounded-lg p-0.5"><button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-white text-slate-900 shadow-sm"><Calendar className="w-4 h-4" /> Calendar</button><button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-slate-500"><List className="w-4 h-4" /> List</button></div>
              <div className="flex bg-slate-100 rounded-lg p-0.5"><button className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-500">Day</button><button className="px-3 py-1.5 rounded-md text-sm font-medium bg-white text-slate-900 shadow-sm">Week</button></div>
              <select className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"><option>All statuses</option></select>
              <button className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"><Plus className="w-4 h-4" /> Walk-in</button>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-4 shrink-0">
            <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"><ChevronLeft className="w-5 h-5" /></button>
            <button className="px-3 py-1 rounded-lg hover:bg-slate-100 text-sm font-medium text-slate-600">Today</button>
            <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"><ChevronRight className="w-5 h-5" /></button>
            <span className="text-sm font-medium text-slate-700">{getWeekLabel(monday)}</span>
          </div>
          <CalendarGrid bookings={MOCK_BOOKINGS} startDate={monday} view="week" onSlotClick={() => {}} onBookingClick={() => {}} />
        </main>
      </div>
    </div>
  );
}
