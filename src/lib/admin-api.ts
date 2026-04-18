export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

type AuthUser = { id: string; name: string; email?: string | null; role: string; permissions?: string[] };

function getAccessToken(): string | null {
  return localStorage.getItem("token");
}

function setAccessToken(token: string) {
  localStorage.setItem("token", token);
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearStoredAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const resp = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!resp.ok) return null;
    const data = (await resp.json()) as { success?: boolean; token?: string };
    if (!data?.token) return null;
    setAccessToken(data.token);
    return data.token;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const doFetch = async () =>
    fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      headers,
      ...init,
    });

  let response = await doFetch();
  if (response.status === 401 && token) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers.Authorization = `Bearer ${refreshed}`;
      response = await doFetch();
    } else {
      clearStoredAuth();
    }
  }

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const message = data?.error ?? data?.message ?? "Request failed";
    throw new Error(message);
  }

  return data as T;
}

export async function blobRequest(path: string, init?: RequestInit): Promise<Blob> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const doFetch = async () =>
    fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      headers,
      ...init,
    });

  let response = await doFetch();
  if (response.status === 401 && token) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers.Authorization = `Bearer ${refreshed}`;
      response = await doFetch();
    } else {
      clearStoredAuth();
    }
  }

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json") ? await response.json() : null;
    const message = data?.error ?? data?.message ?? "Request failed";
    throw new Error(message);
  }

  return response.blob();
}
