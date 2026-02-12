import { GeneratedManga, MangaConfig } from '@/types';

export interface GenerationProgress {
  current: number;
  total: number;
}

export type GeminiModelType = 'text' | 'image';

export interface PromptGenerationParams {
  sessionHistory: GeneratedManga[];
  context: string;
  originalPrompt: string;
  pageNumber: number;
  totalPages: number;
  config?: MangaConfig;
}

export interface ImageGenerationParams {
  prompt: string;
  config: MangaConfig;
  sessionHistory?: GeneratedManga[];
  selectedReferencePageIds?: string[];
}
