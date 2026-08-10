const BASE_URL = 'http://127.0.0.1:8000';

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${BASE_URL}/auth/token/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data.access_token;
  } catch {
    return null;
  }
}

export async function apiFetch(path, options = {}) {
  const accessToken = localStorage.getItem('access_token');

  const buildHeaders = (token) => ({
    ...options.headers,
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  let response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(accessToken),
  });

  if (response.status === 401) {
    const newToken = await refreshAccessToken();

    if (!newToken) {
      // refresh itself failed — session is truly dead, force logout
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('agency');
      window.location.href = '/'; // or wherever your login lives
      throw new Error('Session expired. Please log in again.');
    }

    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: buildHeaders(newToken),
    });
  }

  return response;
}