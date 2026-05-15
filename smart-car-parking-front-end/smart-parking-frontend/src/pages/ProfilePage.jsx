import React from 'react';
import { User, Mail, Hash, Car, BadgeCheck } from 'lucide-react';

const roleBadge = {
  admin:    'bg-purple-100 text-purple-700',
  operator: 'bg-blue-100 text-blue-700',
  member:   'bg-slate-100 text-slate-600',
};

const avatarColor = {
  admin:    'bg-purple-600',
  operator: 'bg-blue-600',
  member:   'bg-slate-500',
};

const roleLabel = {
  admin:    'Administrator',
  operator: 'Operator',
  member:   'Member',
};

export default function ProfilePage({ user }) {
  const infoRows = user
    ? [
        { icon: Hash,       label: 'Student ID',              value: user.student_id || '—' },
        { icon: Mail,       label: 'Email',                   value: user.email },
        { icon: Car,        label: 'Registered License Plate', value: user.license_plate || '—' },
        { icon: BadgeCheck, label: 'Role',                    value: roleLabel[user.role] || user.role },
      ]
    : [];

  if (!user) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 text-center text-sm text-slate-400">
        No profile data available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-400 mt-0.5">View and manage your account information</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Avatar card */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center">
          <div className={`w-16 h-16 ${avatarColor[user.role] || 'bg-slate-500'} rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4`}>
            {(user.name || 'U').charAt(0).toUpperCase()}
          </div>
          <h2 className="text-base font-semibold text-slate-900 mb-1">{user.name}</h2>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${roleBadge[user.role] || roleBadge.member}`}>
            {roleLabel[user.role] || user.role}
          </span>

          <div className="mt-5 w-full border-t border-slate-100 pt-4">
            <div className="flex items-center justify-center gap-1.5 text-xs text-green-600 font-medium">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Active Account
            </div>
          </div>
        </div>

        {/* Info card */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">Account Information</h2>
          </div>

          <div className="divide-y divide-slate-50">
            {infoRows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="px-5 py-4 flex items-center gap-4">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide self-center">
                    {label}
                  </span>
                  <span className="text-sm font-medium text-slate-900 self-center">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
