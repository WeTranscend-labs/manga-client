import { Route } from '@/constants';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { removeCookie, setCookie } from '@/utils/cookies';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';

// Safe hook for consuming auth state
export const useAuth = () => {
  return useAuthStore(
    useShallow((state) => ({
      user: state.user,
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      isAuthenticated: state.isAuthenticated,
      isSyncing: state.isSyncing,
      error: state.error,
      setSyncing: state.setSyncing,
      setUser: state.setUser,
      setTokens: state.setTokens,
      loadFromStorage: state.loadFromStorage,
      clear: state.clear,
      setError: state.setError,
      logout: state.logout,
    })),
  );
};

// Types matching actual API response
export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  plan: 'free' | 'premium' | 'pro';
  generationCount: number;
  monthlyGenerationLimit: number;
  settings: {
    language: string;
    theme: string;
    notifications: boolean;
  };
  isEmailVerified: boolean;
  address?: string;
  credits?: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  redirectUrl?: string; // Optional redirect URL from backend
}

export const authKeys = {
  user: ['auth', 'user'] as const,
};

export function useUser() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: authKeys.user,
    enabled: !!accessToken,
    queryFn: async () => {
      return authService.getProfile();
    },
    retry: false, // Don't retry if profile fetch fails (meaning not logged in)
    staleTime: Infinity, // User data doesn't change often
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (credentials: any) => authService.login(credentials),
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setCookie('accessToken', data.accessToken);
      setCookie('refreshToken', data.refreshToken);
      setUser(data.user);
      // Update user cache
      queryClient.setQueryData(authKeys.user, data.user);

      // Redirect
      // Check for backend provided redirectUrl first, then returnUrl param, then default
      const returnUrl =
        data.redirectUrl || searchParams.get('returnUrl') || Route.STUDIO;
      router.push(returnUrl);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: any) => authService.register(data),
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setCookie('accessToken', data.accessToken);
      setCookie('refreshToken', data.refreshToken);
      setUser(data.user);
      queryClient.setQueryData(authKeys.user, data.user);
      // Check for backend provided redirectUrl
      const returnUrl = data.redirectUrl || Route.STUDIO;
      router.push(returnUrl);
    },
  });
}

export function useIdentityLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (token: string) => authService.identityLogin(token),
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setCookie('accessToken', data.accessToken);
      setCookie('refreshToken', data.refreshToken);
      setUser(data.user);
      // Update user cache
      queryClient.setQueryData(authKeys.user, data.user);

      // Redirect
      const returnUrl =
        data.redirectUrl || searchParams.get('returnUrl') || Route.STUDIO;
      router.push(returnUrl);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      // Always clear local state even if server logout fails
      logout();
      removeCookie('accessToken');
      removeCookie('refreshToken');
      queryClient.clear(); // Clear all queries
      router.push(Route.LOGIN);
    },
  });
}
