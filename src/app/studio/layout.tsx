'use client';

import { AppContainer } from '@/features/app-shell';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    // Check authentication
    if (!accessToken && !isAuthenticated) {
      // Wait a bit to ensure hydration (though persist should handle it, just in case)
      // Actually, if we rely on persist, we might be incorrectly redirected if hydration hasn't happened.
      // But zustand persist usually hydrates synchronously if it can or very fast? No, async for AsyncStorage/IndexedDB, synchronous for localStorage?
      // standard create(persist) is synchronous for localStorage.

      // However, we should double check if token allows it (legacy)
      const localToken =
        typeof window !== 'undefined'
          ? localStorage.getItem('accessToken')
          : null;
      if (!localToken) {
        router.push('/auth/login');
      } else {
        setIsChecking(false);
      }
    } else {
      setIsChecking(false);
    }
  }, [router, accessToken, isAuthenticated]);

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <div className="text-zinc-400 text-sm">
            Checking authentication...
          </div>
        </div>
      </div>
    );
  }

  return <AppContainer>{children}</AppContainer>;
}
