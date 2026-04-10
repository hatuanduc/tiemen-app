import { getToken } from './auth';

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const runtime = window.__TIEMEN__?.apiBaseUrl?.trim();
    if (runtime) return runtime;
  }

  // build-time fallback for local/dev
  return process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:4000';
}

function errorMessageFromJson(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  if (!('message' in data)) return null;

  const message = (data as Record<string, unknown>).message;
  if (typeof message === 'string') return message;
  if (message == null) return null;
  return String(message);
}

async function request<T>(
  path: string,
  init?: RequestInit & { auth?: boolean },
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const headers = new Headers(init?.headers);
  headers.set('content-type', 'application/json');

  if (init?.auth) {
    const token = getToken();
    if (token) headers.set('authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const message = errorMessageFromJson(data) ?? `Request failed: ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

export type LoginResponse = {
  token: string;
  user: { id: string; email: string; name: string };
};

export async function login(email: string, password: string) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function me() {
  return request<{ user: { id: string; email: string; name: string } }>(
    '/auth/me',
    {
      method: 'GET',
      auth: true,
    },
  );
}
