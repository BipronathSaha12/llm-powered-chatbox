const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const tokens = {
  getAccess: () => {
    try { return localStorage.getItem('access_token'); }
    catch { return null; }
  },
  getRefresh: () => {
    try { return localStorage.getItem('refresh_token'); }
    catch { return null; }
  },
  set: (access, refresh) => {
    try {
      if (access) localStorage.setItem('access_token', access);
      if (refresh) localStorage.setItem('refresh_token', refresh);
    } catch (e) {
      console.error('Failed to save tokens to localStorage', e);
    }
  },
  clear: () => {
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } catch (e) {
      console.error('Failed to clear tokens from localStorage', e);
    }
  }
};

export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const accessToken = tokens.getAccess();
  if (accessToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response = await fetch(url, { ...options, headers });

  // Handle Token Expiry (401) by attempting refresh
  if (response.status === 401 && tokens.getRefresh() && !options._retry) {
    options._retry = true;
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: tokens.getRefresh() })
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        tokens.set(data.access, data.refresh || tokens.getRefresh());
        headers.Authorization = `Bearer ${data.access}`;
        response = await fetch(url, { ...options, headers });
      } else {
        tokens.clear();
        window.dispatchEvent(new Event('auth:logout'));
      }
    } catch (err) {
      tokens.clear();
      window.dispatchEvent(new Event('auth:logout'));
    }
  }

  return response;
}
