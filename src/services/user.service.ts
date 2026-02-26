import { ApiEndpoints } from '@/constants/server';
import { ApiClient } from '@/services/api-client';
import type { UserProfile } from '@/types';

/**
 * Service for handling all user-related API calls.
 */
class UserService extends ApiClient {
  /**
   * Fetch the current user's profile.
   */
  async getMyProfile(): Promise<UserProfile | null> {
    try {
      return await this.get<UserProfile>(ApiEndpoints.USERS_PROFILE);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      return null;
    }
  }

  /**
   * Update the current user's profile.
   */
  async updateMyProfile(
    payload: Partial<UserProfile>,
  ): Promise<UserProfile | null> {
    try {
      return await this.patch<UserProfile>(
        ApiEndpoints.USERS_UPDATE_PROFILE,
        payload,
      );
    } catch (error) {
      console.error('Failed to update profile:', error);
      return null;
    }
  }
}

export const userService = new UserService();
