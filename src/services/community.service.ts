import { ApiEndpoints } from '@/constants/server';
import { ApiClient } from '@/services/api-client';
import type { MangaProject, ProjectComment } from '@/types';
import { formatUrl } from '@/utils/api-formatter';

export interface LikeStatus {
  total: number;
  likedByUser: boolean;
}

/**
 * Service for handling community-related API calls (trending, likes, comments).
 */
class CommunityService extends ApiClient {
  /**
   * Fetch details for a public project.
   */
  async fetchPublicProjectDetail(
    ownerId: string,
    projectId: string,
  ): Promise<MangaProject | null> {
    try {
      const url = formatUrl(ApiEndpoints.PROJECTS_PUBLIC_DETAIL, {
        ownerId,
        projectId,
      });
      return await this.get<MangaProject>(url);
    } catch (error) {
      console.error('Failed to fetch public project detail:', error);
      return null;
    }
  }

  /**
   * Fetch like count and liked status for a project.
   */
  async fetchLikes(ownerId: string, projectId: string): Promise<LikeStatus> {
    try {
      const url = formatUrl(ApiEndpoints.COMMUNITY_LIKES, {
        ownerId,
        projectId,
      });
      return await this.get<LikeStatus>(url);
    } catch (error) {
      console.error('Failed to fetch likes:', error);
      return { total: 0, likedByUser: false };
    }
  }

  /**
   * Toggle like status for a project.
   */
  async toggleLike(ownerId: string, projectId: string): Promise<LikeStatus> {
    try {
      const url = formatUrl(ApiEndpoints.COMMUNITY_LIKE_TOGGLE, {
        ownerId,
        projectId,
      });
      return await this.post<LikeStatus>(url);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      return { total: 0, likedByUser: false };
    }
  }

  /**
   * Fetch comments for a project.
   */
  async fetchComments(
    ownerId: string,
    projectId: string,
  ): Promise<ProjectComment[]> {
    try {
      const url = formatUrl(ApiEndpoints.COMMUNITY_COMMENTS, {
        ownerId,
        projectId,
      });
      return await this.get<ProjectComment[]>(url);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      return [];
    }
  }

  /**
   * Add a comment to a project.
   */
  async addComment(
    ownerId: string,
    projectId: string,
    text: string,
    parentId?: string | null,
  ): Promise<ProjectComment | null> {
    try {
      const url = formatUrl(ApiEndpoints.COMMUNITY_COMMENT_ADD, {
        ownerId,
        projectId,
      });
      return await this.post<ProjectComment>(url, { text, parentId });
    } catch (error) {
      console.error('Failed to add comment:', error);
      return null;
    }
  }

  /**
   * Fetch trending projects.
   */
  async fetchTrendingProjects(limit: number = 10): Promise<MangaProject[]> {
    try {
      const url = formatUrl(ApiEndpoints.COMMUNITY_TRENDING, { limit });
      return await this.get<MangaProject[]>(url);
    } catch (error) {
      console.error('Failed to fetch trending projects:', error);
      return [];
    }
  }

  /**
   * Fetch related projects for a given project.
   */
  async fetchRelatedProjects(
    ownerId: string,
    projectId: string,
    limit: number = 6,
  ): Promise<MangaProject[]> {
    try {
      const url = formatUrl(ApiEndpoints.COMMUNITY_RELATED, {
        ownerId,
        projectId,
        limit,
      });
      return await this.get<MangaProject[]>(url);
    } catch (error) {
      console.error('Failed to fetch related projects:', error);
      return [];
    }
  }
}

export const communityService = new CommunityService();
