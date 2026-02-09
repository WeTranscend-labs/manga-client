import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Project } from '../api/projects';

interface ProjectsState {
  // State
  currentProject: Project | null; // Working copy for editing

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  // Filters
  filters: {
    search: string;
    status: string;
    sort: string;
  };

  // Actions
  setCurrentProject: (project: Project | null) => void;
  setPagination: (pagination: Partial<ProjectsState['pagination']>) => void;
  setFilters: (filters: Partial<ProjectsState['filters']>) => void;

  // Project management (Local state updates for optimistic UI or working copy)
  updateCurrentProject: (updates: Partial<Project>) => void;

  // Utility
  reset: () => void;
}

const initialState = {
  currentProject: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  filters: {
    search: '',
    status: '',
    sort: '-createdAt',
  },
};

export const useProjectsStore = create<ProjectsState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // Sync actions
        setCurrentProject: (project) => set({ currentProject: project }),
        setPagination: (pagination) =>
          set((state) => ({
            pagination: { ...state.pagination, ...pagination },
          })),
        setFilters: (filters) =>
          set((state) => ({
            filters: { ...state.filters, ...filters },
          })),

        // Local project management
        updateCurrentProject: (updates) => {
          set((state) => ({
            currentProject: state.currentProject
              ? { ...state.currentProject, ...updates }
              : null,
          }));
        },

        reset: () => set(initialState),
      }),
      {
        name: 'projects-store',
        partialize: (state) => ({
          filters: state.filters,
          // We might not want to persist currentProject if it's very large, but keeping for now as per original
          currentProject: state.currentProject,
        }),
      },
    ),
    { name: 'ProjectsStore' },
  ),
);
