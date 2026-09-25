import { apiFetch, tokens } from './client';

export async function loginUser(username, password) {
  const res = await apiFetch('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.detail || 'Login failed. Please check credentials.');
  }
  tokens.set(data.access, data.refresh);
  return data;
}

export async function registerUser(username, email, password, passwordConfirm) {
  const res = await apiFetch('/auth/register/', {
    method: 'POST',
    body: JSON.stringify({
      username,
      email,
      password,
      password_confirm: passwordConfirm
    })
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data.error?.message || (data.password ? data.password[0] : null) || (data.username ? data.username[0] : null) || 'Registration failed.';
    throw new Error(errorMsg);
  }
  tokens.set(data.access, data.refresh);
  return data;
}

export async function logoutUser() {
  const refresh = tokens.getRefresh();
  try {
    if (refresh) {
      await apiFetch('/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh })
      });
    }
  } finally {
    tokens.clear();
    window.dispatchEvent(new Event('auth:logout'));
  }
}

export async function getCurrentUser() {
  const res = await apiFetch('/auth/me/');
  if (!res.ok) return null;
  return await res.json();
}
