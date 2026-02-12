'use client';

import { LoadingPage } from '@/components/ui/loading';
import { PUBLIC_ROUTES, ROUTES } from '@/constants/routes';
import { useUser } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth.store';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading: isUserLoading } = useUser();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isUserLoading) {
      const isPublicRoute = PUBLIC_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + '/'),
      );

      if (!isPublicRoute && !isAuthenticated) {
        router.push(ROUTES.AUTH.LOGIN);
      }
    }
  }, [isUserLoading, isAuthenticated, pathname, router]);

  if (isUserLoading) {
    return <LoadingPage message="Setting up your workspace..." />;
  }

  return <>{children}</>;
}
