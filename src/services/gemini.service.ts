import { LAYOUT_PROMPTS, MANGA_SYSTEM_INSTRUCTION } from '@/constants';
import {
  IMAGE_GENERATION_MODEL,
  INKING_GUIDES,
  STYLE_GUIDES,
  TEXT_GENERATION_MODEL,
} from '@/constants/gemini';
import { GeneratedManga, MangaConfig } from '@/types';
import {
  calculatePromptSimilarity,
  delay,
  isOverloadedError,
  resolveImagesToBase64,
} from '@/utils/gemini';
import {
  adjustPromptWithAI,
  sanitizeEnhancedPromptForRetry,
} from '@/utils/gemini-prompt';
import {
  cleanUserPrompt,
  extractUserIntent,
  isUserProvidedPrompt,
} from '@/utils/prompt-utils';
import { GoogleGenAI } from '@google/genai';

/**
 * Service for handling Gemini-based manga generation (Story and Images).
 */
export class GeminiService {
  private genAI: GoogleGenAI;

  constructor() {
    this.genAI = new GoogleGenAI({
      apiKey: process.env.API_KEY || 'AIzaSyCWdZeeNGdHbRGqoisSNI4_nj2hHpCQqiI',
    });
  }

  /**
   * Generate next prompt based on previous pages.
   */
  async generateNextPrompt(
    sessionHistory: GeneratedManga[],
    context: string,
    originalPrompt: string,
    pageNumber: number,
    totalPages: number,
    config?: MangaConfig,
  ): Promise<string> {
    let previousPagesInfo = '';
    const recentPages = sessionHistory.slice(-10);
    const lastPage = sessionHistory[sessionHistory.length - 1];

    const allPreviousPrompts = sessionHistory
      .map((p) => p.prompt)
      .filter((p) => p && p.trim());

    if (recentPages.length > 0) {
      previousPagesInfo += `\n⚠️ CRITICAL - MOST RECENT PAGE (Page ${sessionHistory.length}):\n`;
      previousPagesInfo += `"${lastPage.prompt}"\n`;
      previousPagesInfo += `\nThis is the page you MUST continue from. Your new page (Page ${pageNumber}) should continue IMMEDIATELY after what happened in Page ${sessionHistory.length}.\n`;

      if (recentPages.length > 1) {
        previousPagesInfo += `\n📚 ADDITIONAL CONTEXT - Recent pages for story flow:\n`;
        recentPages.slice(0, -1).forEach((page, idx) => {
          const pageNum = sessionHistory.length - recentPages.length + idx + 1;
          previousPagesInfo += `\nPage ${pageNum}: ${page.prompt}\n`;
        });
      }
    }

    let promptUniquenessNote = '';
    if (allPreviousPrompts.length > 0) {
      promptUniquenessNote = `\n🚫 CRITICAL - PROMPT UNIQUENESS REQUIREMENT:
⚠️⚠️⚠️ YOUR NEW PROMPT MUST BE COMPLETELY DIFFERENT FROM ALL PREVIOUS PROMPTS IN THIS SESSION ⚠️⚠️⚠️

PREVIOUS PROMPTS USED IN THIS SESSION (DO NOT REPEAT OR SIMILAR):
${allPreviousPrompts.map((p, idx) => `${idx + 1}. "${p}"`).join('\n')}

REQUIREMENTS:
✓ Your new prompt must describe a DIFFERENT scene, action, or moment
✓ DO NOT reuse similar wording, phrases, or descriptions from previous prompts
✓ DO NOT describe the same type of action or event
✓ DO NOT use similar character actions or situations
✓ Create a UNIQUE prompt that advances the story in a NEW direction
✓ If previous prompts mentioned "fight", "run", "talk" - use DIFFERENT actions
✓ If previous prompts had similar settings - use a DIFFERENT location or context
✓ Be creative and ensure your prompt is DISTINCT from all previous ones\n`;
    }

    const layout =
      config?.layout ||
      (sessionHistory.length > 0
        ? sessionHistory[sessionHistory.length - 1].config?.layout
        : undefined);
    const layoutInfo = layout ? LAYOUT_PROMPTS[layout] || layout : '';

    let panelCountRequirement = '';
    if (layout) {
      if (layout === 'Single Panel') {
        panelCountRequirement =
          'EXACTLY ONE PANEL ONLY - NO MULTIPLE PANELS - FORCE SINGLE PANEL';
      } else if (
        layout === 'Dramatic Spread' ||
        layout === 'Widescreen Cinematic'
      ) {
        panelCountRequirement = 'SINGLE PANEL or minimal panels';
      } else if (
        layout === 'Dynamic Freestyle' ||
        layout === 'Asymmetric Mixed'
      ) {
        panelCountRequirement = '5-8 PANELS with varied sizes';
      } else if (layout.includes('Action Sequence')) {
        panelCountRequirement = '5-7 ACTION PANELS';
      } else if (layout.includes('Conversation')) {
        panelCountRequirement = '4-6 HORIZONTAL PANELS';
      } else if (layout === 'Z-Pattern Flow') {
        panelCountRequirement = '5-6 PANELS in Z-pattern';
      } else if (layout === 'Vertical Strip') {
        panelCountRequirement = '3-5 WIDE HORIZONTAL PANELS';
      } else if (layout === 'Climax Focus') {
        panelCountRequirement = 'ONE DOMINANT PANEL + 4-5 SMALLER PANELS';
      } else if (layout.includes('Double')) {
        panelCountRequirement = 'TWO PANELS';
      } else if (layout.includes('Triple')) {
        panelCountRequirement = 'THREE PANELS';
      } else {
        panelCountRequirement = 'FOUR PANELS';
      }
    }

    const storyDirectionNote =
      config?.storyDirection && config.storyDirection.trim()
        ? `\n📖 STORY FLOW DIRECTION (Follow this overall direction):\n${config.storyDirection.trim()}\n`
        : '';

    const promptGenerationRequest = `You are a professional manga story writer. Your task is to generate the NEXT scene prompt for a manga page.

CONTEXT:
${context}

ORIGINAL STORY DIRECTION (for reference):
${originalPrompt}
${storyDirectionNote}
${previousPagesInfo ? `PREVIOUS PAGES:\n${previousPagesInfo}` : ''}
${promptUniquenessNote}

${layout ? `📐 LAYOUT CONTEXT:\nThe previous pages used "${layout}" layout with ${panelCountRequirement}.\n${layout === 'Single Panel' ? '⚠️ CRITICAL: This page MUST use SINGLE PANEL layout - EXACTLY ONE PANEL ONLY - NO MULTIPLE PANELS' : 'You can suggest a scene that works with various layouts.'}\n${layoutInfo ? `Previous layout details: ${layoutInfo}` : ''}\n` : ''}
CURRENT STATUS:
- You are creating the prompt for PAGE ${pageNumber} of ${totalPages}
- ${sessionHistory.length > 0 ? `This page MUST continue DIRECTLY from Page ${sessionHistory.length}` : 'This is the first page of the story'}

YOUR TASK:
${sessionHistory.length > 0 ? `⚠️ CRITICAL: Analyze what happened in Page ${sessionHistory.length} and write a prompt for what happens NEXT.` : 'Write a prompt for the opening scene.'}

The prompt should be 2-3 sentences and advance the story chronologically. Write ONLY the prompt text.`;

    try {
      const contentParts: any[] = [{ text: promptGenerationRequest }];
      if (sessionHistory && sessionHistory.length > 0) {
        const recentPageImages = sessionHistory.slice(-1);
        const sources = recentPageImages.map((p) => p.url);
        const imageMap = await resolveImagesToBase64(sources);

        for (const page of recentPageImages) {
          if (!page.url) continue;
          const raw = imageMap[page.url];
          if (!raw) continue;
          const base64Data = raw.includes('base64,')
            ? raw.split('base64,')[1]
            : raw;
          let mimeType = 'image/jpeg';
          if (raw.includes('data:image/')) {
            const mimeMatch = raw.match(/data:(image\/[^;]+)/);
            if (mimeMatch) mimeType = mimeMatch[1];
          }
          contentParts.push({ inlineData: { data: base64Data, mimeType } });
        }
      }

      let response: any;
      let attempts = 0;
      while (true) {
        try {
          response = await this.genAI.models.generateContent({
            model: TEXT_GENERATION_MODEL,
            contents: { parts: contentParts },
            config: {
              safetySettings: [
                {
                  category: 'HARM_CATEGORY_HARASSMENT',
                  threshold: 'BLOCK_NONE',
                },
                {
                  category: 'HARM_CATEGORY_HATE_SPEECH',
                  threshold: 'BLOCK_NONE',
                },
                {
                  category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                  threshold: 'BLOCK_NONE',
                },
                {
                  category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                  threshold: 'BLOCK_NONE',
                },
              ] as any,
            },
          });
          break;
        } catch (err: any) {
          attempts++;
          if (!isOverloadedError(err) || attempts >= 3) throw err;
          await delay(500 * Math.pow(2, attempts - 1));
        }
      }

      let generatedPrompt = response.text?.trim() || '';
      if (allPreviousPrompts.length > 0 && generatedPrompt) {
        let retryCount = 0;
        while (retryCount < 3) {
          const isTooSimilar = allPreviousPrompts.some(
            (prev) =>
              calculatePromptSimilarity(
                generatedPrompt.toLowerCase(),
                prev.toLowerCase(),
              ) > 0.7,
          );
          if (!isTooSimilar) break;
          retryCount++;
          const retryRequest =
            promptGenerationRequest +
            `\n\n⚠️ RETRY - PREVIOUS TOO SIMILAR. GENERATE SOMETHING UNIQUE.`;
          try {
            const retryResponse = await this.genAI.models.generateContent({
              model: TEXT_GENERATION_MODEL,
              contents: {
                parts: contentParts.map((p, i) =>
                  i === 0 ? { text: retryRequest } : p,
                ),
              },
            });
            generatedPrompt = retryResponse.text?.trim() || generatedPrompt;
          } catch {
            break;
          }
        }
      }
      return generatedPrompt;
    } catch (error) {
      console.error('Error generating next prompt:', error);
      return `Continue the story naturally from page ${pageNumber - 1}.`;
    }
  }

  /**
   * Generate manga page image using Gemini model.
   */
  async generateMangaImage(
    prompt: string,
    config: MangaConfig,
    sessionHistory?: GeneratedManga[],
    selectedReferencePageIds?: string[],
  ): Promise<string> {
    const cleanedPrompt = cleanUserPrompt(prompt);
    const userIntent = extractUserIntent(prompt);
    const hasPreviousPages = sessionHistory && sessionHistory.length > 0;
    const hasUserPrompt = isUserProvidedPrompt(cleanedPrompt);
    const isBatchContinuation = cleanedPrompt.includes(
      'Continue the story naturally from page',
    );

    let actualPrompt = prompt;
    let contextSection = '';

    if (config.context?.trim()) {
      contextSection = `\nWORLD SETTING & CHARACTER PROFILES:\n${config.context.trim()}\nMaintain perfect visual consistency.\n`;
    }

    if (hasPreviousPages) {
      if (hasUserPrompt && !isBatchContinuation) {
        actualPrompt = userIntent || cleanedPrompt;
      } else if (
        isBatchContinuation ||
        (!hasUserPrompt && config.autoContinueStory)
      ) {
        const lastPageNum = sessionHistory!.length;
        actualPrompt = `Continue from Page ${lastPageNum} to Page ${lastPageNum + 1}.\n${config.storyDirection ? `Direction: ${config.storyDirection}` : ''}`;
      }
    }

    let continuityInstructions = hasPreviousPages
      ? `Continue from Page ${sessionHistory!.length}.\nVary composition/angle/pose.`
      : '';
    let dialogueInstructions =
      config.dialogueDensity !== 'No Dialogue'
        ? `DIALOGUE: ${config.dialogueDensity}\nLanguage: ${config.language.toUpperCase()}`
        : 'SILENT PAGE';

    const layoutDesc = LAYOUT_PROMPTS[config.layout] || config.layout;
    const styleDesc = STYLE_GUIDES[config.style] || config.style;
    const inkingDesc = INKING_GUIDES[config.inking] || config.inking;
    const colorMode = config.useColor ? 'FULL COLOR' : 'B&W with Screentones';

    const enhancedPrompt = `MANGA PAGE GENERATION\n\nSTYLE: ${styleDesc}\nINKING: ${inkingDesc}\nCOLOR: ${colorMode}\nFORMAT: ${layoutDesc}\n${dialogueInstructions}\n${contextSection}${continuityInstructions}\nPROMPT: ${actualPrompt}`;

    try {
      const contentParts: any[] = [{ text: enhancedPrompt }];
      if (hasPreviousPages) {
        const pagesToUse = selectedReferencePageIds?.length
          ? sessionHistory!.filter((p) =>
              selectedReferencePageIds.includes(p.id),
            )
          : sessionHistory!.slice(-3);
        const imageMap = await resolveImagesToBase64(
          pagesToUse.map((p) => p.url),
        );
        for (const page of pagesToUse) {
          if (!page.url || !imageMap[page.url]) continue;
          const raw = imageMap[page.url];
          const base64Data = raw.includes('base64,')
            ? raw.split('base64,')[1]
            : raw;
          contentParts.push({
            inlineData: { data: base64Data, mimeType: 'image/jpeg' },
          });
        }
      }

      if (config.referenceImages?.length) {
        for (const img of config.referenceImages) {
          const url =
            typeof img === 'string' ? img : img.enabled ? img.url : null;
          if (!url) continue;
          const base64Data = url.includes('base64,')
            ? url.split('base64,')[1]
            : url;
          contentParts.push({
            inlineData: { data: base64Data, mimeType: 'image/jpeg' },
          });
        }
      }

      let retryAttempt = 0;
      while (retryAttempt <= 5) {
        try {
          const response: any = await this.genAI.models.generateContent({
            model: IMAGE_GENERATION_MODEL,
            contents: {
              parts:
                retryAttempt === 0
                  ? contentParts
                  : [
                      {
                        text: sanitizeEnhancedPromptForRetry(
                          enhancedPrompt,
                          actualPrompt,
                          retryAttempt,
                        ),
                      },
                      ...contentParts.slice(1),
                    ],
            },
            config: {
              systemInstruction: MANGA_SYSTEM_INSTRUCTION,
              imageConfig: { aspectRatio: config.aspectRatio as any },
              safetySettings: [
                {
                  category: 'HARM_CATEGORY_HARASSMENT',
                  threshold: 'BLOCK_NONE',
                },
                {
                  category: 'HARM_CATEGORY_HATE_SPEECH',
                  threshold: 'BLOCK_NONE',
                },
                {
                  category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                  threshold: 'BLOCK_NONE',
                },
                {
                  category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                  threshold: 'BLOCK_NONE',
                },
              ] as any,
            },
          });

          const candidate = response.candidates?.[0];
          if (
            candidate?.finishReason === 'PROHIBITED_CONTENT' ||
            candidate?.finishReason === 'IMAGE_SAFETY' ||
            response.promptFeedback?.blockReason === 'PROHIBITED_CONTENT'
          ) {
            retryAttempt++;
            if (retryAttempt > 5)
              throw new Error('Safety block reached max retries');
            const adjusted = await adjustPromptWithAI(
              actualPrompt,
              candidate?.finishReason || response.promptFeedback?.blockReason,
              retryAttempt,
            );
            actualPrompt = adjusted;
            await delay(1000);
            continue;
          }

          const imageData = candidate?.content?.parts?.find(
            (p: any) => p.inlineData,
          )?.inlineData?.data;
          if (imageData) return `data:image/png;base64,${imageData}`;
          throw new Error('No image data returned');
        } catch (err: any) {
          if (isOverloadedError(err) && retryAttempt < 5) {
            retryAttempt++;
            await delay(1000 * Math.pow(2, retryAttempt));
            continue;
          }
          throw err;
        }
      }
      throw new Error('Failed after max retries');
    } catch (error) {
      console.error('Error in generateMangaImage:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
