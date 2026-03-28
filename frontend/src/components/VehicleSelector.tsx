import { useState, useEffect, useRef } from 'react';

interface VehicleData {
  year: string;
  make: string;
  model: string;
  trim: string;
}

interface VehicleSelectorProps {
  value: VehicleData;
  onChange: (value: VehicleData) => void;
}

// Cache API responses in memory
const cache: Record<string, unknown> = {};

async function fetchCached<T>(url: string): Promise<T> {
  if (cache[url]) return cache[url] as T;
  const res = await fetch(url);
  const data = await res.json();
  cache[url] = data;
  return data as T;
}

const YEARS = Array.from({ length: 38 }, (_, i) => String(2027 - i)); // 2027 down to 1990

interface NHTSAMake {
  MakeId: number;
  MakeName: string;
}

interface NHTSAModel {
  Model_ID: number;
  Model_Name: string;
}

export default function VehicleSelector({ value, onChange }: VehicleSelectorProps) {
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const fetchedMakes = useRef(false);

  // Fetch makes once on mount
  useEffect(() => {
    if (fetchedMakes.current) return;
    fetchedMakes.current = true;
    setLoadingMakes(true);
    fetchCached<{ Results: NHTSAMake[] }>(
      'https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json'
    )
      .then((data) => {
        const sorted = data.Results
          .map((m) => m.MakeName)
          .sort((a, b) => a.localeCompare(b));
        setMakes(sorted);
      })
      .catch(() => setMakes([]))
      .finally(() => setLoadingMakes(false));
  }, []);

  // Fetch models when year + make change
  useEffect(() => {
    if (!value.year || !value.make) {
      setModels([]);
      return;
    }
    setLoadingModels(true);
    const encodedMake = encodeURIComponent(value.make);
    fetchCached<{ Results: NHTSAModel[] }>(
      `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodedMake}/modelyear/${value.year}?format=json`
    )
      .then((data) => {
        const sorted = data.Results
          .map((m) => m.Model_Name)
          .sort((a, b) => a.localeCompare(b));
        setModels(sorted);
      })
      .catch(() => setModels([]))
      .finally(() => setLoadingModels(false));
  }, [value.year, value.make]);

  function update(field: keyof VehicleData, val: string) {
    const next = { ...value, [field]: val };
    // Reset downstream fields
    if (field === 'year') { next.model = ''; next.trim = ''; }
    if (field === 'make') { next.model = ''; next.trim = ''; }
    if (field === 'model') { next.trim = ''; }
    onChange(next);
  }

  const selectClass = 'premium-input w-full';
  const inputClass = selectClass;

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Year */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
        <select
          value={value.year}
          onChange={(e) => update('year', e.target.value)}
          className={selectClass}
        >
          <option value="">Select year</option>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Make */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Make</label>
        <select
          value={value.make}
          onChange={(e) => update('make', e.target.value)}
          disabled={loadingMakes}
          className={selectClass}
        >
          <option value="">{loadingMakes ? 'Loading makes...' : 'Select make'}</option>
          {makes.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Model */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
        <select
          value={value.model}
          onChange={(e) => update('model', e.target.value)}
          disabled={!value.year || !value.make || loadingModels}
          className={selectClass}
        >
          <option value="">
            {loadingModels ? 'Loading models...' : !value.year || !value.make ? 'Select year & make first' : 'Select model'}
          </option>
          {models.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Trim (manual text) */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Trim <span className="text-slate-400 font-normal">(optional)</span></label>
        <input
          value={value.trim}
          onChange={(e) => update('trim', e.target.value)}
          placeholder="e.g. EX, Sport, Limited"
          className={inputClass}
        />
      </div>
    </div>
  );
}
