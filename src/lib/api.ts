// Base URL of the backend API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Helper for making authenticated API calls to the backend
 */
export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  return res;
}

/**
 * Authenticated fetch — includes JWT token from session
 */
export async function authFetch(path: string, token: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  return res;
}
