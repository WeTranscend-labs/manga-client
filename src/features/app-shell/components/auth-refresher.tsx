'use client';

import { useEffect } from 'react';

import { authService } from '@/services/auth.service';
import { authStore } from '@/stores/auth.store';

const REFRESH_INTERVAL_MS = 14.5 * 60 * 1000; // ~14.5 minutes (near 15m access token TTL)

export function AuthRefresher() {
  useEffect(() => {
    authStore.loadFromStorage();

    let inFlight = false;

    const tick = async () => {
      if (inFlight) return;

      const refreshToken = authStore.getRefreshToken();
      if (!refreshToken) return;

      inFlight = true;
      try {
        const newAccess = await authService.refreshToken();
        if (!newAccess) {
          authStore.clear();
          window.location.href = '/auth/login';
        }
      } finally {
        inFlight = false;
      }
    };

    // refresh once on mount, then periodically
    void tick();
    const id = window.setInterval(() => void tick(), REFRESH_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, []);

  return null;
}
