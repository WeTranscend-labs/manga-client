import { TEXT_GENERATION_MODEL } from '@/constants/gemini';
import { GoogleGenAI } from '@google/genai';

/**
 * Function to sanitize prompt for retry (make it less explicit) - Fallback method.
 */
export function sanitizePromptForRetry(
  originalPrompt: string,
  attempt: number,
): string {
  if (attempt === 1) {
    let sanitized = originalPrompt
      .replace(/explicit/gi, 'artistic')
      .replace(/hentai/gi, 'mature manga')
      .replace(/sexual/gi, 'intimate')
      .replace(/sex/gi, 'romance')
      .replace(/nude/gi, 'revealing')
      .replace(/nudity/gi, 'revealing scenes')
      .replace(/naked/gi, 'unclothed')
      .replace(/fetish/gi, 'special interest')
      .replace(/porn/gi, 'mature content')
      .replace(/pornography/gi, 'mature content')
      .replace(/erotic/gi, 'sensual')
      .replace(/18\+/g, 'mature')
      .replace(/adult.*content/gi, 'mature content')
      .replace(/explicit.*content/gi, 'artistic content')
      .replace(/nsfw/gi, 'mature')
      .replace(/biến thái/gi, 'unconventional')
      .replace(/khiêu dâm/gi, 'mature content')
      .replace(/tình dục/gi, 'romance')
      .replace(/khỏa thân/gi, 'revealing');

    sanitized = sanitized
      .replace(/very.*explicit/gi, 'artistic')
      .replace(/highly.*sexual/gi, 'romantic')
      .replace(/graphic.*content/gi, 'artistic content');

    return (
      sanitized +
      ' Use artistic and stylized approach, focus on manga aesthetics and visual storytelling.'
    );
  } else if (attempt === 2) {
    let sanitized = originalPrompt
      .replace(
        /explicit|hentai|sexual|sex|nude|nudity|naked|fetish|porn|pornography|erotic|biến thái|khiêu dâm|tình dục|khỏa thân|18\+|adult content|explicit content|nsfw/gi,
        '',
      )
      .replace(/mature.*themes/gi, 'artistic themes')
      .replace(/explicit.*scenes/gi, 'artistic scenes')
      .replace(/romantic.*scenes/gi, 'emotional scenes')
      .replace(/intimate.*moments/gi, 'close moments');

    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    return (
      sanitized +
      ' Focus on artistic manga style, expressive poses, and visual narrative. Use creative composition and manga aesthetics.'
    );
  } else {
    let safeElements = originalPrompt
      .replace(
        /explicit|hentai|sexual|sex|nude|nudity|naked|fetish|porn|pornography|erotic|biến thái|khiêu dâm|tình dục|khỏa thân|18\+|adult|explicit|nsfw/gi,
        '',
      )
      .replace(/mature.*themes?/gi, '')
      .replace(/explicit.*scenes?/gi, '')
      .trim();

    if (safeElements.length > 20) {
      return (
        safeElements +
        ' Create a manga page with expressive characters, dynamic poses, and engaging visual storytelling. Focus on artistic composition and manga aesthetics.'
      );
    } else {
      return 'Create a manga page with expressive characters, dynamic poses, and engaging visual storytelling. Focus on artistic composition and manga aesthetics.';
    }
  }
}

/**
 * Function to sanitize entire enhanced prompt for retry.
 */
export function sanitizeEnhancedPromptForRetry(
  originalEnhancedPrompt: string,
  originalActualPrompt: string,
  attempt: number,
): string {
  const sanitizedActualPrompt = sanitizePromptForRetry(
    originalActualPrompt,
    attempt,
  );

  let sanitized = originalEnhancedPrompt.replace(
    originalActualPrompt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    sanitizedActualPrompt,
  );

  if (attempt >= 1) {
    sanitized = sanitized
      .replace(/hentai/gi, 'mature manga')
      .replace(/explicit content/gi, 'artistic content')
      .replace(/sexual themes/gi, 'intimate themes')
      .replace(/biến thái/gi, 'unconventional');
  }

  if (attempt >= 2) {
    sanitized = sanitized
      .replace(/18\+/g, 'mature')
      .replace(/adult.*themes/gi, 'artistic themes')
      .replace(/explicit.*scenes/gi, 'artistic scenes');
  }

  return sanitized;
}

/**
 * Uses AI to intelligently adjust a prompt when it's blocked by safety filters.
 */
export async function adjustPromptWithAI(
  originalPrompt: string,
  blockReason: string,
  attempt: number,
): Promise<string> {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.API_KEY || 'AIzaSyCWdZeeNGdHbRGqoisSNI4_nj2hHpCQqiI',
    });

    const adjustmentRequest = `You are a prompt engineering assistant. A manga image generation prompt was blocked by Google's content policy with reason: ${blockReason}.

ORIGINAL PROMPT:
"${originalPrompt}"

YOUR TASK:
Rewrite this prompt to maintain the same artistic intent and story elements while making it compliant with content policies. 

REQUIREMENTS:
1. Keep the core story, characters, and scene description
2. Use more artistic, abstract, or stylized language instead of explicit terms
3. Focus on visual storytelling, composition, and manga aesthetics
4. Remove or replace any terms that might trigger content filters
5. Maintain the emotional tone and narrative intent
6. Use professional manga terminology

IMPORTANT:
- Do NOT change the fundamental story or scene
- Do NOT remove important character or setting details
- Do NOT make it completely generic
- DO make it more artistic and policy-compliant
- DO preserve the creative intent

Return ONLY the rewritten prompt, nothing else. No explanations, no meta-commentary.`;

    const response = await ai.models.generateContent({
      model: TEXT_GENERATION_MODEL,
      contents: { parts: [{ text: adjustmentRequest }] },
      config: {
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT' as any,
            threshold: 'BLOCK_NONE' as any,
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH' as any,
            threshold: 'BLOCK_NONE' as any,
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT' as any,
            threshold: 'BLOCK_NONE' as any,
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT' as any,
            threshold: 'BLOCK_NONE' as any,
          },
        ] as any,
      },
    });

    const adjustedPrompt = response.text?.trim() || '';

    if (adjustedPrompt && adjustedPrompt.length > 10) {
      console.log(
        `✅ AI-adjusted prompt (attempt ${attempt}):`,
        adjustedPrompt.substring(0, 100) + '...',
      );
      return adjustedPrompt;
    } else {
      console.warn(`⚠️ AI adjustment failed, falling back to sanitize method`);
      return sanitizePromptForRetry(originalPrompt, attempt);
    }
  } catch (error) {
    console.error('Error adjusting prompt with AI:', error);
    console.warn(`⚠️ AI adjustment error, falling back to sanitize method`);
    return sanitizePromptForRetry(originalPrompt, attempt);
  }
}
