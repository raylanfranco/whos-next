import { useState } from 'react';
import { X } from 'lucide-react';

interface TintZonePickerProps {
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  shadeOptions: string[];
}

const ZONES = [
  { id: 'front_windshield', label: 'Front Windshield' },
  { id: 'front_driver', label: 'Front Driver' },
  { id: 'front_passenger', label: 'Front Passenger' },
  { id: 'rear_driver', label: 'Rear Driver' },
  { id: 'rear_passenger', label: 'Rear Passenger' },
  { id: 'rear_windshield', label: 'Rear Windshield' },
  { id: 'sunroof', label: 'Sunroof' },
] as const;

const DEFAULT_SHADES = ['5%', '20%', '35%', '50%', '70%'];

const CAR_BODY = `
  M 160,12
  C 120,12 90,28 82,58
  L 72,120
  C 68,132 66,148 66,160
  L 62,340
  C 62,360 66,378 72,390
  L 86,435
  C 96,455 125,468 160,468
  C 195,468 224,455 234,435
  L 248,390
  C 254,378 258,360 258,340
  L 262,160
  C 262,148 260,132 256,120
  L 238,58
  C 230,28 200,12 160,12
  Z
`;

const MIRROR_LEFT = 'M 66,155 L 46,148 L 42,158 L 62,165 Z';
const MIRROR_RIGHT = 'M 254,155 L 274,148 L 278,158 L 258,165 Z';
const DOOR_SEAM_LEFT = 'M 68,248 L 100,248';
const DOOR_SEAM_RIGHT = 'M 220,248 L 252,248';

const ZONE_PATHS: Record<string, string> = {
  front_windshield: 'M 108,88 Q 160,72 212,88 L 218,120 Q 160,110 102,120 Z',
  front_driver: 'M 70,138 L 98,134 L 98,242 L 70,242 Q 68,200 70,138 Z',
  front_passenger: 'M 250,138 L 222,134 L 222,242 L 250,242 Q 252,200 250,138 Z',
  rear_driver: 'M 70,256 L 98,256 L 98,352 L 76,352 Q 68,320 70,256 Z',
  rear_passenger: 'M 250,256 L 222,256 L 222,352 L 244,352 Q 252,320 250,256 Z',
  rear_windshield: 'M 102,368 Q 160,378 218,368 L 212,400 Q 160,415 108,400 Z',
  sunroof: 'M 128,180 L 192,180 L 192,280 L 128,280 Z',
};

const ZONE_LABEL_POS: Record<string, { x: number; y: number }> = {
  front_windshield: { x: 160, y: 100 },
  front_driver: { x: 50, y: 190 },
  front_passenger: { x: 270, y: 190 },
  rear_driver: { x: 50, y: 305 },
  rear_passenger: { x: 270, y: 305 },
  rear_windshield: { x: 160, y: 388 },
  sunroof: { x: 160, y: 230 },
};

function shadeToOpacity(shade: string): number {
  const pct = parseInt(shade);
  if (isNaN(pct)) return 0;
  return Math.max(0.12, 0.95 - (pct / 100));
}

export default function TintZonePicker({ value, onChange, shadeOptions }: TintZonePickerProps) {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const shades = shadeOptions.length > 0 ? shadeOptions : DEFAULT_SHADES;

  function handleZoneClick(zoneId: string) {
    setActiveZone(activeZone === zoneId ? null : zoneId);
  }

  function handleShadeSelect(shade: string) {
    if (!activeZone) return;
    onChange({ ...value, [activeZone]: shade });
    setActiveZone(null);
  }

  function handleRemoveZone(zoneId: string) {
    const next = { ...value };
    delete next[zoneId];
    onChange(next);
    if (activeZone === zoneId) setActiveZone(null);
  }

  const activeZoneLabel = activeZone ? ZONES.find((z) => z.id === activeZone)?.label : null;

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500 text-center">Tap a window zone to select a tint shade.</p>
      <div className="relative mx-auto" style={{ maxWidth: 260 }}>
        <svg viewBox="0 0 320 480" className="w-full h-auto" style={{ touchAction: 'manipulation' }} role="img" aria-label="Top-down view of a car with selectable window tint zones">
          <path d={CAR_BODY} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={2.5} />
          <path d={MIRROR_LEFT} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={1.5} />
          <path d={MIRROR_RIGHT} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={1.5} />
          <path d={DOOR_SEAM_LEFT} fill="none" stroke="#94a3b8" strokeWidth={1} />
          <path d={DOOR_SEAM_RIGHT} fill="none" stroke="#94a3b8" strokeWidth={1} />
          <ellipse cx={115} cy={40} rx={18} ry={8} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1} />
          <ellipse cx={205} cy={40} rx={18} ry={8} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1} />
          <ellipse cx={118} cy={445} rx={16} ry={7} fill="#fecaca" stroke="#94a3b8" strokeWidth={1} />
          <ellipse cx={202} cy={445} rx={16} ry={7} fill="#fecaca" stroke="#94a3b8" strokeWidth={1} />
          <rect x={105} y={135} width={110} height={220} rx={4} fill="#d1d5db" stroke="none" />
          {ZONES.map((zone) => {
            const isSelected = !!value[zone.id];
            const isActive = activeZone === zone.id;
            const isSunroof = zone.id === 'sunroof';
            const fillOpacity = isSelected ? shadeToOpacity(value[zone.id]) : 0;
            return (
              <path key={zone.id} d={ZONE_PATHS[zone.id]} fill={isSelected ? `rgba(0, 0, 0, ${fillOpacity})` : 'rgba(186, 210, 235, 0.35)'} stroke={isActive ? '#0891b2' : isSelected ? '#475569' : '#94a3b8'} strokeWidth={isActive ? 3 : 1.5} strokeDasharray={isSunroof && !isSelected ? '4,3' : 'none'} className="cursor-pointer transition-all duration-200" onClick={() => handleZoneClick(zone.id)} role="button" aria-label={`${zone.label}${isSelected ? ` — ${value[zone.id]} tint` : ' — tap to add tint'}`} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleZoneClick(zone.id); } }} />
            );
          })}
          {ZONES.map((zone) => {
            const pos = ZONE_LABEL_POS[zone.id];
            const isSelected = !!value[zone.id];
            const isSide = zone.id.includes('driver') || zone.id.includes('passenger');
            if (!isSide) return null;
            return (<text key={`label-${zone.id}`} x={pos.x} y={pos.y} textAnchor="middle" fontSize={11} fill={isSelected ? '#1e293b' : '#94a3b8'} fontWeight={isSelected ? 600 : 400} className="pointer-events-none select-none">{isSelected ? value[zone.id] : ''}</text>);
          })}
          <text x={160} y={25} textAnchor="middle" fontSize={11} fill="#94a3b8" className="pointer-events-none select-none">FRONT</text>
          <text x={160} y={472} textAnchor="middle" fontSize={11} fill="#94a3b8" className="pointer-events-none select-none">REAR</text>
        </svg>
      </div>

      {activeZone && (
        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-slate-700">Select shade for <span className="text-primary font-semibold">{activeZoneLabel}</span></div>
            <button onClick={() => setActiveZone(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {shades.map((shade) => (
              <button key={shade} onClick={() => handleShadeSelect(shade)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors cursor-pointer ${value[activeZone] === shade ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
                <span className="inline-block w-4 h-4 rounded-sm border border-slate-300" style={{ backgroundColor: `rgba(0, 0, 0, ${shadeToOpacity(shade)})` }} />
                {shade}
              </button>
            ))}
          </div>
        </div>
      )}

      {Object.keys(value).length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Selected Zones</div>
          {ZONES.filter((z) => value[z.id]).map((zone) => (
            <div key={zone.id} className="flex items-center justify-between bg-warm-50 rounded-lg px-3 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-sm border border-slate-300 shrink-0" style={{ backgroundColor: `rgba(0, 0, 0, ${shadeToOpacity(value[zone.id])})` }} />
                <span className="text-sm text-slate-700">{zone.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{value[zone.id]}</span>
                <button onClick={() => handleRemoveZone(zone.id)} className="text-slate-400 hover:text-red-500 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
