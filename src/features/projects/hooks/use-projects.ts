import { projectService } from '@/services/project.service';
import {
  CreateProjectData,
  Panel,
  ProjectListParams,
  ProjectPage,
  UpdateProjectData,
} from '@/types/projects';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query Keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (params: ProjectListParams) =>
    [...projectKeys.lists(), params] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  public: {
    all: ['public-projects'] as const,
    featured: () => [...projectKeys.public.all, 'featured'] as const,
    search: (params: any) =>
      [...projectKeys.public.all, 'search', params] as const,
  },
};

// --- Queries ---

export function useProjects(params: ProjectListParams = {}) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectService.listProjects(), // Note: listProjects in service might need param support if API supports filter
  });
}

export function useProject(id: string, loadImages: boolean = true) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectService.getProject(id), // Note: loadImages param support needed in service if backend supports it
    enabled: !!id,
  });
}

export function useFeaturedProjects() {
  return useQuery({
    queryKey: projectKeys.public.featured(),
    queryFn: () => projectService.getFeaturedProjects(),
  });
}

export function useSearchPublicProjects(params: {
  search?: string;
  tags?: string[];
  style?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: projectKeys.public.search(params),
    queryFn: () => projectService.searchPublicProjects(params),
  });
}

// --- Mutations ---

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectData) => projectService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectData }) =>
      projectService.updateProject(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useDuplicateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.duplicateProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

// Pages & Panels

export function useUpdateProjectPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      pageId,
      data,
    }: {
      projectId: string;
      pageId: string;
      data: Partial<ProjectPage>;
    }) => projectService.updatePage(projectId, pageId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(data.id) });
    },
  });
}

export function useAddProjectPanel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      pageId,
      panel,
    }: {
      projectId: string;
      pageId: string;
      panel: Omit<Panel, 'id'>;
    }) => projectService.addPanel(projectId, pageId, panel),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(data.id) });
    },
  });
}

export function useUpdateProjectPanel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      pageId,
      panelId,
      data,
    }: {
      projectId: string;
      pageId: string;
      panelId: string;
      data: Partial<Panel>;
    }) => projectService.updatePanel(projectId, pageId, panelId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(data.id) });
    },
  });
}

export function useDeleteProjectPanel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      pageId,
      panelId,
    }: {
      projectId: string;
      pageId: string;
      panelId: string;
    }) => projectService.deletePanel(projectId, pageId, panelId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(data.id) });
    },
  });
}
