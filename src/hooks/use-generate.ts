import { generateService } from '@/services/generate.service';
import {
  BatchGenerateRequest,
  DialogueBubble,
  GenerateConfig,
  GenerateRequest,
  SessionHistory,
} from '@/types/generate';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query Keys
export const generateKeys = {
  all: ['generate'] as const,
  history: (params: any) => [...generateKeys.all, 'history', params] as const,
  status: (id: string) => [...generateKeys.all, 'status', id] as const,
  usage: () => [...generateKeys.all, 'usage'] as const,
};

// --- Queries ---

export function useGenerationStatus(id: string, enabled: boolean = false) {
  return useQuery({
    queryKey: generateKeys.status(id),
    queryFn: () => generateService.getStatus(id),
    enabled: !!id && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'completed' || status === 'failed') {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
    // Keep data fresh for a short time to avoid hitting the server too much if components re-mount
    staleTime: 1000,
  });
}

export function useGenerationHistory(
  params: {
    page?: number;
    limit?: number;
    type?: 'single' | 'batch';
    status?: string;
  } = {},
) {
  return useQuery({
    queryKey: generateKeys.history(params),
    queryFn: () => generateService.getHistory(params),
  });
}

export function useUsageStats() {
  return useQuery({
    queryKey: generateKeys.usage(),
    queryFn: () => generateService.getUsage(),
  });
}

// --- Mutations ---

export function useGenerateSingle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: GenerateRequest) =>
      generateService.generateSingle(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: generateKeys.history({}) });
      queryClient.invalidateQueries({ queryKey: generateKeys.usage() });
    },
  });
}

export function useGenerateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BatchGenerateRequest) =>
      generateService.generateBatch(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: generateKeys.history({}) });
      queryClient.invalidateQueries({ queryKey: generateKeys.usage() });
    },
  });
}

export function useCancelGeneration() {
  return useMutation({
    mutationFn: (id: string) => generateService.cancel(id),
  });
}

export function useGenerateClean() {
  return useMutation({
    mutationFn: (request: {
      prompt?: string;
      config: GenerateConfig;
      sessionHistory?: SessionHistory[];
      totalPages?: number;
    }) => generateService.generateClean(request),
  });
}

export function useAddDialogue() {
  return useMutation({
    mutationFn: (request: {
      imageUrl: string;
      dialogues: DialogueBubble[];
      language?: string;
      fontStyle?: 'manga' | 'comic' | 'handwritten' | 'clean';
    }) => generateService.addDialogue(request),
  });
}

export function useSuggestDialogue() {
  return useMutation({
    mutationFn: (request: {
      imageUrl: string;
      context?: string;
      previousDialogues?: string[];
      numberOfSuggestions?: number;
    }) => generateService.suggestDialogue(request),
  });
}
