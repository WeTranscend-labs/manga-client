import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface DeleteConfirmationState {
  open: boolean;
  type: 'session' | 'page' | 'pages' | null;
  id?: string;
  ids?: string[];
}

interface StudioUIState {
  // Layout
  showSettings: boolean;
  showChat: boolean;
  showMobileSidebar: boolean;
  showMobileSettings: boolean; // Added this one too
  showTabletSidebar: boolean;
  activeMobileTab: 'sessions' | 'settings' | 'prompt' | 'chat';
  prompt: string;
  currentImage: string | null;
  generationProgress: number;
  generationLoading: boolean;

  // Dialogs
  deleteConfirmation: DeleteConfirmationState;
  fullscreenPreview: {
    open: boolean;
    image: string | null;
    isFromCanvas: boolean;
  };

  // Actions
  setStudioState: (state: Partial<Omit<StudioUIState, 'actions'>>) => void;
  setDeleteConfirmation: (state: Partial<DeleteConfirmationState>) => void;
  toggleSettings: () => void;
  toggleChat: () => void;
  toggleMobileSidebar: () => void;
  reset: () => void;
}

const initialState = {
  showSettings: false,
  showChat: false,
  showMobileSidebar: false,
  showMobileSettings: false,
  showTabletSidebar: false,
  activeMobileTab: 'sessions' as const,
  prompt: '',
  currentImage: null,
  generationProgress: 0,
  generationLoading: false,
  deleteConfirmation: {
    open: false,
    type: null,
  },
  fullscreenPreview: {
    open: false,
    image: null,
    isFromCanvas: false,
  },
};

export const useStudioUIStore = create<StudioUIState>()(
  devtools(
    (set) => ({
      ...initialState,

      setStudioState: (newState) => set((state) => ({ ...state, ...newState })),

      setDeleteConfirmation: (newState) =>
        set((state) => ({
          deleteConfirmation: { ...state.deleteConfirmation, ...newState },
        })),

      toggleSettings: () =>
        set((state) => ({ showSettings: !state.showSettings })),

      toggleChat: () => set((state) => ({ showChat: !state.showChat })),

      toggleMobileSidebar: () =>
        set((state) => ({ showMobileSidebar: !state.showMobileSidebar })),

      toggleTabletSidebar: () =>
        set((state) => ({ showTabletSidebar: !state.showTabletSidebar })),

      reset: () => set(initialState),
    }),
    { name: 'StudioUIStore' },
  ),
);
