'use client';

import { SplashScreen } from '@/components/ui/splash-screen';
import { PUBLIC_ROUTES, Route } from '@/constants';
import { useAuth, useIdentityLogin, useUser } from '@/hooks/use-auth';
import { formatUrl } from '@/utils/api-formatter';
import { useIdentityToken, usePrivy as useWallet } from '@privy-io/react-auth';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useRef } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading: isUserLoading } = useUser();
  const { isAuthenticated, setSyncing } = useAuth();

  const {
    user: web3User,
    authenticated: isWeb3Authenticated,
    ready,
  } = useWallet();
  const { identityToken } = useIdentityToken();
  const { mutate: identityLogin } = useIdentityLogin();
  const syncAttempted = useRef(false);

  useEffect(() => {
    const syncUser = async () => {
      // If Privy is authenticated but our backend isn't, attempt to sync
      if (
        ready &&
        isWeb3Authenticated &&
        web3User &&
        !isAuthenticated &&
        !syncAttempted.current
      ) {
        syncAttempted.current = true;
        setSyncing(true);
        try {
          // Using identityToken (OIDC ID Token) for backend verification
          if (identityToken) {
            console.log(
              '[AuthProvider] Syncing Web3 User with backend using Identity Token...',
            );
            identityLogin(identityToken, {
              onSettled: () => setSyncing(false),
            });
          } else {
            console.warn('[AuthProvider] No identity token available for sync');
            setSyncing(false);
          }
        } catch (error) {
          console.error('[AuthProvider] Failed to sync session:', error);
          syncAttempted.current = false;
          setSyncing(false);
        }
      }
    };

    syncUser();
  }, [
    ready,
    isWeb3Authenticated,
    web3User,
    isAuthenticated,
    identityLogin,
    identityToken,
    setSyncing,
  ]);

  useEffect(() => {
    if (ready && !isUserLoading) {
      const isPublicRoute = PUBLIC_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + '/'),
      );

      if (!isPublicRoute && !isAuthenticated && !isWeb3Authenticated) {
        router.push(formatUrl(Route.LOGIN, { returnUrl: pathname }));
      }
    }
  }, [
    isUserLoading,
    isAuthenticated,
    isWeb3Authenticated,
    ready,
    pathname,
    router,
  ]);

  if (isUserLoading || !ready) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
