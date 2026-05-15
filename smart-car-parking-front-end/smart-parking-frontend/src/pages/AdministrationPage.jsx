import React, { useEffect, useState } from 'react';
import { Shield, ChevronDown, Check, UserPlus, Car, Bike, Truck, DollarSign } from 'lucide-react';
import { getUsers, updateUserRole, getPricing, updatePricing } from '../api/admin';

const VEHICLE_TYPES = ['Car', 'Motorcycle', 'Truck'];
const PRICE_FIELDS = [
  { key: 'firstHour',      label: 'First Hour' },
  { key: 'additionalHour', label: 'Additional Hour' },
  { key: 'dailyMax',       label: 'Daily Max' },
];
const VEHICLE_ICONS = { Car, Motorcycle: Bike, Truck };

const roleBadge = {
  admin:    'bg-purple-100 text-purple-700 border-purple-200',
  operator: 'bg-blue-100 text-blue-700 border-blue-200',
  member:   'bg-slate-100 text-slate-600 border-slate-200',
};

const avatarColor = {
  admin:    'bg-purple-600',
  operator: 'bg-blue-600',
  member:   'bg-slate-500',
};

export default function AdministrationPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [savedId, setSavedId] = useState(null);

  const [pricingDraft, setPricingDraft] = useState(null);
  const [savingPrice, setSavingPrice] = useState(false);
  const [priceSaved, setPriceSaved] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await getUsers();
        if (!response.success) throw new Error(response.message || 'Cannot load users');
        setUsers(response.users || []);
      } catch (err) {
        console.error(err);
        setError('Cannot load user list.');
      } finally {
        setLoading(false);
      }
    };

    const loadPricing = async () => {
      try {
        const response = await getPricing();
        if (response.success) {
          setPricingDraft(JSON.parse(JSON.stringify(response.pricing)));
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadUsers();
    loadPricing();
  }, []);

  const handleRoleChange = (id, role) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, role } : u)));
  };

  const handleSaveRole = async (id) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    setUpdatingUserId(id);
    try {
      const response = await updateUserRole(id, user.role);
      if (!response.success) throw new Error(response.message || 'Unable to update role');
      setSavedId(id);
      setTimeout(() => setSavedId(null), 2000);
    } catch (err) {
      alert('Update role failed: ' + err.message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handlePriceInput = (vehicleType, field, value) => {
    setPricingDraft((prev) => ({
      ...prev,
      [vehicleType]: { ...prev[vehicleType], [field]: value },
    }));
    setPriceSaved(false);
  };

  const handleSavePricing = async () => {
    const parsed = {};
    for (const vt of VEHICLE_TYPES) {
      parsed[vt] = {};
      for (const { key } of PRICE_FIELDS) {
        const val = parseFloat(pricingDraft[vt][key]);
        if (isNaN(val) || val < 0) return alert(`Invalid price: ${vt} / ${key}`);
        parsed[vt][key] = val;
      }
    }
    setSavingPrice(true);
    try {
      const response = await updatePricing(parsed);
      if (response.success) {
        setPricingDraft(JSON.parse(JSON.stringify(response.pricing)));
        setPriceSaved(true);
        setTimeout(() => setPriceSaved(false), 3000);
      } else {
        alert('Failed to save pricing.');
      }
    } catch (err) {
      alert('Server connection error.');
    } finally {
      setSavingPrice(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Administration</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage user accounts and access permissions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer border-0">
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: users.length,                                     color: 'bg-slate-50 border-slate-200 text-slate-900' },
          { label: 'Active',      value: users.filter((u) => u.status === 'Active').length, color: 'bg-green-50 border-green-100 text-green-700' },
          { label: 'Admins',      value: users.filter((u) => u.role === 'admin').length,    color: 'bg-purple-50 border-purple-100 text-purple-700' },
        ].map((s) => (
          <div key={s.label} className={`border rounded-xl p-4 ${s.color}`}>
            <div className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5">{s.label}</div>
            <div className="text-2xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      {/* User management table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-purple-600" />
          </div>
          <h2 className="text-sm font-semibold text-slate-900">User Management</h2>
          <span className="ml-auto text-xs text-slate-400">{users.length} users</span>
        </div>

        {loading && (
          <div className="px-5 py-8 text-center text-sm text-slate-400">Loading users...</div>
        )}
        {error && (
          <div className="px-5 py-4 text-sm text-red-600">{error}</div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['User', 'Email', 'Role', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${avatarColor[user.role] || 'bg-slate-500'} rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
                          {(user.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-500">{user.email}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="relative inline-flex">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={updatingUserId === user.id}
                          className={`appearance-none pl-3 pr-6 py-1.5 rounded-full text-xs font-semibold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${roleBadge[user.role] || roleBadge.member}`}
                        >
                          <option value="admin">admin</option>
                          <option value="operator">operator</option>
                          <option value="member">member</option>
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleSaveRole(user.id)}
                        disabled={updatingUserId === user.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                          savedId === user.id
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {updatingUserId === user.id ? (
                          'Updating…'
                        ) : savedId === user.id ? (
                          <><Check className="w-3 h-3" /> Saved</>
                        ) : (
                          'Save'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pricing management */}
      {pricingDraft && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">Pricing Management</h2>
            <span className="ml-auto text-xs text-slate-400">Rates by vehicle type</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    Vehicle Type
                  </th>
                  {PRICE_FIELDS.map((f) => (
                    <th key={f.key} className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                      {f.label} ($)
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {VEHICLE_TYPES.map((vt) => {
                  const Icon = VEHICLE_ICONS[vt] || Car;
                  return (
                    <tr key={vt} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-4 h-4 text-slate-500" />
                          </div>
                          <span className="text-sm font-medium text-slate-900">{vt}</span>
                        </div>
                      </td>
                      {PRICE_FIELDS.map(({ key }) => (
                        <td key={key} className="px-5 py-4">
                          <input
                            type="number"
                            min="0"
                            step="0.25"
                            value={pricingDraft[vt]?.[key] ?? ''}
                            onChange={(e) => handlePriceInput(vt, key, e.target.value)}
                            className="w-28 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              {priceSaved && (
                <span className="flex items-center gap-1.5 text-sm text-green-700 font-medium">
                  <Check className="w-4 h-4" />
                  Saved successfully
                </span>
              )}
            </div>
            <button
              onClick={handleSavePricing}
              disabled={savingPrice}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer border-0"
            >
              {savingPrice ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
