import { BACKEND_BASE_URL } from '@/constants/server';
import { authEventBus } from '@/lib/auth-events';
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { toast } from 'sonner';

export interface ApiRequestConfig extends AxiosRequestConfig {
  disableToast?: boolean;
  _retry?: boolean;
}

export interface ApiClientConfig {
  baseURL?: string;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  onTokenRefreshed: (access: string, refresh: string) => void;
  onSessionExpired: () => void;
}

export class ApiClient {
  protected instance: AxiosInstance;
  protected config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
    this.instance = axios.create({
      baseURL: config.baseURL || BACKEND_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.config.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.instance.interceptors.response.use(
      (response) => {
        const raw = response.data;
        return raw?.data ?? raw;
      },
      async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig &
          ApiRequestConfig;

        if (error.response?.status === 401) {
          // If the request that failed with 401 was the refresh request itself, logout immediately
          if (originalRequest.url?.includes('/api/auth/refresh')) {
            console.log('[ApiClient] Refresh token failed, logging out');
            this.config.onSessionExpired();
            authEventBus.emit('SESSION_EXPIRED');
            return Promise.reject(error);
          }

          if (!originalRequest._retry) {
            console.log('[ApiClient] 401 detected, attempting refresh');
            originalRequest._retry = true;

            try {
              const newToken = await this.refreshAccessToken();
              if (newToken) {
                console.log('[ApiClient] Token refreshed successfully');
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }
                return this.instance(originalRequest);
              }
            } catch (refreshError) {
              console.error('[ApiClient] Token refresh failed', refreshError);
            }

            console.log('[ApiClient] Session expired, clearing auth');
            this.config.onSessionExpired();
            authEventBus.emit('SESSION_EXPIRED');
          }
        }

        const message =
          (error.response?.data as any)?.message ||
          error.message ||
          'API request failed';

        if (!originalRequest.disableToast) {
          toast.error(message);
        }

        return Promise.reject(new Error(message));
      },
    );
  }

  protected async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.config.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const res = await axios.post(
        `${this.instance.defaults.baseURL}/api/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      );

      const data = res.data?.data ?? res.data;

      if (data?.accessToken && data?.refreshToken) {
        this.config.onTokenRefreshed(data.accessToken, data.refreshToken);
        return data.accessToken;
      }
    } catch (err) {
      console.error('Token refresh failed');
      authEventBus.emit('REFRESH_FAILED');
    }

    return null;
  }

  public async get<T>(url: string, config?: ApiRequestConfig): Promise<T> {
    return this.instance.get<any, T>(url, config);
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: ApiRequestConfig,
  ): Promise<T> {
    return this.instance.post<any, T>(url, data, config);
  }

  public async put<T>(
    url: string,
    data?: any,
    config?: ApiRequestConfig,
  ): Promise<T> {
    return this.instance.put<any, T>(url, data, config);
  }

  public async patch<T>(
    url: string,
    data?: any,
    config?: ApiRequestConfig,
  ): Promise<T> {
    return this.instance.patch<any, T>(url, data, config);
  }

  public async delete<T>(url: string, config?: ApiRequestConfig): Promise<T> {
    return this.instance.delete<any, T>(url, config);
  }

  public async request<T>(config: ApiRequestConfig): Promise<T> {
    return this.instance.request<any, T>(config);
  }
}
