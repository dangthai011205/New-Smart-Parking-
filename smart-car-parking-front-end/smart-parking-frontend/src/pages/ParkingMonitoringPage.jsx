import React, { useState, useEffect } from 'react';
import { Car, ParkingSquare } from 'lucide-react';

const statConfigs = [
  { key: 'total',     label: 'Total Slots', bg: 'bg-slate-50',  border: 'border-slate-200', text: 'text-slate-500',  num: 'text-slate-900' },
  { key: 'occupied',  label: 'Occupied',    bg: 'bg-red-50',    border: 'border-red-100',   text: 'text-red-500',   num: 'text-red-600' },
  { key: 'available', label: 'Available',   bg: 'bg-green-50',  border: 'border-green-100', text: 'text-green-600', num: 'text-green-700' },
];

export default function ParkingMonitoringPage() {
  const [activeZone, setActiveZone] = useState('A');
  const [slotsData, setSlotsData] = useState([]);
  const [overview, setOverview] = useState({ total: 0, occupied: 0, available: 0 });

  const fetchSlots = async (zone) => {
    try {
      const res = await fetch(`http://localhost:5000/api/parking/slots?zone=${zone}`);
      const data = await res.json();
      if (data.success) {
        setSlotsData(data.slots);
        setOverview({ total: data.total, occupied: data.occupied, available: data.available });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSlots(activeZone);
  }, [activeZone]);

  const values = { total: overview.total, occupied: overview.occupied, available: overview.available };
  const cols = Math.min(overview.total || slotsData.length || 8, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Parking Monitoring</h1>
        <p className="text-sm text-slate-400 mt-0.5">Real-time parking slot status and monitoring</p>
      </div>

      {/* Zone switcher */}
      <div className="inline-flex bg-slate-100 rounded-xl p-1">
        {['A', 'B', 'C'].map((z) => (
          <button
            key={z}
            onClick={() => setActiveZone(z)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-0 ${
              activeZone === z
                ? 'bg-white text-slate-900 shadow-sm'
                : 'bg-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Zone {z}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {statConfigs.map((s) => (
          <div key={s.key} className={`${s.bg} border ${s.border} rounded-xl p-5`}>
            <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${s.text}`}>
              {s.label}
            </div>
            <div className={`text-3xl font-bold ${s.num}`}>{values[s.key]}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-400 border border-green-300" />
          <span className="text-xs text-slate-500 font-medium">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-400 border border-red-300" />
          <span className="text-xs text-slate-500 font-medium">Occupied</span>
        </div>
      </div>

      {/* Parking grid */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700">Parking Map — Zone {activeZone}</h3>
          <span className="text-xs text-slate-400">{overview.total} slots total</span>
        </div>

        <div className="mb-3 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        {slotsData.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">Loading slots...</div>
        ) : (
          <div
            className="grid gap-2.5"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {slotsData.map((slot, idx) => {
              const isOccupied = slot.isOccupied || slot.status === 'occupied' || slot.status === 'Occupied';
              return (
                <div
                  key={slot.id || idx}
                  className={`relative rounded-lg border flex flex-col items-center justify-center py-3 transition-all ${
                    isOccupied
                      ? 'bg-red-50 border-red-200 shadow-sm'
                      : 'bg-green-50 border-green-200 hover:shadow-sm'
                  }`}
                >
                  {isOccupied ? (
                    <Car className="w-5 h-5 text-red-400 mb-1" />
                  ) : (
                    <ParkingSquare className="w-4 h-4 text-green-300 mb-1" />
                  )}
                  <span className={`text-[10px] font-bold font-mono ${isOccupied ? 'text-red-600' : 'text-green-600'}`}>
                    {String(slot.slotNumber || idx + 1).padStart(2, '0')}
                  </span>
                  {isOccupied && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="mt-2 text-center text-[11px] text-slate-300 tracking-wide uppercase">— EXIT —</div>
      </div>
    </div>
  );
}
