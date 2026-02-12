import { storageService } from '@/services/storage.service';
import {
  GeneratedManga,
  MangaConfig,
  MangaProject,
  MangaSession,
} from '@/types';
import { normalizeSession, safeArray } from '@/utils/react-utils';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface ProjectsState {
  // State
  currentProject: MangaProject | null; // Working copy for editing
  currentSession: MangaSession | null;
  isLoading: boolean;
  error: string | null;

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
  setCurrentProject: (project: MangaProject | null) => void;
  setCurrentSession: (
    session:
      | MangaSession
      | null
      | ((prev: MangaSession | null) => MangaSession | null),
  ) => void;
  setPagination: (pagination: Partial<ProjectsState['pagination']>) => void;
  setFilters: (filters: Partial<ProjectsState['filters']>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Project management actions
  loadProject: (id: string) => Promise<void>;
  updateCurrentProject: (updates: Partial<MangaProject>) => void;

  // Session management actions
  createSession: (
    name: string,
    context?: string,
    config?: MangaConfig,
  ) => Promise<void>;
  switchSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => Promise<void>;
  updateSessionContext: (context: string) => void;
  updateSessionConfig: (config: MangaConfig) => void;

  // Page management actions
  addPage: (page: GeneratedManga) => Promise<void>;
  deletePage: (pageId: string) => Promise<void>;
  deletePages: (pageIds: string[]) => Promise<void>;
  movePage: (pageId: string, direction: 'up' | 'down') => void;
  toggleMarkForExport: (pageId: string) => void;
  toggleReferencePage: (pageId: string) => void;

  // Utility
  reset: () => void;
}

const initialState = {
  currentProject: null,
  currentSession: null,
  isLoading: false,
  error: null,
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
      (set, get) => ({
        ...initialState,

        // Sync actions
        setCurrentProject: (project) => set({ currentProject: project }),
        setCurrentSession: (sessionOrFn) =>
          set((state) => ({
            currentSession:
              typeof sessionOrFn === 'function'
                ? sessionOrFn(state.currentSession)
                : sessionOrFn,
          })),
        setPagination: (pagination) =>
          set((state) => ({
            pagination: { ...state.pagination, ...pagination },
          })),
        setFilters: (filters) =>
          set((state) => ({
            filters: { ...state.filters, ...filters },
          })),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),

        // PROPER ASYNC ACTIONS (Replacing useStudioState logic)

        loadProject: async (id: string) => {
          set({ isLoading: true, error: null });
          try {
            const saved = await storageService.loadProject(id);
            if (saved) {
              const normalizedProject = {
                ...saved,
                sessions: Array.isArray(saved.sessions) ? saved.sessions : [],
                pages: Array.isArray(saved.pages) ? saved.pages : [],
              };
              set({ currentProject: normalizedProject });

              if (normalizedProject.currentSessionId) {
                const session = normalizedProject.sessions.find(
                  (s) => s.id === normalizedProject.currentSessionId,
                );
                if (session) {
                  const normalizedSession = normalizeSession(session);
                  set({ currentSession: normalizedSession });
                }
              }
            }
          } catch (err: any) {
            console.error('Failed to load project', err);
            set({ error: err.message || 'Failed to load project' });
          } finally {
            set({ isLoading: false });
          }
        },

        updateCurrentProject: (updates) => {
          set((state) => ({
            currentProject: state.currentProject
              ? { ...state.currentProject, ...updates }
              : null,
          }));
        },

        createSession: async (name, context = '', config) => {
          const { currentProject } = get();
          // Generate ID locally for now, or use utility
          const id = crypto.randomUUID();

          const newSession: MangaSession = {
            id,
            name,
            context,
            pages: [],
            chatHistory: [],
            config: config,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          set((state) => ({
            currentSession: newSession,
            currentProject: state.currentProject
              ? {
                  ...state.currentProject,
                  sessions: [
                    ...(state.currentProject.sessions || []),
                    newSession,
                  ],
                  currentSessionId: id,
                }
              : null,
          }));

          if (currentProject?.id) {
            try {
              await storageService.saveSession(currentProject.id, newSession);
            } catch (err) {
              console.error('Failed to save new session', err);
            }
          }
        },

        switchSession: (sessionId) => {
          const { currentProject } = get();
          if (!currentProject) return;

          const session = safeArray(currentProject.sessions).find(
            (s) => s.id === sessionId,
          );
          if (session) {
            const normalizedSession = normalizeSession(session);
            set((state) => ({
              currentSession: normalizedSession,
              currentProject: state.currentProject
                ? {
                    ...state.currentProject,
                    currentSessionId: sessionId,
                  }
                : null,
            }));
          }
        },

        deleteSession: async (sessionId) => {
          const { currentProject } = get();
          if (!currentProject?.id) return;

          try {
            await storageService.deleteSession(currentProject.id, sessionId);

            set((state) => {
              const updatedSessions = safeArray(
                state.currentProject?.sessions,
              ).filter((s) => s.id !== sessionId);
              const isDeletingCurrent = state.currentSession?.id === sessionId;

              return {
                currentProject: state.currentProject
                  ? {
                      ...state.currentProject,
                      sessions: updatedSessions,
                      currentSessionId: isDeletingCurrent
                        ? undefined
                        : state.currentProject.currentSessionId,
                    }
                  : null,
                currentSession: isDeletingCurrent ? null : state.currentSession,
              };
            });
          } catch (err) {
            console.error('Failed to delete session', err);
            throw err;
          }
        },

        updateSessionContext: (context) => {
          const { currentSession, currentProject } = get();
          if (currentSession) {
            const updatedSession = {
              ...currentSession,
              context,
              updatedAt: Date.now(),
            };
            set((state) => ({
              currentSession: updatedSession,
              currentProject: state.currentProject
                ? {
                    ...state.currentProject,
                    sessions: safeArray(state.currentProject.sessions).map(
                      (s) => (s.id === currentSession.id ? updatedSession : s),
                    ),
                  }
                : null,
            }));

            // Debounced save could happen here or in a subscriber,
            // but for now keeping it simple or relying on explicit save if needed.
            // Replicating useStudioState debounce logic might be better in the component invoking this,
            // or using a debounced version of this action.
            if (currentProject?.id) {
              storageService
                .saveSession(currentProject.id, updatedSession)
                .catch(console.error);
            }
          }
        },

        updateSessionConfig: (config) => {
          const { currentSession, currentProject } = get();
          if (currentSession) {
            const updatedSession = {
              ...currentSession,
              config: { ...config },
              updatedAt: Date.now(),
            };
            set((state) => ({
              currentSession: updatedSession,
              currentProject: state.currentProject
                ? {
                    ...state.currentProject,
                    sessions: safeArray(state.currentProject.sessions).map(
                      (s) => (s.id === currentSession.id ? updatedSession : s),
                    ),
                  }
                : null,
            }));
            if (currentProject?.id) {
              storageService
                .saveSession(currentProject.id, updatedSession)
                .catch(console.error);
            }
          }
        },

        addPage: async (page) => {
          const { currentSession, currentProject } = get();

          if (currentSession) {
            const updatedSession = {
              ...currentSession,
              pages: [...currentSession.pages, page],
              updatedAt: Date.now(),
            };

            set((state) => ({
              currentSession: updatedSession,
              currentProject: state.currentProject
                ? {
                    ...state.currentProject,
                    sessions: safeArray(state.currentProject.sessions).map(
                      (s) => (s.id === currentSession.id ? updatedSession : s),
                    ),
                  }
                : null,
            }));

            if (currentProject?.id) {
              await storageService.saveSession(
                currentProject.id,
                updatedSession,
              );
            }
          } else if (currentProject) {
            // Add to project-level pages
            const updatedProject = {
              ...currentProject,
              pages: [...currentProject.pages, page],
            };
            set({ currentProject: updatedProject });
            await storageService.saveProject(updatedProject);
          }
        },

        deletePage: async (pageId) => {
          // Implementation similar to useStudioActions logic
          const { currentSession, currentProject } = get();
          // Logic to delete image from storage would go here (or in service)
          // For now assume service handles it or we call it

          // Simplification for brevity in this step
          if (currentSession) {
            const updatedSession = {
              ...currentSession,
              pages: currentSession.pages.filter((p) => p.id !== pageId),
              updatedAt: Date.now(),
            };
            set((state) => ({
              currentSession: updatedSession,
              currentProject: state.currentProject
                ? {
                    ...state.currentProject,
                    sessions: safeArray(state.currentProject.sessions).map(
                      (s) => (s.id === currentSession.id ? updatedSession : s),
                    ),
                  }
                : null,
            }));
            if (currentProject?.id)
              await storageService.saveSession(
                currentProject.id,
                updatedSession,
              );
          }
        },

        deletePages: async (pageIds) => {
          const { currentSession, currentProject } = get();
          if (currentSession) {
            const updatedSession = {
              ...currentSession,
              pages: currentSession.pages.filter(
                (p) => !pageIds.includes(p.id),
              ),
              updatedAt: Date.now(),
            };
            set((state) => ({
              currentSession: updatedSession,
              currentProject: state.currentProject
                ? {
                    ...state.currentProject,
                    sessions: safeArray(state.currentProject.sessions).map(
                      (s) => (s.id === currentSession.id ? updatedSession : s),
                    ),
                  }
                : null,
            }));
            if (currentProject?.id)
              await storageService.saveSession(
                currentProject.id,
                updatedSession,
              );
          }
        },

        movePage: (pageId, direction) => {
          const { currentSession, currentProject } = get();
          if (currentSession) {
            const pages = [...currentSession.pages];
            const index = pages.findIndex((p) => p.id === pageId);
            if (index === -1) return;

            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= pages.length) return;

            [pages[index], pages[newIndex]] = [pages[newIndex], pages[index]];

            const updatedSession = {
              ...currentSession,
              pages,
              updatedAt: Date.now(),
            };
            set((state) => ({
              currentSession: updatedSession,
              currentProject: state.currentProject
                ? {
                    ...state.currentProject,
                    sessions: safeArray(state.currentProject.sessions).map(
                      (s) => (s.id === currentSession.id ? updatedSession : s),
                    ),
                  }
                : null,
            }));
          }
        },

        toggleMarkForExport: (pageId) => {
          const { currentSession, currentProject } = get();
          if (currentSession) {
            const updatedPages = currentSession.pages.map((p) =>
              p.id === pageId
                ? { ...p, markedForExport: !p.markedForExport }
                : p,
            );
            const updatedSession = {
              ...currentSession,
              pages: updatedPages,
              updatedAt: Date.now(),
            };

            set((state) => ({
              currentSession: updatedSession,
              currentProject: state.currentProject
                ? {
                    ...state.currentProject,
                    sessions: safeArray(state.currentProject.sessions).map(
                      (s) => (s.id === currentSession.id ? updatedSession : s),
                    ),
                  }
                : null,
            }));
          }
        },

        toggleReferencePage: (pageId) => {
          const { currentSession, currentProject } = get();
          if (currentSession) {
            const currentReferenceIds =
              currentSession.selectedReferencePageIds || [];
            const isCurrentlyReference = currentReferenceIds.includes(pageId);

            const updatedReferenceIds = isCurrentlyReference
              ? currentReferenceIds.filter((id) => id !== pageId)
              : [...currentReferenceIds, pageId];

            const updatedSession = {
              ...currentSession,
              selectedReferencePageIds: updatedReferenceIds,
              updatedAt: Date.now(),
            };

            set((state) => ({
              currentSession: updatedSession,
              currentProject: state.currentProject
                ? {
                    ...state.currentProject,
                    sessions: safeArray(state.currentProject.sessions).map(
                      (s) => (s.id === currentSession.id ? updatedSession : s),
                    ),
                  }
                : null,
            }));

            if (currentProject?.id) {
              storageService
                .saveSession(currentProject.id, updatedSession)
                .catch(console.error);
            }
          }
        },

        reset: () => set(initialState),
      }),
      {
        name: 'projects-store',
        partialize: (state) => ({
          filters: state.filters,
          currentProject: state.currentProject,
          currentSession: state.currentSession,
        }),
      },
    ),
    { name: 'ProjectsStore' },
  ),
);
