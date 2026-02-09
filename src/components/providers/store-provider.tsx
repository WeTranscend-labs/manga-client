'use client';

import { LoadingPage } from '@/components/ui/loading';
import { ModalContainer } from '@/components/ui/modal';
import { NotificationContainer } from '@/components/ui/notification';
import { useUser } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { useIsMutating } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const { isLoading: isUserLoading, data: user } = useUser();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated); // OR !!user
  const { setIsMobile, setTheme, theme } = useUIStore();
  const router = useRouter();
  const pathname = usePathname();

  // Handle mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile]);

  // Handle theme changes
  useEffect(() => {
    if (theme === 'system') {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      document.documentElement.classList.toggle('dark', prefersDark);

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle('dark', e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  // Handle route protection
  useEffect(() => {
    // Only redirect if we are sure we are not loading user
    if (!isUserLoading && !isAuthenticated && !user) {
      const publicRoutes = [
        '/auth/login',
        '/auth/register',
        '/landing-v2',
        '/',
      ];
      const isPublicRoute = publicRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + '/'),
      );

      if (!isPublicRoute) {
        // Double check token existence to avoid premature redirect?
        // useUser handles token check internally via fetchWrapper
        router.push('/auth/login');
      }
    }
  }, [isAuthenticated, isUserLoading, user, pathname, router]);

  // Show loading during initialization
  if (isUserLoading) {
    return (
      <LoadingPage
        title="Initializing Application"
        message="Setting up your workspace..."
      />
    );
  }

  return (
    <>
      {children}
      <NotificationContainer />
      <ModalContainer />
    </>
  );
}

// Hook to use store loading states in components
export function useStoreLoading() {
  // Use React Query's isMutating to detect global mutation loading if needed
  const isMutating = useIsMutating();
  const authLoading = isMutating > 0;

  const uiLoading = useUIStore((state) => state.globalLoading);

  return {
    authLoading,
    uiLoading,
    isAnyLoading: authLoading || uiLoading,
  };
}
