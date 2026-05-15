import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Activity,
  CreditCard,
  Users,
  Map,
  LogOut,
  ChevronRight,
  ParkingSquare,
  UserCircle,
} from 'lucide-react';

const adminNavItems = [
  { id: 'dashboard',        label: 'Dashboard',       icon: LayoutDashboard, path: '/dashboard' },
  { id: 'parking-access',   label: 'Parking Access',  icon: Car,             path: '/parking-access' },
  { id: 'monitoring',       label: 'Monitoring',      icon: Activity,        path: '/monitoring' },
  { id: 'guidance-payment', label: 'Payment',         icon: CreditCard,      path: '/guidance-payment' },
  { id: 'administration',   label: 'Administration',  icon: Users,           path: '/administration' },
  { id: 'profile',          label: 'Profile',         icon: UserCircle,      path: '/profile' },
];

const userNavItems = [
  { id: 'dashboard',        label: 'Dashboard',          icon: LayoutDashboard, path: '/dashboard' },
  { id: 'monitoring',       label: 'Monitoring',         icon: Activity,        path: '/monitoring' },
  { id: 'guidance-payment', label: 'Guidance & Payment', icon: Map,             path: '/guidance-payment' },
  { id: 'profile',          label: 'Profile',            icon: UserCircle,      path: '/profile' },
];

const roleLabels = {
  admin: 'Administrator',
  operator: 'Operator',
  member: 'Member',
};

const roleColors = {
  admin: 'bg-purple-600',
  operator: 'bg-blue-600',
  member: 'bg-slate-500',
};

export default function Sidebar({ user, onLogout }) {
  const location = useLocation();
  const isAdmin = user?.role === 'admin' || user?.role === 'operator';
  const navItems = isAdmin ? adminNavItems : userNavItems;
  const displayName = user?.name || (user?.role === 'admin' ? 'Admin' : 'User');
  const initial = displayName.charAt(0).toUpperCase();
  const avatarColor = roleColors[user?.role] || 'bg-slate-500';

  return (
    <div className="w-56 bg-slate-900 flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <ParkingSquare className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">SmartPark</span>
        </div>
      </div>

      {/* Section label */}
      <div className="px-5 pt-5 pb-1.5">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
          Navigation
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              style={{ textDecoration: 'none' }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                }`}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-blue-500/60 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-3 border-t border-white/5 space-y-0.5">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className={`w-7 h-7 ${avatarColor} rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-200 truncate">{displayName}</div>
            <div className="text-[10px] text-slate-500">{roleLabels[user?.role] || 'User'}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer border-0 bg-transparent"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}
