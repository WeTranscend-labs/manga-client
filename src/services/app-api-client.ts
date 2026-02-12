import { ApiClient } from '@/services/api-client';
import { authStore } from '@/stores/auth.store';

/**
 * Base API client for the application.
 * Injects the global authStore into the generic ApiClient.
 * Services should extend this class to inherit standard behavior without configuration boilerplate.
 */
export class AppApiClient extends ApiClient {
  constructor() {
    super({
      getAccessToken: () => authStore.getAccessToken(),
      getRefreshToken: () => authStore.getRefreshToken(),
      onTokenRefreshed: (access, refresh) =>
        authStore.setTokens(access, refresh),
      onSessionExpired: () => authStore.clear(),
    });
  }
}
