import { ApiEndpoints } from '@/constants/server';
import { AuthResponse, User } from '@/hooks/use-auth';
import { AppApiClient } from '@/services/app-api-client';

/**
 * Service for handling all authentication-related API calls.
 */
class AuthService extends AppApiClient {
  /**
   * Log in a user with credentials.
   * @param credentials - The login payload (e.g. email, password)
   * @returns AuthResponse containing tokens and user data
   */
  async login(credentials: any): Promise<AuthResponse> {
    return this.post<AuthResponse>(ApiEndpoints.AUTH_LOGIN, credentials);
  }

  /**
   * Register a new user.
   * @param userData - The registration payload
   * @returns AuthResponse containing tokens and user data
   */
  async register(userData: any): Promise<AuthResponse> {
    return this.post<AuthResponse>(ApiEndpoints.AUTH_REGISTER, userData);
  }

  /**
   * Log in a user using a third-party identity token (e.g. Privy).
   * @param token - The identity token
   * @returns AuthResponse containing tokens and user data
   */
  async identityLogin(token: string): Promise<AuthResponse> {
    return this.post<AuthResponse>(ApiEndpoints.AUTH_IDENTITY_LOGIN, { token });
  }

  /**
   * Log out the current user.
   */
  async logout(): Promise<void> {
    await this.post(ApiEndpoints.AUTH_LOGOUT);
  }

  /**
   * Refreshes the access token.
   */
  async refreshToken(): Promise<string | null> {
    return this.refreshAccessToken();
  }

  /**
   * Fetch the current user's profile.
   * @returns The User object
   */
  async getProfile(): Promise<User> {
    return this.get<User>(ApiEndpoints.AUTH_PROFILE);
  }
}

export const authService = new AuthService();
