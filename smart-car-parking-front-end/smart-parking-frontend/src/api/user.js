const API_BASE = 'http://localhost:5000/api/auth';

export const getUserProfile = async () => {
  const res = await fetch(`${API_BASE}/profile`, {
    credentials: 'include'
  });
  return res.json();
};
