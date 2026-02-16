import { GenerationHistory } from '@/types/generate';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface GenerationState {
  // State
  // We keep currentGeneration here if it's used globally (e.g. by other components viewing the result)
  // or we can remove it if it's only local to the panel.
  currentGeneration: GenerationHistory | null;

  // Actions
  setCurrentGeneration: (generation: GenerationHistory | null) => void;
  reset: () => void;
}

const initialState = {
  currentGeneration: null,
};

export const useGenerationStore = create<GenerationState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setCurrentGeneration: (generation) =>
          set({ currentGeneration: generation }),
        reset: () => set(initialState),
      }),
      {
        name: 'generation-store',
        partialize: (state) => ({
          currentGeneration: state.currentGeneration,
        }),
      },
    ),
    { name: 'GenerationStore' },
  ),
);
