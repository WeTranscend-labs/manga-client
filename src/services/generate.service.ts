import { ApiEndpoints } from '@/constants/server';
import { ApiClient } from '@/services/api-client';
import { GeneratedManga } from '@/types';
import {
  BatchGenerateRequest,
  BatchGenerateResponse,
  DialogueBubble,
  DialogueSuggestion,
  GenerateConfig,
  GenerateRequest,
  GenerateResponse,
  GenerationHistory,
} from '@/types/generate';
import { formatUrl } from '@/utils/api-formatter';

/**
 * Service for handling all generation-related API calls.
 */
class GenerateService extends ApiClient {
  /**
   * Trigger a single image generation.
   */
  async generateSingle(request: GenerateRequest): Promise<GenerateResponse> {
    return this.post<GenerateResponse>(ApiEndpoints.GENERATE_SINGLE, request);
  }

  /**
   * Trigger a batch image generation.
   */
  async generateBatch(
    request: BatchGenerateRequest,
  ): Promise<BatchGenerateResponse> {
    return this.post<BatchGenerateResponse>(
      ApiEndpoints.GENERATE_BATCH,
      request,
    );
  }

  /**
   * Check the status of a generation job.
   */
  async getStatus(id: string): Promise<BatchGenerateResponse> {
    const url = formatUrl(ApiEndpoints.GENERATE_STATUS, { id });
    return this.get<BatchGenerateResponse>(url);
  }

  /**
   * Cancel an ongoing generation job.
   */
  async cancel(id: string): Promise<void> {
    const url = formatUrl(ApiEndpoints.GENERATE_CANCEL, { id });
    await this.delete(url);
  }

  /**
   * Fetch generation history with filters.
   */
  async getHistory(
    params: Record<string, any> = {},
  ): Promise<GenerationHistory[]> {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString
      ? `${ApiEndpoints.GENERATE_HISTORY}?${queryString}`
      : ApiEndpoints.GENERATE_HISTORY;
    return this.get<GenerationHistory[]>(url);
  }

  /**
   * Generate a clean version of a page (remove text/artifacts).
   */
  async generateClean(request: {
    prompt?: string;
    config: GenerateConfig;
    sessionHistory?: GeneratedManga[];
    totalPages?: number;
  }): Promise<{
    pages: GeneratedManga[];
    totalGenerated: number;
    isClean: boolean;
  }> {
    return this.post(ApiEndpoints.GENERATE_CLEAN, request);
  }

  /**
   * Add dialogue bubbles to an image.
   */
  async addDialogue(request: {
    imageUrl: string;
    dialogues: DialogueBubble[];
    language?: string;
    fontStyle?: 'manga' | 'comic' | 'handwritten' | 'clean';
  }): Promise<{
    imageUrl: string;
    originalImageUrl: string;
    dialogues: DialogueBubble[];
    language: string;
    fontStyle: string;
  }> {
    return this.post(ApiEndpoints.GENERATE_ADD_DIALOGUE, request);
  }

  /**
   * Suggest dialogue for an image.
   */
  async suggestDialogue(request: {
    imageUrl: string;
    context?: string;
    previousDialogues?: string[];
    numberOfSuggestions?: number;
  }): Promise<{
    suggestions: DialogueSuggestion[];
    imageUrl: string;
  }> {
    return this.post(ApiEndpoints.GENERATE_SUGGEST_DIALOGUE, request);
  }

  /**
   * Get usage statistics for the user.
   */
  async getUsage(): Promise<{
    monthlyGenerated: number;
    monthlyLimit: number;
    totalGenerated: number;
    remainingCredits: number;
    resetDate: string;
  }> {
    return this.get(ApiEndpoints.USERS_USAGE);
  }
}

export const generateService = new GenerateService();
