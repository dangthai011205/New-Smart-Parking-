import React, { useState, useEffect } from 'react';
import { Car, CircleCheck, DollarSign, Clock, ParkingSquare, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const defaultHourly = [
  { hour: '06:00', vehicles: 0 },
  { hour: '07:00', vehicles: 0 },
  { hour: '08:00', vehicles: 0 },
  { hour: '09:00', vehicles: 0 },
  { hour: '10:00', vehicles: 0 },
  { hour: '11:00', vehicles: 0 },
  { hour: '12:00', vehicles: 0 },
];

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    totalSlots: 0,
    occupied: 0,
    available: 0,
    revenue: 0,
    recentActivity: [],
    zones: [],
  });

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('http://localhost:5000/api/dashboard');
        const data = await res.json();
        if (data.success) {
          setDashboardData({
            totalSlots: data.data.totalSlots,
            occupied: data.data.occupied,
            available: data.data.available,
            revenue: data.data.revenue,
            recentActivity: data.data.recentActivity,
            zones: data.data.zones,
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      }
    }
    fetchDashboard();
  }, []);

  const occupancyRate = dashboardData.totalSlots
    ? Math.round((dashboardData.occupied / dashboardData.totalSlots) * 100)
    : 0;

  const stats = [
    {
      label: 'Total Slots',
      value: dashboardData.totalSlots,
      icon: ParkingSquare,
      bg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      sub: `Across ${dashboardData.zones.length || 3} zones`,
    },
    {
      label: 'Occupied',
      value: dashboardData.occupied,
      icon: Car,
      bg: 'bg-orange-50',
      iconColor: 'text-orange-500',
      sub: `${occupancyRate}% occupancy`,
    },
    {
      label: 'Available',
      value: dashboardData.available,
      icon: CircleCheck,
      bg: 'bg-green-50',
      iconColor: 'text-green-600',
      sub: `${100 - occupancyRate}% free`,
    },
    {
      label: "Today's Revenue",
      value: `$${Number(dashboardData.revenue).toFixed(2)}`,
      icon: DollarSign,
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      sub: 'Current session total',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Dashboard Overview</h1>
          <p className="text-sm text-slate-400 mt-0.5">Real-time status of your parking facility</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white border border-slate-100 rounded-lg px-3 py-2 shadow-sm">
          <Clock className="w-3.5 h-3.5" />
          <span>Updated just now</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-4.5 h-4.5 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Lower section */}
      <div className="grid grid-cols-5 gap-5">
        {/* Recent Activity */}
        <div className="col-span-3 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
            <span className="text-xs text-slate-400">{dashboardData.recentActivity.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['License Plate', 'Zone', 'Slot', 'Type', 'Status', 'Time'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dashboardData.recentActivity.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                      No recent activity
                    </td>
                  </tr>
                ) : (
                  dashboardData.recentActivity.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.vehicleNumber || item.licensePlate || item.plate || '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{item.zone || '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{item.slotId || item.slot || '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{item.vehicleType || item.type || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                        {item.time || item.entryTime || (item.enterTime ? new Date(item.enterTime).toLocaleTimeString() : '—')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Zone Status */}
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-900">Zone Status</h2>
            </div>
            <div className="space-y-3">
              {(dashboardData.zones.length > 0 ? dashboardData.zones : [
                { name: 'Zone A', total: 15, occupied: 0 },
                { name: 'Zone B', total: 12, occupied: 0 },
                { name: 'Zone C', total: 8, occupied: 0 },
              ]).map((zone, idx) => {
                const pct = zone.total ? Math.round((zone.occupied / zone.total) * 100) : 0;
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-700">{zone.name}</span>
                      <span className="text-xs text-slate-400">{zone.occupied}/{zone.total}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct > 70 ? 'bg-red-400' : pct > 40 ? 'bg-orange-400' : 'bg-green-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-0.5">
                      <span className="text-[10px] text-slate-400">Occupied: {zone.occupied}</span>
                      <span className="text-[10px] text-slate-400">Available: {zone.total - zone.occupied}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hourly chart */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Hourly Occupancy</h2>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={defaultHourly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="vehicles" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
