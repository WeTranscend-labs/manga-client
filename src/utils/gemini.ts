import { storageService } from '@/services/storage.service';

/**
 * Checks if the error message indicates a model overload.
 */
export function isOverloadedError(error: any): boolean {
  if (!error) return false;
  const msg = (error.message || error.toString?.() || '').toString();
  return (
    error.code === 503 ||
    error.status === 'UNAVAILABLE' ||
    msg.includes('The model is overloaded') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('503')
  );
}

/**
 * Utility for delaying execution.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Resolve a list of image URLs/IDs to base64 data URLs using the backend storage service.
 */
export async function resolveImagesToBase64(
  sources: (string | undefined | null)[],
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  const valid = (sources || []).filter(
    (s): s is string => !!s && typeof s === 'string',
  );

  if (valid.length === 0) return result;

  const nonBase64: string[] = [];
  for (const src of valid) {
    if (src.startsWith('data:image/')) {
      result[src] = src;
    } else {
      nonBase64.push(src);
    }
  }

  if (nonBase64.length > 0) {
    try {
      const images = await storageService.loadProjectImages(nonBase64);
      for (const key of Object.keys(images)) {
        const value = images[key];
        if (typeof value === 'string' && value.length > 0) {
          result[key] = value;
        }
      }
    } catch (err) {
      console.error(
        'Failed to load project images for Gemini references:',
        err,
      );
    }
  }

  return result;
}

/**
 * Helper function to calculate prompt similarity using simple word overlap.
 */
export function calculatePromptSimilarity(
  prompt1: string,
  prompt2: string,
): number {
  const words1 = new Set(prompt1.split(/\s+/).filter((w) => w.length > 3));
  const words2 = new Set(prompt2.split(/\s+/).filter((w) => w.length > 3));

  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}
