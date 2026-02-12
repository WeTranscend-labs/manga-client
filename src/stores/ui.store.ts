import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type LoadingKeys =
  | 'app-init'
  | 'page-load'
  | 'auth-check'
  | 'projects-fetch'
  | 'project-save'
  | 'project-delete'
  | 'generation'
  | 'batch-generation'
  | 'image-upload'
  | 'profile-update'
  | 'settings-save';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: number;
}

// Enhanced Modal Interface
export interface Modal {
  id: string;
  component: React.ComponentType<any> | React.ReactNode | string;
  props?: any;
  disableCloseByBackdrop?: boolean;
  onClose?: () => void;
}

interface StudioUIState {
  showSettings: boolean;
  showChat: boolean;
  showMobileSidebar: boolean;
  activeMobileTab: 'sessions' | 'settings' | 'prompt';
  deleteConfirmation: {
    open: boolean;
    type: 'session' | 'page' | 'pages' | null;
    id?: string;
    ids?: string[];
  };
}

interface UIState {
  // Loading states
  loadingStates: Record<LoadingKeys, boolean>;
  globalLoading: boolean;

  // Notifications
  notifications: Notification[];

  // Modals
  modals: Modal[];

  // Theme
  theme: 'light' | 'dark' | 'system';

  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Mobile
  isMobile: boolean;

  // Page states
  pageTitle: string;
  breadcrumbs: Array<{ label: string; href?: string }>;

  // Studio Specific
  studio: StudioUIState;

  // Actions
  setLoading: (key: LoadingKeys, loading: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;

  // Notifications
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp'>,
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Modals
  openModal: (modal: Omit<Modal, 'id'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;

  // Dynamic Modal Actions (for useModal hook)
  onPresent: (
    id: string,
    component: React.ComponentType<any> | React.ReactNode,
    props?: any,
    disableCloseByBackdrop?: boolean,
  ) => void;
  onDismiss: (id: string) => void; // Alias for closeModal
  getIsModalOpen: (id: string) => boolean;

  // Theme
  setTheme: (theme: UIState['theme']) => void;
  toggleTheme: () => void;

  // Sidebar
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // Mobile
  setIsMobile: (isMobile: boolean) => void;

  // Page
  setPageTitle: (title: string) => void;
  setBreadcrumbs: (breadcrumbs: UIState['breadcrumbs']) => void;

  // Studio Actions
  setStudioState: (state: Partial<StudioUIState>) => void;
  setDeleteConfirmation: (
    state: Partial<StudioUIState['deleteConfirmation']>,
  ) => void;

  // Utility
  showSuccessNotification: (title: string, message?: string) => void;
  showErrorNotification: (title: string, message?: string) => void;
  showWarningNotification: (title: string, message?: string) => void;
  showInfoNotification: (title: string, message?: string) => void;
}

const initialState = {
  loadingStates: {} as Record<LoadingKeys, boolean>,
  globalLoading: false,
  notifications: [],
  modals: [],
  theme: 'system' as const,
  sidebarOpen: true,
  sidebarCollapsed: false,
  isMobile: false,
  pageTitle: '',
  breadcrumbs: [],
  studio: {
    showSettings: false,
    showChat: false,
    showMobileSidebar: false,
    activeMobileTab: 'sessions' as const,
    deleteConfirmation: {
      open: false,
      type: null,
    },
  },
};

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Loading management
        setLoading: (key, loading) =>
          set((state) => ({
            loadingStates: { ...state.loadingStates, [key]: loading },
          })),

        setGlobalLoading: (globalLoading) => set({ globalLoading }),

        // Notifications
        addNotification: (notification) => {
          const id = `notification-${Date.now()}-${Math.random()}`;
          const newNotification: Notification = {
            ...notification,
            id,
            timestamp: Date.now(),
            duration: notification.duration ?? 5000,
          };

          set((state) => ({
            notifications: [...state.notifications, newNotification],
          }));

          // Auto remove after duration
          if (newNotification.duration && newNotification.duration > 0) {
            setTimeout(() => {
              get().removeNotification(id);
            }, newNotification.duration);
          }
        },

        removeNotification: (id) =>
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          })),

        clearNotifications: () => set({ notifications: [] }),

        // Modals
        openModal: (modal) => {
          const id = `modal-${Date.now()}-${Math.random()}`;
          const newModal: Modal = { ...modal, id };

          set((state) => ({
            modals: [...state.modals, newModal],
          }));

          return id;
        },

        closeModal: (id) =>
          set((state) => {
            const modal = state.modals.find((m) => m.id === id);
            if (modal?.onClose) {
              modal.onClose();
            }
            return {
              modals: state.modals.filter((m) => m.id !== id),
            };
          }),

        closeAllModals: () => {
          const { modals } = get();
          modals.forEach((modal) => {
            if (modal.onClose) {
              modal.onClose();
            }
          });
          set({ modals: [] });
        },

        // Dynamic Modal Implementations
        onPresent: (
          id,
          component,
          props = {},
          disableCloseByBackdrop = false,
        ) => {
          set((state) => {
            if (state.modals.find((m) => m.id === id)) {
              return state;
            }
            return {
              modals: [
                ...state.modals,
                { id, component, props, disableCloseByBackdrop },
              ],
            };
          });
        },

        onDismiss: (id) => get().closeModal(id),

        getIsModalOpen: (id) => !!get().modals.find((m) => m.id === id),

        // Theme
        setTheme: (theme) => {
          set({ theme });

          // Apply theme to document
          if (typeof window !== 'undefined') {
            const root = document.documentElement;

            if (theme === 'system') {
              const prefersDark = window.matchMedia(
                '(prefers-color-scheme: dark)',
              ).matches;
              root.classList.toggle('dark', prefersDark);
            } else {
              root.classList.toggle('dark', theme === 'dark');
            }
          }
        },

        toggleTheme: () => {
          const { theme } = get();
          const newTheme = theme === 'light' ? 'dark' : 'light';
          get().setTheme(newTheme);
        },

        // Sidebar
        setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
        setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
        toggleSidebar: () =>
          set((state) => ({ sidebarOpen: !state.sidebarOpen })),

        // Mobile
        setIsMobile: (isMobile) => set({ isMobile }),

        // Page
        setPageTitle: (pageTitle) => {
          set({ pageTitle });
          if (typeof window !== 'undefined') {
            document.title = pageTitle
              ? `${pageTitle} - Manga Generator`
              : 'Manga Generator';
          }
        },

        setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),

        // Studio
        setStudioState: (newState) =>
          set((state) => ({
            studio: { ...state.studio, ...newState },
          })),

        setDeleteConfirmation: (confirmation) =>
          set((state) => ({
            studio: {
              ...state.studio,
              deleteConfirmation: {
                ...state.studio.deleteConfirmation,
                ...confirmation,
              },
            },
          })),

        // Utility notification helpers
        showSuccessNotification: (title, message = '') =>
          get().addNotification({ type: 'success', title, message }),

        showErrorNotification: (title, message = '') =>
          get().addNotification({
            type: 'error',
            title,
            message,
            duration: 8000,
          }),

        showWarningNotification: (title, message = '') =>
          get().addNotification({ type: 'warning', title, message }),

        showInfoNotification: (title, message = '') =>
          get().addNotification({ type: 'info', title, message }),
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
          // Don't persist studio state, start fresh or use specific persistence if needed
        }),
      },
    ),
    { name: 'UIStore' },
  ),
);

// Hook to check if any loading is active
export const useIsLoading = (keys?: LoadingKeys[]): boolean => {
  return useUIStore((state) => {
    if (!keys) {
      return (
        state.globalLoading || Object.values(state.loadingStates).some(Boolean)
      );
    }
    return keys.some((key) => state.loadingStates[key]);
  });
};
