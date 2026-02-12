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
  activeMobileTab: 'sessions' | 'settings' | 'prompt';
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

  // Layout Dimensions (Transient UI state)
  leftWidth: number;
  middleWidth: number;

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
  leftWidth: 320,
  middleWidth: 640,
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

      reset: () => set(initialState),
    }),
    { name: 'StudioUIStore' },
  ),
);
