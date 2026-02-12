import { ApiEndpoints } from '@/constants/api';
import { AppApiClient } from '@/services/app-api-client';
import { Project } from '@/types/projects';
import { formatUrl } from '@/utils/api-formatter';

/**
 * Service for handling all project-related API calls (CRUD, pages, panels).
 */
class ProjectService extends AppApiClient {
  /**
   * List all projects for the current user.
   */
  async listProjects(): Promise<Project[]> {
    return this.get<Project[]>(ApiEndpoints.PROJECTS_LIST);
  }

  /**
   * Create a new project.
   */
  async createProject(projectData: Partial<Project>): Promise<Project> {
    return this.post<Project>(ApiEndpoints.PROJECTS_CREATE, projectData);
  }

  /**
   * Get a single project by ID.
   */
  async getProject(id: string): Promise<Project> {
    const url = formatUrl(ApiEndpoints.PROJECTS_GET, { id });
    return this.get<Project>(url);
  }

  /**
   * Update a project.
   */
  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const url = formatUrl(ApiEndpoints.PROJECTS_UPDATE, { id });
    return this.put<Project>(url, updates);
  }

  /**
   * Delete a project.
   */
  async deleteProject(id: string): Promise<void> {
    const url = formatUrl(ApiEndpoints.PROJECTS_DELETE, { id });
    await this.delete(url);
  }

  /**
   * Duplicate a project.
   */
  async duplicateProject(id: string): Promise<Project> {
    const url = formatUrl(ApiEndpoints.PROJECTS_DUPLICATE, { id });
    return this.post<Project>(url);
  }

  /**
   * Get featured projects.
   */
  async getFeaturedProjects(): Promise<Project[]> {
    return this.get<Project[]>(ApiEndpoints.PROJECTS_FEATURED);
  }

  /**
   * Search public projects.
   */
  async searchPublicProjects(params: Record<string, any>): Promise<Project[]> {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString
      ? `${ApiEndpoints.PROJECTS_PUBLIC}?${queryString}`
      : ApiEndpoints.PROJECTS_PUBLIC;
    return this.get<Project[]>(url);
  }

  /**
   * Update a project page.
   */
  async updatePage(
    projectId: string,
    pageId: string,
    updates: any,
  ): Promise<Project> {
    const url = formatUrl(ApiEndpoints.PROJECT_PAGE_UPDATE, {
      projectId,
      pageId,
    });
    return this.put<Project>(url, updates);
  }

  /**
   * Add a panel to a page.
   */
  async addPanel(
    projectId: string,
    pageId: string,
    panel: any,
  ): Promise<Project> {
    const url = formatUrl(ApiEndpoints.PROJECT_PANEL_CREATE, {
      projectId,
      pageId,
    });
    return this.post<Project>(url, panel);
  }

  /**
   * Update a panel.
   */
  async updatePanel(
    projectId: string,
    pageId: string,
    panelId: string,
    updates: any,
  ): Promise<Project> {
    const url = formatUrl(ApiEndpoints.PROJECT_PANEL_UPDATE, {
      projectId,
      pageId,
      panelId,
    });
    return this.put<Project>(url, updates);
  }

  /**
   * Delete a panel.
   */
  async deletePanel(
    projectId: string,
    pageId: string,
    panelId: string,
  ): Promise<Project> {
    const url = formatUrl(ApiEndpoints.PROJECT_PANEL_DELETE, {
      projectId,
      pageId,
      panelId,
    });
    return this.delete<Project>(url);
  }
}

export const projectService = new ProjectService();
