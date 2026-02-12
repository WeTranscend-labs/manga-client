// Imports for local usage
import { useAuthStore } from './auth.store';
import { useGenerationStore } from './generation.store';
import { useProjectsStore } from './projects.store';
import { useUIStore } from './ui.store';

// Re-exports
export { authStore, useAuthStore } from './auth.store';
export {
  createDialogueElement,
  createImageElement,
  createPanelElement,
  createTextElement,
  useCanvasStore,
} from './canvas-store';
export { useGenerationStore } from './generation.store';
export { useProjectsStore } from './projects.store';
export { useIsLoading, useUIStore } from './ui.store';

// Store types
export type { LoadingKeys } from './ui.store';

// Combined hook for accessing multiple stores
export function useStores() {
  const auth = useAuthStore();
  const projects = useProjectsStore();
  const generation = useGenerationStore();
  const ui = useUIStore();

  return {
    auth,
    projects,
    generation,
    ui,
  };
}

// Utility hook to clear all stores (for logout/reset)
export function useClearStores() {
  const { logout: logoutAuth } = useAuthStore();
  const { reset: resetProjects } = useProjectsStore();
  const { reset: resetGeneration } = useGenerationStore();

  return () => {
    logoutAuth();
    resetProjects();
    resetGeneration();
  };
}
