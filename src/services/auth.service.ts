import { ApiEndpoints } from '@/constants/api';
import { AuthResponse, User } from '@/hooks/use-auth';
import { BaseApiClient } from '@/services/api-client';

/**
 * Service for handling all authentication-related API calls.
 */
class AuthService extends BaseApiClient {
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
   * Log out the current user.
   */
  async logout(): Promise<void> {
    await this.post(ApiEndpoints.AUTH_LOGOUT);
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
