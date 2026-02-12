import { ApiEndpoints } from '@/constants/api';
import { AppApiClient } from '@/services/app-api-client';
import { GeneratedManga, MangaProject, MangaSession } from '@/types';
import { formatUrl } from '@/utils/api-formatter';

export interface FetchPublicProjectsOptions {
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?:
    | 'newest'
    | 'oldest'
    | 'mostLiked'
    | 'mostViewed'
    | 'mostCommented'
    | 'trending';
  tags?: string[];
  ownerId?: string;
}

export interface FetchPublicProjectsResult {
  projects: MangaProject[];
  total: number;
}

/**
 * Service for handling all storage and project-related API calls.
 */
class StorageService extends AppApiClient {
  /**
   * Save project to backend
   */
  async saveProject(project: MangaProject): Promise<void> {
    await this.post(ApiEndpoints.PROJECTS_CREATE, project);
  }

  /**
   * Update project meta (title, preferences)
   */
  async updateProjectMeta(
    projectId: string,
    meta: {
      title?: string;
      preferences?: MangaProject['preferences'];
      isPublic?: boolean;
      description?: string;
      coverImageUrl?: string;
      tags?: string[];
    },
  ): Promise<void> {
    await this.post(ApiEndpoints.PROJECTS_UPDATE_META, { projectId, ...meta });
  }

  /**
   * Fetch projects for the current user.
   */
  async fetchMyProjects(): Promise<MangaProject[]> {
    try {
      const res = await this.get<MangaProject[]>(ApiEndpoints.PROJECTS_MY);
      return res || [];
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      return [];
    }
  }

  /**
   * Fetch public projects with sorting and filtering.
   */
  async fetchPublicProjects(
    options: FetchPublicProjectsOptions = {},
  ): Promise<FetchPublicProjectsResult> {
    const { limit = 50, offset = 0, search, sortBy, tags, ownerId } = options;

    try {
      const params: Record<string, string> = {
        limit: String(limit),
        offset: String(offset),
      };

      if (search) params.search = search;
      if (sortBy) params.sortBy = sortBy;
      if (tags && tags.length > 0) params.tags = tags.join(',');
      if (ownerId) params.ownerId = ownerId;

      // Note: We use the base request because we need to append query params manually for now
      // or we could enhance the ApiClient to support query params in get().
      const queryString = new URLSearchParams(params).toString();
      const url = `${ApiEndpoints.PROJECTS_PUBLIC}?${queryString}`;

      const res = await this.get<any>(url);
      const projects = res?.projects ?? [];
      const total = res?.total ?? projects.length;

      return { projects, total };
    } catch (error) {
      console.error('Failed to fetch public projects:', error);
      return { projects: [], total: 0 };
    }
  }

  /**
   * Fetch details for a public project.
   */
  async fetchPublicProjectDetail(
    ownerId: string,
    projectId: string,
    trackView: boolean = true,
  ): Promise<MangaProject | null> {
    try {
      const path = formatUrl(ApiEndpoints.PROJECTS_PUBLIC_DETAIL, {
        ownerId,
        projectId,
      });
      const url = trackView ? `${path}?trackView=true` : path;
      return await this.get<MangaProject>(url);
    } catch (error) {
      console.error('Failed to fetch public project detail:', error);
      return null;
    }
  }

  /**
   * Load project from backend by ID
   */
  async loadProject(id: string = 'default'): Promise<MangaProject | null> {
    try {
      const url = `${ApiEndpoints.PROJECTS_LIST}?id=${encodeURIComponent(id)}`;
      return await this.get<MangaProject>(url);
    } catch (error) {
      console.error('Failed to load project:', error);
      return null;
    }
  }

  /**
   * Load images for given IDs or URLs from backend.
   */
  async loadProjectImages(
    imageIdsOrUrls: string[],
  ): Promise<Record<string, string | null>> {
    if (!imageIdsOrUrls || imageIdsOrUrls.length === 0) return {};

    try {
      const res = await this.post<any>(ApiEndpoints.PROJECTS_IMAGES, {
        imageIds: imageIdsOrUrls,
      });
      return res?.images || {};
    } catch (error) {
      console.error('Failed to load project images:', error);
      return {};
    }
  }

  /**
   * Delete project from backend
   */
  async deleteProject(id: string = 'default'): Promise<void> {
    const url = `${ApiEndpoints.PROJECTS_LIST}?id=${encodeURIComponent(id)}`;
    await this.delete(url);
  }

  /**
   * Delete a single session from a project
   */
  async deleteSession(projectId: string, sessionId: string): Promise<void> {
    const url = `${ApiEndpoints.PROJECT_SESSIONS}?projectId=${encodeURIComponent(projectId)}&sessionId=${encodeURIComponent(sessionId)}`;
    await this.delete(url);
  }

  /**
   * Delete many pages from a project
   */
  async deletePages(projectId: string, pageIds: string[]): Promise<void> {
    if (!pageIds || pageIds.length === 0) return;

    const url = `${ApiEndpoints.PROJECT_PAGE_UPDATE.replace('/{{pageId}}', '')}?projectId=${encodeURIComponent(projectId)}&pageIds=${encodeURIComponent(pageIds.join(','))}`;
    // Fallback if specific DELETE endpoint for multiple pages isn't clear, assuming same as sessions/pages logic
    await this.delete(url);
  }

  /**
   * Delete single image from backend
   */
  async deleteImage(imageId: string): Promise<void> {
    if (!imageId) return;
    const url = `${ApiEndpoints.IMAGES_DELETE}?id=${encodeURIComponent(imageId)}`;
    await this.delete(url);
  }

  /**
   * Delete multiple images from backend
   */
  async deleteImages(imageIds: string[]): Promise<void> {
    if (!imageIds || imageIds.length === 0) return;
    const url = `${ApiEndpoints.IMAGES_DELETE}?ids=${encodeURIComponent(imageIds.join(','))}`;
    await this.delete(url);
  }

  /**
   * Add or update a page in a specific session
   */
  async addPageToSession(
    projectId: string,
    sessionId: string,
    page: GeneratedManga,
  ): Promise<void> {
    await this.post(ApiEndpoints.PROJECT_SESSIONS_PAGE, {
      projectId,
      sessionId,
      page,
    });
  }

  /**
   * Toggle markedForExport flag for a page
   */
  async markPageForExport(
    projectId: string,
    sessionId: string,
    pageId: string,
    marked: boolean,
  ): Promise<void> {
    await this.post(ApiEndpoints.PROJECT_SESSIONS_PAGE_MARK, {
      projectId,
      sessionId,
      pageId,
      marked,
    });
  }

  /**
   * Save single session state
   */
  async saveSession(projectId: string, session: MangaSession): Promise<void> {
    await this.post(ApiEndpoints.PROJECT_SESSIONS_SAVE, { projectId, session });
  }
}

export const storageService = new StorageService();
