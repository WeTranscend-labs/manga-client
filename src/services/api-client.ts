import { authStore } from './auth-client';

authStore.loadFromStorage();

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://backend-manga-generator.onrender.com';

/**
 * Base API Client providing common networking logic.
 * Decouples low-level fetch/axios details from domain services.
 */
export abstract class BaseApiClient {
  protected baseURL: string;

  constructor(baseURL: string = BACKEND_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Resolves relative URLs to the backend base URL.
   */
  protected resolveUrl(path: string): string {
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseURL}${cleanPath}`;
  }

  /**
   * Refreshes the access token if possible.
   */
  protected async refreshAccessToken(): Promise<string | null> {
    const refreshToken = authStore.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const res = await fetch(this.resolveUrl('/api/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return null;

      const raw = await res.json();
      const payload = raw?.data ?? raw;

      if (payload?.accessToken && payload?.refreshToken) {
        authStore.setTokens(payload.accessToken, payload.refreshToken);
        return payload.accessToken;
      }
    } catch (err) {
      console.error('Token refresh failed:', err);
    }

    return null;
  }

  /**
   * Handles API responses and standardizes errors.
   */
  protected async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(
        error.message || `API request failed with status ${res.status}`,
      );
    }
    const raw = await res.json();
    return (raw?.data ?? raw) as T;
  }

  /**
   * Core request method with auth injection and automatic retry on 401.
   */
  protected async request<T>(
    path: string,
    init: RequestInit = {},
    retry = true,
  ): Promise<T> {
    const token = authStore.getAccessToken();
    const headers = new Headers(init.headers || {});

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (
      !headers.has('Content-Type') &&
      (init.method === 'POST' ||
        init.method === 'PUT' ||
        init.method === 'PATCH')
    ) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(this.resolveUrl(path), { ...init, headers });

    // Handle session expiry and refresh
    if (res.status === 401 && retry) {
      const newToken = await this.refreshAccessToken();
      if (!newToken) {
        authStore.clear();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        throw new Error('Unauthenticated');
      }

      const retryHeaders = new Headers(init.headers || {});
      retryHeaders.set('Authorization', `Bearer ${newToken}`);

      const retryRes = await fetch(this.resolveUrl(path), {
        ...init,
        headers: retryHeaders,
      });
      return this.handleResponse<T>(retryRes);
    }

    return this.handleResponse<T>(res);
  }

  protected get<T>(
    path: string,
    options: Omit<RequestInit, 'method'> = {},
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  protected post<T>(
    path: string,
    body?: any,
    options: Omit<RequestInit, 'method' | 'body'> = {},
  ): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  protected put<T>(
    path: string,
    body?: any,
    options: Omit<RequestInit, 'method' | 'body'> = {},
  ): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  protected patch<T>(
    path: string,
    body?: any,
    options: Omit<RequestInit, 'method' | 'body'> = {},
  ): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  protected delete<T>(
    path: string,
    options: Omit<RequestInit, 'method'> = {},
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

class InternalApiClient extends BaseApiClient {}

/**
 * Legacy support for simple fetch calls.
 * Deprecated: Use Domain Services instead.
 */
export const apiFetch = async (
  input: RequestInfo,
  init: RequestInit = {},
): Promise<Response> => {
  const client = new InternalApiClient();
  const path = typeof input === 'string' ? input : input.url;

  // We return a Response object to maintain compatibility with legacy code
  // apiFetch was expected to return Response, not T.
  const token = authStore.getAccessToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const resolvedUrl = path.startsWith('/api/')
    ? `${BACKEND_BASE_URL}${path}`
    : path;
  return fetch(resolvedUrl, { ...init, headers });
};
