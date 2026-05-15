import React, { useState, useEffect } from 'react';
import { Car, CheckCircle, Clock, MapPin, ChevronDown, LogIn, LogOut, Hash } from 'lucide-react';
import { getHistory } from '../api/parking';

export default function ParkingAccessPage() {
  const [tab, setTab] = useState('entry');
  const [plate, setPlate] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [zone, setZone] = useState('A');
  const [tickets, setTickets] = useState([]);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchTickets = async () => {
    try {
      const res = await getHistory();
      if (res.success) setTickets(res.tickets);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleRegister = async () => {
    if (!plate.trim()) return alert('Enter license plate!');
    try {
      if (tab === 'entry') {
        const res = await fetch('http://localhost:5000/api/parking/enter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ vehicleNumber: plate.toUpperCase(), vehicleType, zone }),
        });
        const data = await res.json();
        if (data.success) {
          setSuccessMsg(`Entry registered for ${plate.toUpperCase()}`);
          setPlate('');
          fetchTickets();
        } else {
          alert(data.message);
        }
      } else {
        const res = await fetch('http://localhost:5000/api/parking/exit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ vehicleNumber: plate.trim().toUpperCase() }),
        });
        const data = await res.json();
        if (data.success) {
          setSuccessMsg(`Exit registered for ${plate.trim().toUpperCase()}`);
          setPlate('');
          fetchTickets();
        } else {
          alert(data.message);
        }
      }
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  const activeTickets = tickets.filter((t) => t.status === 'Active');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Parking Access</h1>
        <p className="text-sm text-slate-400 mt-0.5">Manage vehicle entry and exit records</p>
      </div>

      {/* Tab toggle */}
      <div className="inline-flex bg-slate-100 rounded-xl p-1">
        {[
          { id: 'entry', label: 'Entry State', icon: LogIn },
          { id: 'exit', label: 'Exit State', icon: LogOut },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-0 ${
              tab === id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'bg-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-5">
        {/* Form card */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">
            {tab === 'entry' ? 'Vehicle Entry' : 'Vehicle Exit'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                License Plate
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  placeholder="e.g. 72A-12345"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
            </div>

            {tab === 'entry' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Vehicle Type
                  </label>
                  <div className="relative">
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 cursor-pointer"
                    >
                      <option>Car</option>
                      <option>Motorcycle</option>
                      <option>Truck</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Zone
                  </label>
                  <div className="relative">
                    <select
                      value={zone}
                      onChange={(e) => setZone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 cursor-pointer"
                    >
                      <option value="A">Zone A</option>
                      <option value="B">Zone B</option>
                      <option value="C">Zone C</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </>
            )}

            <button
              onClick={handleRegister}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              <CheckCircle className="w-4 h-4" />
              {tab === 'entry' ? 'Register Entry' : 'Register Exit'}
            </button>

            {successMsg && (
              <div className="p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-xs text-green-700 font-medium">{successMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Entries list */}
        <div className="col-span-3 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent Entries</h2>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
              {activeTickets.length} active
            </span>
          </div>

          <div className="divide-y divide-slate-50">
            {tickets.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">No entries yet</div>
            ) : (
              tickets.slice(0, 20).map((ticket, idx) => {
                const licensePlate = ticket.licensePlate || ticket.vehicleNumber || '';
                const isActive = ticket.status === 'Active';
                const entryTime = ticket.enterTime || ticket.entryTime || ticket.time || '';
                return (
                  <div
                    key={ticket.id || idx}
                    className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? 'bg-blue-50' : 'bg-slate-100'}`}>
                        <Car className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{licensePlate}</div>
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                          <MapPin className="w-3 h-3" />
                          {ticket.vehicleType || ticket.type || 'Car'} · Zone {ticket.zone} · Slot {ticket.slotId || ticket.slot || '—'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          isActive
                            ? 'bg-green-50 text-green-700 border border-green-100'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isActive && <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
                        {ticket.status}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                        <Clock className="w-3 h-3" />
                        {typeof entryTime === 'string' ? entryTime.slice(0, 8) : entryTime}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
