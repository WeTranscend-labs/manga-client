import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User } from '../hooks/use-auth';

interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  loadFromStorage: () => void;
  clear: () => void;
  setError: (err: string | null) => void;
  logout: () => void;
}

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  error: null,
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setUser: (user) => set({ user, isAuthenticated: !!user }),

        setTokens: (accessToken, refreshToken) => {
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
          }
          set({
            accessToken,
            refreshToken,
            isAuthenticated: true,
            error: null,
          });
        },

        loadFromStorage: () => {
          if (typeof window === 'undefined') return;
          const access = localStorage.getItem('accessToken');
          const refresh = localStorage.getItem('refreshToken');
          set({
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: !!access,
          });
        },

        clear: () => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('authError');
          }
          set(initialState);
        },

        setError: (err) => set({ error: err }),

        logout: () => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
          set(initialState);
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
    { name: 'AuthStore' },
  ),
);

// Non-React wrapper for use outside of components (e.g. in services)
export const authStore = {
  loadFromStorage: () => useAuthStore.getState().loadFromStorage(),
  getAccessToken: () => useAuthStore.getState().accessToken,
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  setTokens: (access: string, refresh: string) =>
    useAuthStore.getState().setTokens(access, refresh),
  clear: () => useAuthStore.getState().clear(),
  setError: (err: string | null) => useAuthStore.getState().setError(err),
};
