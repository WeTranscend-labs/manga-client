export interface GenerateConfig {
  style: 'anime' | 'realistic' | 'cartoon' | 'manga' | 'webcomic';
  genre: string;
  colorScheme: 'color' | 'blackwhite' | 'sepia';
  resolution: 'low' | 'medium' | 'high' | 'ultra';
  aspectRatio: '16:9' | '4:3' | '1:1' | 'custom';
  quality?: number;
  seed?: number;
  model?: string;
}

export interface SessionHistory {
  id: string;
  imageUrl: string;
  prompt: string;
  pageNumber?: number;
}

export interface GenerateRequest {
  prompt: string;
  config: GenerateConfig;
  sessionHistory?: SessionHistory[];
  isAutoContinue?: boolean;
  projectId?: string;
}

export interface GenerateResponse {
  id: string;
  page: {
    id: string;
    pageNumber: number;
    panels: Array<{
      id: string;
      position: number;
      prompt: string;
      imageUrl: string;
      thumbnailUrl?: string;
    }>;
  };
  prompt: string;
  imageUrl: string;
  processingTime?: number;
  metadata?: {
    model: string;
    cost?: number;
    parameters: GenerateConfig;
  };
}

export interface BatchGenerateRequest {
  prompts: string[];
  config: GenerateConfig;
  projectId?: string;
  batchSize?: number;
}

export interface BatchGenerateResponse {
  batchId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results: GenerateResponse[];
  progress: {
    completed: number;
    total: number;
    failed: number;
  };
}

export interface GenerationHistory {
  id: string;
  type: 'single' | 'batch';
  prompt: string;
  parameters: GenerateConfig;
  imageUrls: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  metadata: {
    provider: string;
    processingTime?: number;
    cost?: number;
  };
}

// Dialogue bubble interface for adding to panels
export interface DialogueBubble {
  id?: string;
  /** X position as percentage (0-100) from left */
  x: number;
  /** Y position as percentage (0-100) from top */
  y: number;
  /** Dialogue text content */
  text: string;
  /** Bubble style */
  style?: 'speech' | 'thought' | 'shout' | 'whisper' | 'narrator';
  /** Tail direction pointing to speaker */
  tailDirection?: 'left' | 'right' | 'top' | 'bottom' | 'none';
  /** Font size (optional) */
  fontSize?: number;
  /** Character name (optional) */
  characterName?: string;
}

// AI-suggested dialogue
export interface DialogueSuggestion {
  text: string;
  characterName?: string;
  style: 'speech' | 'thought' | 'shout' | 'whisper' | 'narrator';
  suggestedX: number;
  suggestedY: number;
  reasoning: string;
}
