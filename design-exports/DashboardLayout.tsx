import { useState } from 'react';
import { Outlet, NavLink, useSearchParams } from 'react-router-dom';
import { MerchantProvider, useMerchant } from '../context/MerchantContext';
import { Calendar, Wrench, Users, Settings, Menu, X, CheckCircle, LogOut, Zap } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <div className="glass-panel-static p-8 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
          <div className="text-sm font-display" style={{ color: 'var(--color-text-secondary)' }}>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error || !merchant) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <div className="glass-panel-static p-8 text-center max-w-sm">
          <p className="font-display font-semibold mb-4" style={{ color: 'var(--color-danger)' }}>{error || 'Merchant not found'}</p>
          <a href="/" className="text-sm hover:underline" style={{ color: 'var(--color-accent)' }}>Back to home</a>
        </div>
      </div>
    );
  }

  const initial = merchant.name.charAt(0).toUpperCase();

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 border-r
          transform transition-transform lg:translate-x-0 flex flex-col flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          borderColor: 'var(--color-border-accent)',
          backgroundColor: 'rgba(13, 11, 10, 0.8)',
          backdropFilter: 'blur(4px)',
        }}
      >
        {/* Brand */}
        <div className="h-20 flex items-center px-6 border-b" style={{ borderColor: 'var(--color-border-accent)' }}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 flex items-center justify-center font-bold text-xl relative"
                style={{
                  background: 'var(--color-accent-subtle)',
                  border: '1px solid var(--color-border-accent)',
                  color: 'var(--color-accent)',
                }}
              >
                {initial}
                <div className="absolute -top-1 -right-1 w-2 h-2 animate-pulse" style={{ backgroundColor: 'var(--color-accent)' }} />
              </div>
              <span className="font-bold text-xl tracking-wide text-white font-display">BayReady</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden" style={{ color: 'var(--color-text-secondary)' }}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Merchant info */}
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--color-border-accent)' }}>
          <div className="text-sm font-semibold text-white truncate font-display tracking-tight">{merchant.name}</div>
          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Dashboard</div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1 mt-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.label}
              to={{ pathname: item.to, search }}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors relative ${
                  isActive
                    ? 'text-[var(--color-accent)]'
                    : 'text-gray-400 hover:text-white'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { background: 'var(--color-accent-subtle)', borderLeft: '2px solid var(--color-accent)' }
                  : {}
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 animate-pulse" style={{ backgroundColor: 'var(--color-accent)' }} />
                  )}
                  <item.icon className="w-5 h-5" />
                  <span className="tracking-wide uppercase text-xs">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--color-border-accent)' }}>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors w-full px-3 py-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
          <div className="flex items-center gap-2 mt-3 px-3">
            <Zap className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
            <span className="text-[10px] font-mono-custom uppercase tracking-widest" style={{ color: 'rgba(255, 179, 71, 0.8)' }}>
              Powered by BayReady
            </span>
          </div>
          <div className="text-[9px] font-mono-custom mt-2 px-3 uppercase" style={{ color: 'var(--color-text-tech)' }}>
            v.2.0.0
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none z-0 bg-grid ambient-arc-top" />

        {/* Top bar */}
        <header
          className="relative z-10 px-4 py-3.5 flex items-center gap-4 border-b"
          style={{
            borderColor: 'var(--color-border-accent)',
            backgroundColor: 'rgba(13, 11, 10, 0.6)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              color: 'var(--color-success)',
              borderRadius: '999px',
            }}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Connected
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-6 py-8 flex flex-col min-h-0 overflow-y-auto relative z-10">
          <Outlet />
        </main>

        {/* Ambient tech label */}
        <div className="absolute bottom-3 left-6 z-10 pointer-events-none">
          <span className="text-[9px] font-mono-custom uppercase tracking-widest" style={{ color: 'var(--color-text-tech)' }}>
            SYS.CORE // ON-LINE
          </span>
        </div>
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
