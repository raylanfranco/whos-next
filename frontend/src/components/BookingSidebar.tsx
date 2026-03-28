import { Clock, Phone, MapPin, HelpCircle } from 'lucide-react';
import type { Merchant, AvailabilityRule } from '../types';

interface BookingSidebarProps {
  merchant: Merchant;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatTime12(time24: string) {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function getHoursDisplay(rules: AvailabilityRule[]) {
  const sorted = [...rules].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  return sorted.map((rule) => ({
    day: DAY_ABBR[rule.dayOfWeek],
    dayFull: DAY_NAMES[rule.dayOfWeek],
    hours: rule.isBlocked ? 'Closed' : `${formatTime12(rule.startTime)} – ${formatTime12(rule.endTime)}`,
    isBlocked: rule.isBlocked,
    isCurrent: new Date().getDay() === rule.dayOfWeek,
  }));
}

export default function BookingSidebar({ merchant }: BookingSidebarProps) {
  const settings = merchant.settings as Record<string, unknown> | null;
  const phone = (settings?.phone as string) || null;
  const address = (settings?.address as string) || null;
  const hoursData = merchant.availabilityRules ? getHoursDisplay(merchant.availabilityRules) : [];

  return (
    <aside className="hidden lg:flex flex-col w-80 shrink-0 bg-white border-r border-slate-100 px-7 py-8 gap-7 overflow-y-auto shadow-[1px_0_8px_rgba(0,0,0,0.03)]">
      {/* Business name */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-display">{merchant.name}</h2>
        <span className="inline-block bg-primary/8 text-primary text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full mt-2">
          Online Booking
        </span>
      </div>

      {/* Business hours */}
      {hoursData.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-3 tracking-tight font-display">
            <Clock className="w-4 h-4" />
            Business Hours
          </div>
          <div className="space-y-0.5">
            {hoursData.map((h) => (
              <div
                key={h.day}
                className={`flex justify-between text-xs px-2 py-1.5 -mx-2 rounded-lg transition-colors ${
                  h.isCurrent
                    ? 'text-primary font-semibold bg-primary/5'
                    : h.isBlocked
                      ? 'text-slate-400'
                      : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{h.day}</span>
                <span>{h.hours}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact info */}
      {(phone || address) && (
        <div className="space-y-3">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-3 text-sm text-slate-600 hover:text-primary transition-colors group"
            >
              <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors">
                <Phone className="w-4 h-4" />
              </div>
              {phone}
            </a>
          )}
          {address && (
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <span>{address}</span>
            </div>
          )}
        </div>
      )}

      {/* Help section */}
      <div className="mt-auto pt-5 border-t border-slate-100">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <HelpCircle className="w-4 h-4" />
          <span>Need help?</span>
        </div>
        {phone ? (
          <a
            href={`tel:${phone}`}
            className="inline-block bg-primary/8 text-primary hover:bg-primary/12 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors mt-2 ml-6"
          >
            Call us
          </a>
        ) : (
          <p className="text-xs text-slate-400 mt-1 ml-6">Contact the business directly.</p>
        )}
      </div>
    </aside>
  );
}
