const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('whosnext_token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options?.headers,
    },
  });

  // Sliding session: the backend hands back a fresh token as the current one
  // ages, so an active user stays logged in indefinitely. Swap it in.
  const refreshed = res.headers.get('X-Refreshed-Token');
  if (refreshed) {
    localStorage.setItem('whosnext_token', refreshed);
  }

  if (res.status === 401) {
    // Token missing/expired/invalid — clear it and send the user to login.
    // Skip the redirect on auth endpoints so a bad login just surfaces its error.
    localStorage.removeItem('whosnext_token');
    if (!path.startsWith('/auth/') && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    const body = await res.text();
    throw new Error(`API error 401: ${body}`);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: (path: string) =>
    request<void>(path, { method: 'DELETE' }),
};
