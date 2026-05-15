const API_BASE = 'http://localhost:5000/api/admin';

export const getUsers = async () => {
  const res = await fetch(`${API_BASE}/users`, {
    credentials: 'include'
  });
  return res.json();
};

export const updateUserRole = async (userId, role) => {
  const res = await fetch(`${API_BASE}/role`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, role })
  });
  return res.json();
};

export const getPricing = async () => {
  const res = await fetch(`${API_BASE}/pricing`, {
    credentials: 'include'
  });
  return res.json();
};

export const updatePricing = async (pricing) => {
  const res = await fetch(`${API_BASE}/pricing`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pricing })
  });
  return res.json();
};
