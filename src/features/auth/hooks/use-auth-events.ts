import { authEventBus } from '@/lib';
import { useAuthStore } from '@/stores/auth.store';
import { useEffect } from 'react';

export const useAuthEvents = () => {
  const { logout, clear } = useAuthStore();

  useEffect(() => {
    const handleSessionExpired = () => {
      console.warn('Session expired. Logging out...');
      logout();
    };

    const handleRefreshFailed = () => {
      console.warn('Token refresh failed. Clearing auth...');
      // clear() might be enough, or logout() if we want full cleanup
      clear();
      // Optionally redirect here if not handled by protected routes
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    };

    authEventBus.on('SESSION_EXPIRED', handleSessionExpired);
    authEventBus.on('REFRESH_FAILED', handleRefreshFailed);

    return () => {
      authEventBus.off('SESSION_EXPIRED', handleSessionExpired);
      authEventBus.off('REFRESH_FAILED', handleRefreshFailed);
    };
  }, [logout, clear]);
};
