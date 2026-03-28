import { useState } from 'react';
import { Outlet, NavLink, useSearchParams } from 'react-router-dom';
import { MerchantProvider, useMerchant } from '../context/MerchantContext';
import { Calendar, Wrench, Users, Settings, Menu, X, CheckCircle, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { to: '', icon: Calendar, label: 'Bookings', end: true },
  { to: 'services', icon: Wrench, label: 'Services' },
  { to: 'customers', icon: Users, label: 'Customers' },
  { to: 'settings', icon: Settings, label: 'Settings' },
];

function DashboardContent() {
  const { merchant, loading, error, logout } = useMerchant();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const search = searchParams.toString();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="premium-card-static p-8 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-slate-500 text-sm font-display">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error || !merchant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="premium-card-static p-8 text-center max-w-sm">
          <p className="text-red-600 font-display font-semibold mb-4">{error || 'Merchant not found'}</p>
          <a href="/" className="text-primary hover:underline text-sm">Back to home</a>
        </div>
      </div>
    );
  }

  const initial = merchant.name.charAt(0).toUpperCase();

  return (
    <div className="h-screen bg-warm-50 flex overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 shadow-[1px_0_8px_rgba(0,0,0,0.04)]
        transform transition-transform lg:translate-x-0 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand + merchant */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="Who's Next?" className="w-8 h-8" />
              <h1 className="text-xl font-bold text-slate-900 font-display tracking-tight">
                Who's <span className="text-primary">Next?</span>
              </h1>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-sm font-display">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate font-display tracking-tight">{merchant.name}</div>
              <div className="text-xs text-slate-400">Dashboard</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 flex-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.label}
              to={{ pathname: item.to, search }}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                  isActive
                    ? 'bg-primary/6 text-primary'
                    : 'text-slate-600 hover:bg-warm-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-primary rounded-r" />
                  )}
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors w-full px-3 py-2 rounded-lg hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-300 mt-2">
            <img src="/logo.svg" alt="" className="w-4 h-4 opacity-30" />
            Powered by Who's Next?
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 px-4 py-3.5 flex items-center gap-4 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-500 hover:text-slate-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full shadow-sm">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Connected</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-6 py-8 flex flex-col min-h-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <MerchantProvider>
      <DashboardContent />
    </MerchantProvider>
  );
}
