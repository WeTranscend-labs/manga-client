import { authService } from '@/services';
import { useAuthStore } from '@/stores/auth.store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';

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
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authKeys = {
  user: ['auth', 'user'] as const,
};

export function useUser() {
  const setUser = useAuthStore((state) => state.setUser);
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: authKeys.user,
    enabled: !!accessToken,
    queryFn: async () => {
      const user = await authService.getProfile();
      setUser(user);
      return user;
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
      setUser(data.user);
      // Update user cache
      queryClient.setQueryData(authKeys.user, data.user);

      // Redirect
      const returnUrl = searchParams.get('returnUrl') || '/studio';
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
      setUser(data.user);
      queryClient.setQueryData(authKeys.user, data.user);
      router.push('/studio'); // Or profile setup
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
      queryClient.clear(); // Clear all queries
      router.push('/auth/login');
    },
  });
}
