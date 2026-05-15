import React, { useEffect, useState } from 'react';
import {
  CreditCard, Search, DollarSign, ChevronDown, CheckCircle,
  Clock, AlertCircle, Car, Bike, Truck, MapPin, Navigation,
} from 'lucide-react';
import { getPricing } from '../api/admin';

const fmt = (n) => `$${Number(n).toFixed(2)}`;

export default function GuidancePaymentPage() {
  const [activeTab, setActiveTab] = useState('payment');

  // Payment state
  const [searchPlate, setSearchPlate] = useState('');
  const [feeResult, setFeeResult] = useState(null);
  const [genPlate, setGenPlate] = useState('');
  const [amount, setAmount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [recentPayments, setRecentPayments] = useState([]);
  const [successPay, setSuccessPay] = useState(false);

  // Guidance state
  const [zones, setZones] = useState([]);
  const [feeStructure, setFeeStructure] = useState([]);

  const fetchRecentPayments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/guidance/recent-payments');
      const data = await res.json();
      if (data.success) setRecentPayments(data.payments);
    } catch (err) { console.error(err); }
  };

  const fetchZones = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/guidance/zones-status');
      const data = await res.json();
      if (data.success) setZones(data.zones.filter((z) => z.name !== 'C'));
    } catch (err) { console.error(err); }
  };

  const fetchPricing = async () => {
    try {
      const data = await getPricing();
      if (data.success) {
        const p = data.pricing;
        setFeeStructure([
          { type: 'Car',        icon: Car,  first: fmt(p.Car.firstHour),        additional: fmt(p.Car.additionalHour),        daily: fmt(p.Car.dailyMax) },
          { type: 'Motorcycle', icon: Bike, first: fmt(p.Motorcycle.firstHour), additional: fmt(p.Motorcycle.additionalHour), daily: fmt(p.Motorcycle.dailyMax) },
          { type: 'Truck',      icon: Truck,first: fmt(p.Truck.firstHour),      additional: fmt(p.Truck.additionalHour),      daily: fmt(p.Truck.dailyMax) },
        ]);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchRecentPayments();
    fetchZones();
    fetchPricing();
  }, []);

  const handleCalculate = async () => {
    if (!searchPlate.trim()) return alert('Enter License Plate!');
    try {
      const res = await fetch('http://localhost:5000/api/guidance/calculate-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licensePlate: searchPlate }),
      });
      const data = await res.json();
      if (data.success) {
        setFeeResult({ found: true, duration: data.duration || '—', fee: fmt(data.fee) });
        setGenPlate(searchPlate);
        setAmount(String(data.fee));
      } else {
        setFeeResult({ found: false });
      }
    } catch (err) { console.error(err); setFeeResult({ found: false }); }
  };

  const handlePayment = async () => {
    if (!genPlate.trim() || parseFloat(amount) <= 0) return alert('License Plate or Fee invalid!');
    try {
      const res = await fetch('http://localhost:5000/api/guidance/generate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licensePlate: genPlate, amount: parseFloat(amount), method: paymentMethod }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessPay(true);
        setGenPlate('');
        setAmount('0');
        setFeeResult(null);
        setSearchPlate('');
        fetchRecentPayments();
        fetchZones();
        setTimeout(() => setSuccessPay(false), 3000);
      } else {
        alert('Payment Failed');
      }
    } catch (err) { console.error(err); }
  };

  const nearestZone = zones.find((z) => (z.available || 0) > 0) || zones[0];

  const directions = [
    'From entrance, proceed straight ahead',
    'Continue straight for 50 meters',
    `${nearestZone ? nearestZone.name : 'Zone A'} parking will be on your right`,
    'Look for the slot marked in green',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Guidance & Payment</h1>
        <p className="text-sm text-slate-400 mt-0.5">Calculate fees, process payments, and find parking guidance</p>
      </div>

      {/* Tab toggle */}
      <div className="inline-flex bg-slate-100 rounded-xl p-1">
        {[
          { id: 'payment',  label: 'Payment' },
          { id: 'guidance', label: 'Guidance' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-0 ${
              activeTab === id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'bg-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ---- PAYMENT TAB ---- */}
      {activeTab === 'payment' && (
        <>
          <div className="grid grid-cols-2 gap-5">
            {/* Calculate fee */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Calculate Parking Fee</h2>
                  <p className="text-xs text-slate-400">Look up fee by license plate</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    License Plate
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchPlate}
                      onChange={(e) => { setSearchPlate(e.target.value); setFeeResult(null); }}
                      placeholder="e.g. 72A-12345"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCalculate}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer border-0"
                >
                  Calculate Fee
                </button>

                {feeResult !== null && (
                  <div className={`p-3.5 rounded-lg border ${feeResult.found ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
                    {feeResult.found ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-blue-500 font-semibold uppercase tracking-wide mb-2">
                          <Clock className="w-3.5 h-3.5" />
                          Session Details
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500">Duration</span>
                          <span className="text-xs font-semibold text-slate-900">{feeResult.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500">Fee</span>
                          <span className="text-sm font-bold text-blue-700">{feeResult.fee}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-xs text-red-600">No active session found for this plate</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Generate payment */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Generate Payment</h2>
                  <p className="text-xs text-slate-400">Process payment for a vehicle</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    License Plate
                  </label>
                  <input
                    type="text"
                    value={genPlate}
                    onChange={(e) => setGenPlate(e.target.value)}
                    placeholder="e.g. 72A-12345"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Amount (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0"
                      step="0.5"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Payment Method
                  </label>
                  <div className="relative">
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 cursor-pointer"
                    >
                      <option>Credit Card</option>
                      <option>Cash</option>
                      <option>E-Wallet</option>
                      <option>Bank Transfer</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer border-0"
                >
                  <CheckCircle className="w-4 h-4" />
                  Process Payment
                </button>

                {successPay && (
                  <div className="p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-xs text-green-700 font-medium">Payment processed successfully</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment history */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Payment History</h2>
              <span className="text-xs text-slate-400">{recentPayments.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['License Plate', 'Amount', 'Method', 'Time', 'Status'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentPayments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-400">No payment records</td>
                    </tr>
                  ) : (
                    recentPayments.map((record, idx) => (
                      <tr key={record.id || idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{record.vehicleNumber || record.licensePlate || record.plate || '—'}</td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">${Number(record.amount || 0).toFixed(2)}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-500">{record.method || record.paymentMethod || '—'}</td>
                        <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">
                          {record.time || (record.paidAt ? new Date(record.paidAt).toLocaleTimeString() : '—')}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            Completed
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ---- GUIDANCE TAB ---- */}
      {activeTab === 'guidance' && (
        <>
          {/* Nearest spot highlight */}
          {nearestZone && (
            <div className="bg-green-600 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs text-green-100 font-semibold uppercase tracking-wide mb-0.5">
                  Nearest available spot
                </div>
                <div className="text-white font-bold">
                  {nearestZone.name} — {nearestZone.available || 0} slots available
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-5">
            {/* Zone map */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Zone Map</h2>
              <div className="flex flex-col items-center gap-0">
                <div className="w-44 border-2 border-blue-200 bg-blue-50 rounded-xl p-3 text-center">
                  <Car className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <div className="text-xs font-semibold text-blue-700">Entrance</div>
                </div>
                <div className="w-0.5 h-5 bg-slate-200" />
                {(zones.length > 0 ? zones : [
                  { name: 'Zone A', available: 14, total: 15 },
                  { name: 'Zone B', available: 12, total: 12 },
                ]).map((zone, idx, arr) => (
                  <div key={zone.name} className="flex flex-col items-center">
                    <div className={`w-44 relative border-2 rounded-xl p-3 text-center transition-all ${
                      idx === 0 ? 'border-green-400 bg-green-50 shadow-sm' : 'border-slate-200 bg-slate-50'
                    }`}>
                      {idx === 0 && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap uppercase tracking-wide">
                          Nearest
                        </span>
                      )}
                      <div className="text-sm font-semibold text-slate-900">{zone.name}</div>
                      <div className="text-xs text-green-600 font-medium mt-1">
                        {zone.available || 0} available / {zone.total || 0} total
                      </div>
                    </div>
                    {idx < arr.length - 1 && <div className="w-0.5 h-4 bg-slate-200" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Directions */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-5">
                <Navigation className="w-4 h-4 text-slate-600" />
                <h2 className="text-sm font-semibold text-slate-900">Step-by-Step Directions</h2>
              </div>
              <div className="relative space-y-4">
                {directions.map((dir, idx) => (
                  <div key={idx} className="flex items-start gap-3.5">
                    <div className="relative flex-shrink-0">
                      <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold z-10 relative">
                        {idx + 1}
                      </div>
                      {idx < directions.length - 1 && (
                        <div className="absolute top-7 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-slate-200" />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className="text-sm text-slate-700 leading-snug">{dir}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing table */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Parking Rates</h2>
              <p className="text-xs text-slate-400 mt-0.5">Current fee structure by vehicle type</p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Vehicle Type', 'First Hour', 'Additional Hour', 'Daily Maximum'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {feeStructure.map((row) => {
                  const Icon = row.icon;
                  return (
                    <tr key={row.type} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                          <span className="text-sm font-medium text-slate-900">{row.type}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-900">{row.first}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{row.additional}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{row.daily}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
