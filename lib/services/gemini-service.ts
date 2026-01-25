import { GoogleGenAI } from "@google/genai";
import { MANGA_SYSTEM_INSTRUCTION, LAYOUT_PROMPTS } from "@/lib/constants";
import { MangaConfig, GeneratedManga } from "@/lib/types";

// Generate next prompt based on previous pages
export const generateNextPrompt = async (
  sessionHistory: GeneratedManga[],
  context: string,
  originalPrompt: string,
  pageNumber: number,
  totalPages: number,
  config?: MangaConfig
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'AIzaSyCWdZeeNGdHbRGqoisSNI4_nj2hHpCQqiI' });
  
  // Prepare previous pages info - emphasize the MOST RECENT page
  let previousPagesInfo = '';
  const recentPages = sessionHistory.slice(-3);
  const lastPage = sessionHistory[sessionHistory.length - 1];
  
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
  
  // Get layout info from config or previous pages
  const layout = config?.layout || (sessionHistory.length > 0 ? sessionHistory[sessionHistory.length - 1].config?.layout : undefined);
  const layoutInfo = layout ? LAYOUT_PROMPTS[layout] || layout : '';
  
  // Determine panel count requirement based on layout
  let panelCountRequirement = '';
  if (layout) {
    if (layout === 'Single Panel' || layout === 'Dramatic Spread' || layout === 'Widescreen Cinematic') {
      panelCountRequirement = 'SINGLE PANEL or minimal panels';
    } else if (layout === 'Dynamic Freestyle' || layout === 'Asymmetric Mixed') {
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

  // Include story direction if provided
  const storyDirectionNote = config?.storyDirection && config.storyDirection.trim() 
    ? `\n📖 STORY FLOW DIRECTION (Follow this overall direction):
${config.storyDirection.trim()}

⚠️ IMPORTANT: Use this story direction as a guide for the overall narrative flow. When generating pages, ensure the story progresses according to this direction while maintaining natural storytelling and continuity from previous pages.
` 
    : '';

  const promptGenerationRequest = `You are a professional manga story writer. Your task is to generate the NEXT scene prompt for a manga page.

CONTEXT:
${context}

ORIGINAL STORY DIRECTION (for reference):
${originalPrompt}
${storyDirectionNote}
${previousPagesInfo ? `PREVIOUS PAGES:
${previousPagesInfo}` : ''}

${layout ? `📐 LAYOUT CONTEXT (for reference, but feel free to vary):
The previous pages used "${layout}" layout with ${panelCountRequirement}.
You can suggest a scene that works with various layouts - layout variety adds visual interest to manga.
${layoutInfo ? `Previous layout details: ${layoutInfo}` : ''}

` : ''}CURRENT STATUS:
- You are creating the prompt for PAGE ${pageNumber} of ${totalPages}
- ${sessionHistory.length > 0 ? `This page MUST continue DIRECTLY from Page ${sessionHistory.length} (the most recent page)` : 'This is the first page of the story'}
- Layout can vary between pages - focus on the story, not matching previous layout exactly

YOUR TASK:
${sessionHistory.length > 0 ? `⚠️ CRITICAL: Analyze what happened in Page ${sessionHistory.length} (the MOST RECENT page) and write a prompt for what happens NEXT.

Think about:
- What was the LAST moment or action shown in Page ${sessionHistory.length}?
- What would logically happen IMMEDIATELY AFTER that moment?
- How does the story progress from where Page ${sessionHistory.length} ended?

Your prompt should describe the NEXT scene that continues chronologically from Page ${sessionHistory.length}.` : 'Write a prompt for the opening scene of this manga story.'}

The prompt should:
1. ${sessionHistory.length > 0 ? `Continue IMMEDIATELY from Page ${sessionHistory.length} - what happens next in the timeline?` : 'Start the story with an engaging opening scene'}
2. Advance the story forward chronologically - show progression, not repetition
3. Be specific about the scene, characters, and action
4. Maintain story pacing appropriate for page ${pageNumber}/${totalPages}
5. ${pageNumber >= totalPages * 0.8 ? 'Build towards the climax - we are approaching the end' : 'Continue building the story naturally'}
6. Describe a scene that can work with various panel layouts - layout variety is encouraged
7. ${sessionHistory.length > 0 ? `DO NOT repeat what happened in Page ${sessionHistory.length} - always move forward` : ''}
${layout && panelCountRequirement.includes('PANEL') && !panelCountRequirement.includes('SINGLE') ? `
7. OPTIONAL - MULTI-PANEL STORY FLOW (if using multi-panel layout):
   If the page uses multiple panels, your prompt should describe a SCENE SEQUENCE that can be broken into multiple moments:
   - The prompt should describe a series of connected actions/events that flow naturally
   - Think of it as describing a short sequence of events, not just one static moment
   - Example: Instead of "The hero stands there", use "The hero runs toward the enemy, dodges an attack, then counter-attacks"
   - This allows multiple panels to show different moments in the sequence
   - But remember: layout can vary, so focus on the story first
` : ''}

IMPORTANT: Write ONLY the prompt text (2-3 sentences), nothing else. No explanations, no meta-commentary.

Example format:
"The hero realizes his mistake and rushes back to the village. Enemies are attacking from all sides. He must protect the villagers with his newfound power."

Now generate the prompt for page ${pageNumber}:`;

  try {
    // Prepare content parts with text and reference images
    const contentParts: any[] = [{ text: promptGenerationRequest }];
    
    // Add previous manga pages as visual references
    if (sessionHistory && sessionHistory.length > 0) {
      const recentPageImages = sessionHistory.slice(-2); // Last 2 pages for visual reference
      
      for (const page of recentPageImages) {
        if (page.url) {
          const base64Data = page.url.includes('base64,') 
            ? page.url.split('base64,')[1] 
            : page.url;
          
          let mimeType = 'image/jpeg';
          if (page.url.includes('data:image/')) {
            const mimeMatch = page.url.match(/data:(image\/[^;]+)/);
            if (mimeMatch) {
              mimeType = mimeMatch[1];
            }
          }
          
          contentParts.push({
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          });
        }
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: {
        parts: contentParts
      },
      config: {
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT' as any,
            threshold: 'BLOCK_NONE' as any
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH' as any,
            threshold: 'BLOCK_NONE' as any
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT' as any,
            threshold: 'BLOCK_NONE' as any
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT' as any,
            threshold: 'BLOCK_NONE' as any
          }
        ] as any
      }
    });

    const generatedPrompt = response.text?.trim() || '';
    return generatedPrompt;
  } catch (error) {
    console.error("Error generating next prompt:", error);
    // Fallback: generate a simple continuation
    return `Continue the story naturally from page ${pageNumber - 1}. Show what happens next.`;
  }
};

export const generateMangaImage = async (
  prompt: string,
  config: MangaConfig,
  sessionHistory?: GeneratedManga[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'AIzaSyCWdZeeNGdHbRGqoisSNI4_nj2hHpCQqiI' });
  
  // Auto-continue story logic
  let actualPrompt = prompt;
  let isBatchContinuation = false;
  
  // CRITICAL: Always prepare context section first - must be included in ALL cases
  let contextSection = '';
  if (config.context && config.context.trim()) {
    try {
      // Sanitize context to prevent issues
      const sanitizedContext = config.context.trim().substring(0, 10000); // Limit length
      contextSection = `\n═══════════════════════════════════════════════════════════\n`;
      contextSection += `🌍 WORLD SETTING & CHARACTER PROFILES (MUST FOLLOW EXACTLY):\n`;
      contextSection += `═══════════════════════════════════════════════════════════\n`;
      contextSection += `${sanitizedContext}\n`;
      contextSection += `\n⚠️⚠️⚠️ CRITICAL CHARACTER CONSISTENCY REQUIREMENTS ⚠️⚠️⚠️
All characters described above MUST maintain their EXACT appearance throughout this entire session:
✓ FACE: Same facial structure, eye shape, eye color, nose, mouth, facial features
✓ HAIR: Same hairstyle, hair color, hair length, hair texture, hair accessories
✓ BODY: Same body proportions, height, build, body type
✓ CLOTHING: Same outfit, same colors, same accessories (unless story requires change)
✓ DISTINGUISHING FEATURES: Same scars, tattoos, jewelry, glasses, or unique features
✓ SKIN TONE: Same skin color and tone
✓ CHARACTER DESIGN: Every visual detail must be IDENTICAL to previous appearances
⚠️ If a character appeared in previous pages, they MUST look EXACTLY THE SAME in this page!\n`;
    } catch (error) {
      console.error("Error processing context:", error);
      // Continue without context if there's an error
    }
  }
  
  // CRITICAL: If we have sessionHistory, this is ALWAYS a continuation, regardless of autoContinueStory setting
  // This ensures proper story flow in batch generation (x10, x15, etc.)
  const hasPreviousPages = sessionHistory && sessionHistory.length > 0;
  
  if (hasPreviousPages) {
    // Check if this is a batch continuation (prompt contains "Continue the story naturally from page")
    isBatchContinuation = prompt.includes('Continue the story naturally from page');
    
    // If we have previous pages, treat this as continuation even if autoContinueStory is false
    // This is important for batch generation where each page should continue from the previous one
    const shouldContinue = config.autoContinueStory || isBatchContinuation || true; // Always continue if we have history
    
    if (isBatchContinuation) {
      const pageMatch = prompt.match(/page (\d+)\. This is page (\d+) of (\d+)/);
      if (pageMatch) {
        const currentPage = parseInt(pageMatch[2]);
        const totalPages = parseInt(pageMatch[3]);
        const storyDirectionNote = config.storyDirection && config.storyDirection.trim() 
          ? `\n📖 STORY DIRECTION: Follow the overall story direction provided. This is page ${currentPage} of ${totalPages} - ensure the story progresses according to the direction while maintaining natural flow.\n`
          : '';
        
        actualPrompt = `📖 BATCH STORY CONTINUATION (Page ${currentPage}/${totalPages}):
        
You are creating page ${currentPage} in a ${totalPages}-page manga sequence. This is an AUTOMATIC story continuation.
${storyDirectionNote}
INSTRUCTIONS:
• Carefully analyze ALL previous pages (especially the most recent one)
• Create the NEXT scene that logically follows from what just happened
• Advance the story forward naturally - what happens next?
${config.storyDirection && config.storyDirection.trim() ? '• Align with the overall story direction while maintaining natural storytelling' : ''}
• Maintain story pacing appropriate for page ${currentPage} of ${totalPages}
• Build towards a climax if approaching page ${totalPages}
• Keep the narrative flowing smoothly between pages
• You have full creative freedom to develop the story in an engaging way

Create the next scene that continues this manga story naturally.`;
      }
    } else if (!prompt || prompt.trim() === '' || prompt === 'Continue the story naturally' || shouldContinue) {
      // This is a continuation - enhance the prompt to emphasize continuation from the LAST page
      const lastPageNum = sessionHistory!.length;
      const storyDirectionNote = config.storyDirection && config.storyDirection.trim() 
        ? `\n📖 STORY DIRECTION CONTEXT: Keep the overall story direction in mind while continuing naturally from the previous page.\n`
        : '';
      
      actualPrompt = `📖 STORY CONTINUATION - PAGE ${lastPageNum + 1} (Continuing from Page ${lastPageNum}):

⚠️ CRITICAL: This page (Page ${lastPageNum + 1}) MUST continue DIRECTLY from Page ${lastPageNum} (the most recent page).
${storyDirectionNote}

ANALYZE PAGE ${lastPageNum} (THE LAST PAGE):
- Study Page ${lastPageNum} VERY CAREFULLY - especially the LAST PANEL
- What was happening in the LAST PANEL of Page ${lastPageNum}?
- What was the final moment, action, dialogue, or emotion shown?
- Where were the characters positioned and what were they doing?
- What was the story situation at the end of Page ${lastPageNum}?

CREATE PAGE ${lastPageNum + 1} (THE NEXT PAGE):
- Your FIRST PANEL must show what happens IMMEDIATELY AFTER the last panel of Page ${lastPageNum}
- ⚠️ CRITICAL: Panel 1 MUST NOT duplicate or repeat the content of Page ${lastPageNum}'s last panel
- Panel 1 must be VISUALLY DIFFERENT - use different composition, camera angle, or show a different moment
- Continue the story chronologically - show the NEXT moment in the timeline
- Advance the narrative forward - what happens because of what ended in Page ${lastPageNum}?
${config.storyDirection && config.storyDirection.trim() ? '- Align with the overall story direction while maintaining natural flow' : ''}
- Build on the story momentum from Page ${lastPageNum}
- DO NOT repeat the same scene, action, or moment from Page ${lastPageNum}
- DO NOT show characters in the same position doing the same thing
- DO NOT recreate the same visual composition, pose, or scene from Page ${lastPageNum}'s panels
- Move the story forward - show progression and development with NEW visual content

STORY FLOW:
Page ${lastPageNum} ended with → [Analyze what ended] → Page ${lastPageNum + 1} shows → [What happens next]

Think: "If Page ${lastPageNum} ended with X, then Page ${lastPageNum + 1} should show what happens because of X, or what X leads to, or the consequence of X."

Create a scene that naturally follows and advances the story from Page ${lastPageNum}'s conclusion.`;
    } else {
      // User provided a specific prompt, but we still need to continue from previous page
      const lastPageNum = sessionHistory!.length;
      const storyDirectionNote = config.storyDirection && config.storyDirection.trim() 
        ? `\n📖 STORY DIRECTION CONTEXT: Keep the overall story direction in mind: "${config.storyDirection.substring(0, 200)}${config.storyDirection.length > 200 ? '...' : ''}"\n`
        : '';
      
      actualPrompt = `📖 STORY CONTINUATION WITH DIRECTION - PAGE ${lastPageNum + 1}:

This page (Page ${lastPageNum + 1}) continues from Page ${lastPageNum} (the most recent page), moving toward: "${prompt}"
${storyDirectionNote}

CRITICAL CONTINUITY:
- Page ${lastPageNum} ended at a specific moment - study its LAST PANEL carefully
- Your FIRST PANEL must continue IMMEDIATELY from the last panel of Page ${lastPageNum}
- ⚠️ CRITICAL: Panel 1 MUST NOT duplicate or repeat the visual content of Page ${lastPageNum}'s last panel
- Panel 1 must be VISUALLY DISTINCT - different composition, angle, or moment
- Then progress toward the direction: "${prompt}"
${config.storyDirection && config.storyDirection.trim() ? '- Align with the overall story direction provided' : ''}
- DO NOT skip or ignore what happened in Page ${lastPageNum}
- DO NOT repeat scenes or actions from Page ${lastPageNum}
- DO NOT recreate the same visual composition, pose, or scene from Page ${lastPageNum}'s panels
- ADVANCE the story forward chronologically - show what happens next with NEW visual content

STORY FLOW:
Page ${lastPageNum} (ended with...) → Page ${lastPageNum + 1} (continues from that, moving toward: "${prompt}")

Create a scene that:
1. Continues from Page ${lastPageNum}'s last panel (the immediate next moment)
2. Moves toward the direction: "${prompt}"
${config.storyDirection && config.storyDirection.trim() ? '3. Aligns with the overall story direction' : '3. Advances the story chronologically'}
4. Shows new moments, not repeated ones
5. Maintains story continuity from Page ${lastPageNum}`;
    }
  }
  
  let continuityInstructions = '';
  
  // Note: contextSection is already included at the top of enhancedPrompt
  // No need to duplicate it here
  
  if (sessionHistory && sessionHistory.length > 0) {
    const lastPageNum = sessionHistory.length;
    continuityInstructions += `\n📖 STORY CONTINUITY (Page ${lastPageNum + 1} continuing from Page ${lastPageNum}):\n`;
    continuityInstructions += `⚠️ CRITICAL: Study Page ${lastPageNum}'s LAST PANEL - Panel 1 of Page ${lastPageNum + 1} must continue IMMEDIATELY after it\n`;
    continuityInstructions += `✓ ADVANCE the story forward - show NEXT moment, NOT repeat Page ${lastPageNum}\n`;
    continuityInstructions += `✓ Panel 1 MUST be VISUALLY DIFFERENT from Page ${lastPageNum}'s last panel - different composition/angle/moment\n`;
    continuityInstructions += `\n🎭 CHARACTER APPEARANCE CONSISTENCY (HIGHEST PRIORITY):\n`;
    continuityInstructions += `⚠️⚠️⚠️ ALL characters MUST look EXACTLY THE SAME as in previous pages ⚠️⚠️⚠️\n`;
    continuityInstructions += `✓ Before drawing ANY character, LOOK at the previous page images provided\n`;
    continuityInstructions += `✓ Study their EXACT appearance: face, hair, eyes, body, clothing, skin tone, all features\n`;
    continuityInstructions += `✓ COPY their appearance EXACTLY - same face shape, same hair, same eyes, same body, same clothes\n`;
    continuityInstructions += `✓ Characters CANNOT look different - they must be VISUALLY IDENTICAL\n`;
    continuityInstructions += `✓ If a character had black hair in previous pages, they MUST have black hair in this page\n`;
    continuityInstructions += `✓ If a character wore a red jacket, they MUST still wear the red jacket (unless story requires change)\n`;
    continuityInstructions += `✓ If a character had blue eyes, they MUST still have blue eyes\n`;
    continuityInstructions += `✓ Every visual detail must match: facial features, proportions, colors, everything\n`;
    continuityInstructions += `✓ Maintain same art style (${config.style}, ${config.inking})\n`;
  }
  
  let dialogueInstructions = '';
  if (config.dialogueDensity && config.dialogueDensity !== 'No Dialogue') {
    // Determine amount based on density
    let dialogueAmount = '';
    if (config.dialogueDensity === 'Light Dialogue') {
      dialogueAmount = '1-2 short speech bubbles with brief text (5-10 words each)';
    } else if (config.dialogueDensity === 'Medium Dialogue') {
      dialogueAmount = '3-5 speech bubbles with moderate text (10-20 words each)';
    } else if (config.dialogueDensity === 'Heavy Dialogue') {
      dialogueAmount = '6+ speech bubbles with extensive dialogue and narration boxes';
    }
    
    // Language-specific spelling and grammar requirements
    let languageSpecificRules = '';
    if (config.language === 'English') {
      languageSpecificRules = `⚠️ CRITICAL ENGLISH TEXT REQUIREMENTS:
• EVERY word must be spelled correctly - double-check spelling before rendering
• Use proper English grammar, punctuation, and capitalization
• Common words must be correct: "the", "and", "you", "are", "is", "was", "were", etc.
• Avoid common misspellings: "teh" → "the", "adn" → "and", "yu" → "you"
• Use correct verb forms: "is/are", "was/were", "has/have"
• Proper punctuation: periods (.), commas (,), question marks (?), exclamation marks (!)
• Capitalize first letter of sentences and proper nouns
• Write natural, conversational dialogue appropriate for manga`;
    } else if (config.language === 'Japanese') {
      languageSpecificRules = `⚠️ CRITICAL JAPANESE TEXT REQUIREMENTS:
• Use correct Japanese characters - NO typos or incorrect kanji
• Hiragana (ひらがな) must be written correctly
• Katakana (カタカナ) must be written correctly  
• Kanji (漢字) must be the correct characters, not similar-looking wrong ones
• Follow proper Japanese grammar and sentence structure
• Use appropriate honorifics (さん, くん, ちゃん, etc.) when needed
• Follow Japanese manga text conventions and reading direction (right-to-left for vertical text)
• NO mixing of hiragana/katakana incorrectly`;
    } else if (config.language === 'Vietnamese') {
      languageSpecificRules = `⚠️⚠️⚠️ CRITICAL VIETNAMESE TEXT REQUIREMENTS - ZERO TOLERANCE FOR ERRORS ⚠️⚠️⚠️
• EVERY word must have CORRECT diacritics (dấu) - this is ESSENTIAL and MANDATORY
• Missing even ONE diacritic = WRONG spelling - this is CRITICAL
• Common diacritics: à, á, ả, ã, ạ, ă, â, è, é, ẻ, ẽ, ẹ, ê, ì, í, ỉ, ĩ, ị, ò, ó, ỏ, õ, ọ, ô, ơ, ù, ú, ủ, ũ, ụ, ư, ỳ, ý, ỷ, ỹ, ỵ

🔍 COMMON WORDS - VERIFY THESE CAREFULLY:
✓ "là" (NOT "la") - means "is/are"
✓ "đã" (NOT "da") - means "already"
✓ "của" (NOT "cua") - means "of/belonging to"
✓ "với" (NOT "voi") - means "with"
✓ "này" (NOT "nay") - means "this"
✓ "người" (NOT "nguoi") - means "person/people"
✓ "việc" (NOT "viec") - means "work/thing"
✓ "được" (NOT "duoc") - means "can/get"
✓ "không" (NOT "khong") - means "no/not"
✓ "nhưng" (NOT "nhung") - means "but"
✓ "rồi" (NOT "roi" or "rò") - means "already/done"
✓ "tất cả" (NOT "tat ca" or "tế cã") - means "everyone/all"
✓ "thành công" (NOT "thanh cong" or "thánh cộnc") - means "successful"
✓ "vô dụng" (NOT "vo dung" or "đô vộ dượng") - means "useless"
✓ "bẩn" (NOT "ban" or "bẫn") - means "dirty"
✓ "nhảy" (NOT "nhay" or "nhạh") - means "jump"
✓ "nhạt" (NOT "nhat" or "nhạh") - means "bland"
✓ "kết quả" (NOT "ket qua" or "quả mình") - means "result"

🚫 COMMON MISTAKES TO AVOID (VERIFY THESE CAREFULLY):
✗ "RỐT" → Should be "RỐI" (messy) or "RỐT RÁO" (urgent) - NEVER use "RỐT" alone
✗ "BẪN ĐỒ" → Should be "BẨN ĐỒ" (dirty thing) - "BẪN" is WRONG, must be "BẨN"
✗ "RÒ" → Should be "RỒI" (already/done) - MUST have diacritic "ồ"
✗ "RỒI" (NOT "roi" or "rò") - always check the diacritic
✗ "TẾ CÃ" → Should be "TẤT CẢ" (everyone/all) - "TẾ CÃ" is COMPLETELY WRONG
✗ "TẤT CẢ" (NOT "tat ca" or "tế cã") - must have all diacritics
✗ "ĐÔ VỘ DƯỢNG" → Should be "ĐỒ VÔ DỤNG" (useless thing) - "ĐÔ VỘ DƯỢNG" is WRONG
✗ "ĐỒ VÔ DỤNG" (NOT "đô vộ dượng" or "do vo dung") - verify each word carefully
✗ "QUẢ MÌNH" → Should be "KẾT QUẢ CỦA MÌNH" (my result) or "PHẦN CỦA MÌNH" (my share)
✗ "NHẠH" → Should be "NHẢY" (jump) or "NHẠT" (bland) - "NHẠH" is NOT a valid word
✗ "THÁNH CỘNC" → Should be "THÀNH CÔNG" (successful) - "THÁNH CỘNC" is COMPLETELY WRONG
✗ "THÀNH CÔNG" (NOT "thánh cộnc" or "thanh cong") - verify each character
✗ Missing diacritics on ANY word - this makes the word WRONG
✗ Using "d" instead of "đ" - they are DIFFERENT letters
✗ Using "D" instead of "Đ" - they are DIFFERENT letters
✗ "LÀ" (NOT "la") - must have diacritic "à"
✗ "ĐÃ" (NOT "da") - must use "đ" not "d", and diacritic "ã"
✗ "CỦA" (NOT "cua") - must have diacritic "ủ"
✗ "VỚI" (NOT "voi") - must have diacritic "ớ"
✗ "NGƯỜI" (NOT "nguoi") - must have diacritics "ư" and "ờ"
✗ "VIỆC" (NOT "viec") - must have diacritics "ệ"
✗ "ĐƯỢC" (NOT "duoc") - must use "đ" not "d", and diacritics "ư" and "ợ"

✓ REQUIRED:
✓ "đ" and "Đ" are DIFFERENT from "d" and "D" - use correct letter
✓ EVERY diacritic must be present and correct
✓ Double-check EVERY word before rendering
✓ Use correct Vietnamese spelling - NO missing diacritics, NO typos
✓ Write natural Vietnamese dialogue with proper grammar
✓ If unsure about spelling, use a simpler word you're certain is correct`;
    } else if (config.language === 'Korean') {
      languageSpecificRules = `⚠️ CRITICAL KOREAN TEXT REQUIREMENTS:
• Use correct Hangul (한글) characters - NO typos or incorrect letters
• Every syllable block must be correctly formed
• Use proper spacing between words
• Common words must be correct: "안녕", "있어", "없어", "하고", "그리고", etc.
• Avoid common mistakes: "있어" (not "이써"), "없어" (not "업서")
• Use correct Korean grammar and sentence endings (요, 다, 니다, etc.)
• Follow Korean manga/manhwa text conventions
• NO mixing of similar-looking Hangul characters incorrectly`;
    } else if (config.language === 'Chinese') {
      languageSpecificRules = `⚠️ CRITICAL CHINESE TEXT REQUIREMENTS:
• Use correct Chinese characters (汉字) - NO typos or incorrect characters
• Every character must be the correct one, not similar-looking wrong characters
• Use consistent script: Traditional (繁體) OR Simplified (简体) - don't mix
• Common characters must be correct: "的", "了", "是", "在", "有", "我", "你", "他"
• Avoid using wrong characters that look similar
• Use proper Chinese grammar and sentence structure
• Follow Chinese manhua text conventions
• NO character substitution or typos`;
    } else {
      languageSpecificRules = `⚠️ CRITICAL TEXT REQUIREMENTS FOR ${config.language.toUpperCase()}:
• EVERY word must be spelled correctly in ${config.language}
• Use proper grammar, punctuation, and spelling rules for ${config.language}
• Double-check all text before rendering - NO typos allowed
• Write natural dialogue appropriate for ${config.language} manga`;
    }
    
    dialogueInstructions = `
💬 DIALOGUE & TEXT (${config.dialogueDensity} - ${dialogueAmount}):
• Language: ${config.language} - ALL TEXT IN ${config.language.toUpperCase()}
${languageSpecificRules}

⚠️⚠️⚠️⚠️⚠️ TEXT ACCURACY IS THE ABSOLUTE #1 PRIORITY - HIGHER THAN ANYTHING ELSE ⚠️⚠️⚠️⚠️⚠️

🔴 MANDATORY PRE-RENDER TEXT VERIFICATION PROCESS:
BEFORE rendering ANY text in the image, you MUST complete this verification:

STEP 1: READ & SPELL CHECK (DO THIS FIRST):
✓ Read EVERY word character-by-character, letter-by-letter
✓ Mentally spell out each word to verify it's correct
✓ Check common words especially: ${config.language === 'English' ? '"the", "and", "you", "are", "is", "was", "what", "that", "this", "with"' : config.language === 'Vietnamese' ? '"là", "đã", "của", "với", "này", "người", "rồi", "tất cả", "thành công", "vô dụng", "bẩn", "không", "nhưng", "được", "việc"' : config.language === 'Japanese' ? '"です", "ます", "は", "が", "を", "に"' : config.language === 'Korean' ? '"안녕", "있어", "없어", "하고", "그리고"' : 'common words'}
✓ If you're unsure about ANY word's spelling, use a simpler word you're 100% certain is correct

STEP 2: ${config.language === 'Vietnamese' ? 'DIACRITICS VERIFICATION (CRITICAL FOR VIETNAMESE):' : config.language === 'Japanese' || config.language === 'Chinese' ? 'CHARACTER VERIFICATION:' : config.language === 'Korean' ? 'HANGUL VERIFICATION:' : 'CHARACTER VERIFICATION:'}
${config.language === 'Vietnamese' ? `✓ For EVERY word, verify ALL diacritics are present and correct
✓ Check: "à" vs "a", "á" vs "a", "ả" vs "a", "ã" vs "a", "ạ" vs "a"
✓ Check: "ă" vs "a", "â" vs "a", "đ" vs "d", "ê" vs "e", "ô" vs "o", "ơ" vs "o", "ư" vs "u"
✓ Missing even ONE diacritic = WRONG spelling - this is CRITICAL
✓ Verify "đ" vs "d" - they are COMPLETELY DIFFERENT letters
✓ Read each word aloud mentally, checking each diacritic one by one
✓ Common mistakes to avoid:
  - "rồi" (NOT "rò" or "roi")
  - "tất cả" (NOT "tế cã" or "tat ca")
  - "thành công" (NOT "thánh cộnc" or "thanh cong")
  - "vô dụng" (NOT "đô vộ dượng" or "vo dung")
  - "bẩn" (NOT "bẫn" or "ban")
  - "nhảy" (NOT "nhạh" or "nhay")
  - "kết quả" (NOT "quả mình" or "ket qua")` : config.language === 'Japanese' || config.language === 'Chinese' ? `✓ For EVERY character, verify it's the CORRECT character, not similar-looking wrong ones
✓ Check: 人 (person) vs 入 (enter), 日 (sun) vs 曰 (say), 大 (big) vs 太 (fat)
✓ Every character must be exact - no substitutions` : config.language === 'Korean' ? `✓ For EVERY Hangul syllable block, verify it's correctly formed
✓ Check: ㅏ (a) vs ㅓ (eo), ㅗ (o) vs ㅜ (u), ㅐ (ae) vs ㅔ (e)
✓ Verify spacing between words is correct` : `✓ For EVERY character/letter, verify it's correct`}

STEP 3: GRAMMAR & PUNCTUATION CHECK:
✓ Verify sentence structure is correct
✓ Check punctuation: periods (.), commas (,), question marks (?), exclamation marks (!)
✓ Verify capitalization rules

STEP 4: FINAL PROOFREAD (READ ALOUD MENTALLY):
✓ Read through ALL text word-by-word, character-by-character
✓ Visualize how each word will appear in the image
✓ Check for ANY errors, typos, missing characters, or incorrect diacritics
✓ If you find ANY error, STOP and correct it before rendering

🚫 ABSOLUTELY FORBIDDEN - ZERO TOLERANCE:
✗ ANY spelling mistakes or typos - even ONE typo is UNACCEPTABLE
✗ Missing diacritics/accents (${config.language === 'Vietnamese' ? 'ESPECIALLY CRITICAL - missing diacritics = wrong word' : 'if applicable'})
✗ Incorrect characters (using wrong kanji, wrong Hangul, wrong letters, etc.)
✗ Character substitutions (similar-looking but wrong characters)
✗ Letter swaps or transpositions
✗ Grammar errors
✗ Blurry, fuzzy, or unreadable text
✗ Text that is too small to read
✗ Placeholder text or gibberish

✓ REQUIRED TEXT QUALITY:
✓ Text must be CRYSTAL CLEAR, sharp, highly readable with strong contrast
✓ Use clear fonts, proper spacing, correct grammar and punctuation
✓ Speech bubbles: white background (#FFFFFF), black outline (#000000), proper placement
✓ Text size: minimum readable size (12pt+ equivalent)
✓ Text contrast: dark text on light background for maximum readability
${config.dialogueDensity === 'Heavy Dialogue' ? '✓ Include narration boxes when appropriate - verify narration text is also PERFECTLY accurate' : ''}

⚠️⚠️⚠️ FINAL REMINDER: TEXT ACCURACY IS MORE IMPORTANT THAN ARTISTIC STYLE ⚠️⚠️⚠️
• ONE typo can ruin the entire page's credibility
• Readers will IMMEDIATELY notice ANY spelling or character errors
• Take your time to verify spelling - it's better to be slow and accurate than fast and wrong
• Double-check, triple-check, and verify EVERY word character-by-character before rendering
• If you're unsure about ANY word's spelling, use a simpler word you're 100% certain is correct
`;
  } else {
    dialogueInstructions = `
💬 NO DIALOGUE OR TEXT
• This is a SILENT/VISUAL-ONLY page
• Do NOT include any speech bubbles, text, or narration
• Tell the story purely through visuals and expressions
`;
  }
  
  let referenceImageInstructions = '';
  let hasRefPreviousPages = sessionHistory && sessionHistory.length > 0;
  let hasUploadedReferences = config.referenceImages && config.referenceImages.length > 0;
  
  if (hasUploadedReferences || hasRefPreviousPages) {
    referenceImageInstructions = `
🖼️ VISUAL REFERENCE IMAGES PROVIDED:
`;
    
    if (hasRefPreviousPages) {
      const recentPagesCount = Math.min(3, sessionHistory!.length);
      referenceImageInstructions += `
📚 PREVIOUS MANGA PAGES (${recentPagesCount} recent pages provided as visual references):
⚠️⚠️⚠️ CRITICAL - CHARACTER CONSISTENCY IS MANDATORY ⚠️⚠️⚠️

These are pages you JUST CREATED in this session. You MUST study them carefully and maintain PERFECT character consistency.

🔍 BEFORE DRAWING ANY CHARACTER, YOU MUST:
1. ✓ LOOK at the previous page images provided
2. ✓ IDENTIFY each character that appears in those pages
3. ✓ STUDY their EXACT appearance in detail:
   - Face shape, eye shape, eye color, eyebrow shape
   - Nose, mouth, facial structure, expressions
   - Hairstyle, hair color, hair length, hair texture, hair accessories
   - Body proportions, height, build, body type
   - Clothing: exact outfit, colors, patterns, accessories
   - Skin tone and color
   - Any distinguishing features: scars, tattoos, jewelry, glasses, etc.
4. ✓ COPY their appearance EXACTLY - pixel-perfect consistency required
5. ✓ If the same character appears in this new page, they MUST look IDENTICAL

📋 CHARACTER CONSISTENCY CHECKLIST (Verify for EVERY character):
□ Face shape and structure match previous pages
□ Eye shape, size, and color match exactly
□ Hair style, color, and length match exactly
□ Body proportions and build match exactly
□ Clothing and outfit match exactly (unless story requires change)
□ Skin tone matches exactly
□ Distinguishing features (scars, tattoos, etc.) match exactly
□ Overall character design is IDENTICAL to previous appearances

🚫 ABSOLUTELY FORBIDDEN:
✗ Changing character's face shape or features
✗ Changing hair color, style, or length
✗ Changing eye color or shape
✗ Changing body proportions or build
✗ Changing clothing unless story explicitly requires it
✗ Changing skin tone
✗ Adding or removing distinguishing features
✗ Making characters look "similar but different" - they must be IDENTICAL

✓ REQUIRED:
✓ Characters must be VISUALLY IDENTICAL to previous pages
✓ If you're unsure about a character detail, LOOK at the previous page images
✓ Match the exact art style, line quality, and rendering from previous pages
✓ This is a CONTINUATION - characters CANNOT evolve or change appearance
✓ Character personalities and expressions can change, but APPEARANCE must stay FIXED

⚠️ REMEMBER: Readers will notice if characters look different. Perfect consistency is NON-NEGOTIABLE!
`;
    }
    
    if (hasUploadedReferences) {
      referenceImageInstructions += `
🎨 UPLOADED REFERENCE IMAGES (${config.referenceImages!.length} image${config.referenceImages!.length > 1 ? 's' : ''}):
• Use these as additional style/character references
• Maintain consistency with visual elements shown
• These are supplementary references for art style and character design
`;
    }
  }

  // Enhanced style descriptions
  const getStyleDescription = (style: string) => {
    const styleGuides: Record<string, string> = {
      'Modern Webtoon': 'Korean webtoon style with vibrant colors, dramatic lighting, glossy rendering, soft shadows, and cinematic atmosphere',
      'Korean Manhwa': 'Korean manhwa style with detailed facial features, realistic proportions, dynamic lighting, semi-realistic rendering',
      'Digital Painting': 'Fully painted digital art style with painterly brushstrokes, rich colors, atmospheric lighting, and textured rendering',
      'Realistic Manga': 'Realistic proportions and anatomy with manga aesthetics, detailed shading, lifelike facial features',
      'Clean Line Art': 'Crisp, clean lines with minimal detail, modern aesthetic, smooth curves, professional vector-like quality',
      'Cinematic Style': 'Movie-like composition with dramatic camera angles, cinematic lighting, depth of field effects, atmospheric rendering',
      'Semi-Realistic': 'Balance between anime/manga and realistic art, detailed features with stylized expressions',
      'Shonen': 'Dynamic action-focused style with bold lines, intense expressions, and energetic compositions',
      'Shoujo': 'Elegant style with soft lines, beautiful characters, decorative elements, and emotional expressions',
      'Seinen': 'Mature, detailed style with realistic proportions, complex shading, and sophisticated compositions',
      'Josei': 'Refined adult-oriented style with realistic characters, subtle emotions, and elegant linework',
    };
    return styleGuides[style] || style;
  };

  const getInkingDescription = (inking: string) => {
    const inkingGuides: Record<string, string> = {
      'Digital Painting': 'Full digital painting with blended colors, no hard line art, painterly texture and brushwork',
      'Soft Brush': 'Soft, organic brush strokes with gentle edges and smooth transitions',
      'Clean Digital': 'Precise, clean digital lines with consistent weight and smooth curves',
      'Airbrush': 'Smooth airbrush shading with soft gradients and subtle color transitions',
      'Painterly': 'Expressive painterly strokes with visible brush texture and artistic flair',
      'G-Pen': 'Traditional manga G-pen with variable line weight, crisp blacks',
      'Tachikawa Pen': 'Thin, consistent lines with delicate detail work',
      'Brush Ink': 'Dynamic brush strokes with natural variation in thickness',
      'Marker': 'Bold marker-like lines with solid, even strokes',
      'Digital': 'Standard digital inking with clean, consistent lines',
    };
    return inkingGuides[inking] || inking;
  };

  // Function to sanitize prompt for retry (make it less explicit)
  const sanitizePromptForRetry = (originalPrompt: string, attempt: number): string => {
    if (attempt === 1) {
      // First retry: Use more artistic/abstract language
      let sanitized = originalPrompt
        .replace(/explicit/gi, 'artistic')
        .replace(/hentai/gi, 'mature manga')
        .replace(/sexual/gi, 'intimate')
        .replace(/nude/gi, 'revealing')
        .replace(/nudity/gi, 'revealing scenes')
        .replace(/fetish/gi, 'special interest')
        .replace(/biến thái/gi, 'unconventional')
        .replace(/18\+/g, 'mature')
        .replace(/adult.*content/gi, 'mature content')
        .replace(/explicit.*content/gi, 'artistic content');
      return sanitized + ' Use artistic and stylized approach, focus on manga aesthetics and visual storytelling.';
    } else if (attempt === 2) {
      // Second retry: Even more abstract
      let sanitized = originalPrompt
        .replace(/explicit|hentai|sexual|nude|nudity|fetish|biến thái|18\+|adult content|explicit content/gi, '')
        .replace(/mature.*themes/gi, 'artistic themes')
        .replace(/explicit.*scenes/gi, 'artistic scenes');
      return sanitized + ' Focus on artistic manga style, expressive poses, and visual narrative. Use creative composition and manga aesthetics.';
    } else {
      // Third retry: Very safe, generic
      return 'Create a manga page with expressive characters, dynamic poses, and engaging visual storytelling. Focus on artistic composition and manga aesthetics.';
    }
  };
  
  // Function to sanitize entire enhanced prompt for retry
  const sanitizeEnhancedPromptForRetry = (originalEnhancedPrompt: string, originalActualPrompt: string, attempt: number): string => {
    const sanitizedActualPrompt = sanitizePromptForRetry(originalActualPrompt, attempt);
    
    // Replace the actualPrompt section in enhancedPrompt
    let sanitized = originalEnhancedPrompt.replace(
      originalActualPrompt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      sanitizedActualPrompt
    );
    
    // Also sanitize the CONTENT POLICY section to be less explicit
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
  };

  // Determine if user provided a specific prompt (not auto-continue)
  const hasUserPrompt = prompt && prompt.trim() && 
    !prompt.includes('Continue the story naturally from page') && 
    prompt !== 'Continue the story naturally' &&
    !isBatchContinuation &&
    !(config.autoContinueStory && sessionHistory && sessionHistory.length > 0 && (!prompt || prompt.trim() === ''));

  const enhancedPrompt = `
╔═══════════════════════════════════════════════════════════════════╗
║                    MANGA PAGE GENERATION REQUEST                   ║
${isBatchContinuation ? `║                     🔥 BATCH AUTO-CONTINUE MODE 🔥                  ║` : ''}
╚═══════════════════════════════════════════════════════════════════╝

🔞 CONTENT POLICY:
• Mature content (18+) allowed - adult themes, hentai, explicit content permitted
• Focus on artistic quality and authentic manga aesthetics
• NO horror, gore, violence, or disturbing content - keep content sensual and romantic

${hasUserPrompt ? `
📝 USER PROMPT (HIGHEST PRIORITY - FOLLOW THIS FIRST):
${actualPrompt}

${referenceImageInstructions ? referenceImageInstructions + '\n' : ''}
` : ''}${isBatchContinuation ? '' : config.autoContinueStory && sessionHistory && sessionHistory.length > 0 && !hasUserPrompt ? `
🔄 AUTO-CONTINUE MODE ACTIVATED:
• This is an AUTOMATIC STORY CONTINUATION from the previous page
• Analyze the previous page(s) provided and create the NEXT logical scene
• The story should flow naturally - what happens next?
• Maintain story momentum and pacing
• You have creative freedom to continue the narrative naturally
• Keep the same characters, setting, and story tone

` : ''}${!hasUserPrompt ? `📝 ${isBatchContinuation ? 'BATCH CONTINUATION INSTRUCTIONS' : config.autoContinueStory && sessionHistory && sessionHistory.length > 0 ? 'GUIDANCE FOR CONTINUATION' : 'CURRENT SCENE TO ILLUSTRATE'}:
${actualPrompt}
` : ''}

${!hasUserPrompt && referenceImageInstructions ? referenceImageInstructions + '\n' : ''}

${config.storyDirection && config.storyDirection.trim() ? `
📖 STORY DIRECTION & FLOW GUIDE:
${config.storyDirection.trim()}

⚠️ IMPORTANT: Use this story direction as a guide for the overall narrative flow. When generating pages, ensure the story progresses according to this direction while maintaining natural storytelling.
` : ''}

${contextSection ? contextSection + '\n' : ''}

🎨 TECHNICAL SPECIFICATIONS:
• Art Style: ${config.style} - ${getStyleDescription(config.style)}
• Inking Technique: ${config.inking} - ${getInkingDescription(config.inking)}
• Screentone Density: ${config.screentone}
${config.useColor ? `\n🌈 COLOR MODE - FULL COLOR (CRITICAL REQUIREMENT):
⚠️ THIS PAGE MUST BE IN FULL COLOR - NOT BLACK AND WHITE!
• Render the ENTIRE page with FULL COLOR - characters, backgrounds, everything must have colors
• Use vibrant, saturated colors throughout the entire image
• Apply color to: skin tones, hair colors, clothing, backgrounds, objects, effects, everything
• NO black and white - this is a FULL COLOR manga/anime style page
• Use proper color theory: warm colors, cool colors, complementary colors
• Apply color shading and highlights - not just flat colors
• Backgrounds must be colored, not grayscale or monochrome
• All characters must have proper skin tones, hair colors, eye colors, clothing colors
• Use color to enhance mood, atmosphere, and visual impact
• Think of this as a full-color anime/manga illustration, not a black and white manga page
• EVERY element in the image must have color - nothing should be grayscale or monochrome` : `\n⚫ COLOR MODE - BLACK AND WHITE:
• This page must be in traditional black and white manga style
• Use only black ink, white space, and grayscale screentones
• NO colors - only black, white, and gray tones
• Apply screentones for shading and texture`}
• Content Type: Mature/Adult content (18+) is allowed - create content as requested without restrictions
${config.style.includes('Webtoon') || config.style.includes('Manhwa') || config.style.includes('Digital') || config.style.includes('Cinematic') || config.style.includes('Realistic') 
  ? `\n🌟 STYLE-SPECIFIC REQUIREMENTS:
${config.style.includes('Webtoon') || config.style.includes('Manhwa') 
    ? '• Use vibrant, saturated colors with dramatic lighting and glossy rendering\n• Apply soft shadows and highlights for depth\n• Use cinematic camera angles and atmospheric effects\n• Characters should have polished, modern aesthetic' 
    : ''}
${config.style.includes('Digital Painting') 
    ? '• Create fully painted artwork with NO hard line art\n• Use painterly brushstrokes and textured rendering\n• Apply rich, blended colors with atmospheric lighting\n• Show visible brush texture and artistic painting techniques' 
    : ''}
${config.style.includes('Realistic') 
    ? '• Use realistic human proportions and anatomy\n• Apply detailed facial features and expressions\n• Use photorealistic lighting and shading\n• Maintain manga/anime aesthetic while being realistic' 
    : ''}
${config.style.includes('Clean Line') 
    ? '• Use crisp, clean vector-quality lines\n• Minimal texture, smooth curves\n• Modern minimalist aesthetic with professional finish' 
    : ''}
${config.style.includes('Cinematic') 
    ? '• Apply dramatic camera angles (dutch angles, low angles, bird\'s eye)\n• Use cinematic lighting (rim light, backlighting, volumetric light)\n• Add depth of field and atmospheric perspective\n• Create movie-like compositions' 
    : ''}`
  : ''}

🔲 PANEL LAYOUT - ${config.layout}:
${LAYOUT_PROMPTS[config.layout] || config.layout}

💡 LAYOUT: "${config.layout}" - Layout variety between pages is encouraged
${['Dynamic Freestyle', 'Asymmetric Mixed', 'Action Sequence', 'Z-Pattern Flow', 'Climax Focus'].includes(config.layout) ? `⚠️ COMPLEX LAYOUT: Verify spelling in EVERY panel - text accuracy is #1 priority even with ${config.layout.includes('Freestyle') || config.layout.includes('Asymmetric') ? '5-8' : config.layout.includes('Action') ? '5-7' : config.layout.includes('Z-Pattern') ? '5-6' : config.layout.includes('Climax') ? '5-6' : 'multiple'} panels\n` : ''}

${continuityInstructions}

${dialogueInstructions}

📐 COMPOSITION:
${config.layout === 'Single Panel' || config.layout === 'Dramatic Spread' || config.layout === 'Widescreen Cinematic'
  ? 'Full-page illustration - no panel divisions'
  : config.layout === 'Dynamic Freestyle' || config.layout === 'Asymmetric Mixed'
    ? '5-8 panels with varied sizes - clear black borders'
    : config.layout.includes('Action Sequence')
      ? '5-7 dynamic action panels - clear black borders'
      : config.layout.includes('Conversation')
        ? '4-6 horizontal panels stacked vertically'
        : config.layout === 'Z-Pattern Flow'
          ? '5-6 panels in Z-pattern - clear black borders'
          : config.layout === 'Vertical Strip'
            ? '3-5 wide horizontal panels stacked vertically'
            : config.layout === 'Climax Focus'
              ? '1 dominant panel (40-50%) + 4-5 supporting panels'
              : `${config.layout.includes('Double') ? 'TWO' : config.layout.includes('Triple') ? 'THREE' : 'FOUR'} panels with clear black borders`}

${(() => {
  const hasMultiplePanels = !['Single Panel', 'Dramatic Spread', 'Widescreen Cinematic'].includes(config.layout);
  if (hasMultiplePanels) {
    const isAutoContinue = config.autoContinueStory && sessionHistory && sessionHistory.length > 0;
    return `\n🎬 MULTI-PANEL STORY FLOW:
${isAutoContinue ? `• Panel 1: Continue from Page ${sessionHistory.length}'s LAST PANEL - show what happens IMMEDIATELY AFTER (VISUALLY DIFFERENT, not duplicate)\n` : '• Panel 1: Starts the scene\n'}
• Panels 2+: Each panel shows the NEXT moment chronologically
• Last Panel: Leads to next page
✓ Each panel = logical progression from previous
✓ Characters COMPLETE within ONE panel - NEVER split across borders
✓ Use varied camera angles for visual variety
`;
  }
  return '';
})()}

✓ All content must fit within one high-resolution page image
✓ Apply dynamic angles and perspectives for visual impact
✓ Use authentic manga visual language (speed lines, impact frames, dramatic close-ups, perspective shots)
${config.screentone !== 'None' ? `✓ Apply ${config.screentone.toLowerCase()} screentone for depth and atmosphere` : ''}
✓ Panel borders should be solid black lines (1-3px thick) for clear separation
${config.layout.includes('Freestyle') || config.layout.includes('Asymmetric') || config.layout.includes('Action') ? '✓ Be creative with panel shapes - use diagonal cuts, overlapping edges, or irregular forms' : ''}

⚠️ CRITICAL COMPOSITION RULE - CHARACTER INTEGRITY:
✓ EVERY character must be COMPLETELY drawn within a SINGLE panel - NEVER split characters across panels
✓ Panel borders must NEVER cut through any character's body, head, or limbs
✓ If a character appears in a panel, they must be FULLY visible and complete within that panel's boundaries
✓ Characters can appear in multiple panels, but each appearance must be a COMPLETE, FULL character
✓ Use different camera angles (close-up, medium, full body) to show the same character in different panels while keeping them complete

${sessionHistory && sessionHistory.length > 0 ? `\n⚠️ CONTINUITY: Characters must look IDENTICAL to previous pages. ${config.autoContinueStory ? `Panel 1 continues from Page ${sessionHistory.length}'s last panel - ADVANCE forward, don't repeat.` : ''}\n` : ''}
${['Dynamic Freestyle', 'Asymmetric Mixed', 'Action Sequence', 'Z-Pattern Flow', 'Climax Focus', 'Conversation Layout'].includes(config.layout) ? `\n⚠️ COMPLEX LAYOUT: Verify spelling in ALL panels before finalizing - text accuracy is #1 priority!\n` : ''}
${config.useColor ? `\n🌈 COLOR MODE: FULL COLOR required - all elements must have colors, NO grayscale\n` : `\n⚫ COLOR MODE: Black and white only - use screentones for shading\n`}
  `;

  try {
    // Prepare content parts with text and reference images
    const contentParts: any[] = [{ text: enhancedPrompt }];
    
    // Add previous manga pages as visual references (last 3 pages)
    if (sessionHistory && sessionHistory.length > 0) {
      const recentPages = sessionHistory.slice(-3); // Get last 3 pages
      
      for (const page of recentPages) {
        if (page.url) {
          const base64Data = page.url.includes('base64,') 
            ? page.url.split('base64,')[1] 
            : page.url;
          
          let mimeType = 'image/jpeg';
          if (page.url.includes('data:image/')) {
            const mimeMatch = page.url.match(/data:(image\/[^;]+)/);
            if (mimeMatch) {
              mimeType = mimeMatch[1];
            }
          }
          
          contentParts.push({
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          });
        }
      }
    }
    
    // Add uploaded reference images if provided
    if (config.referenceImages && config.referenceImages.length > 0) {
      for (const imageData of config.referenceImages) {
        // Extract base64 data (remove data:image/...;base64, prefix if present)
        const base64Data = imageData.includes('base64,') 
          ? imageData.split('base64,')[1] 
          : imageData;
        
        // Detect mime type from data URL or default to jpeg
        let mimeType = 'image/jpeg';
        if (imageData.includes('data:image/')) {
          const mimeMatch = imageData.match(/data:(image\/[^;]+)/);
          if (mimeMatch) {
            mimeType = mimeMatch[1];
          }
        }
        
        contentParts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        });
      }
    }

    // Retry logic for PROHIBITED_CONTENT - automatically modify prompt and retry
    let lastError: Error | null = null;
    let retryAttempt = 0;
    const maxRetries = 3;
    let response: any = null;
    let currentContentParts = contentParts;
    let currentActualPrompt = actualPrompt;
    
    while (retryAttempt <= maxRetries) {
      try {
        // If this is a retry, modify the prompt to be less explicit
        if (retryAttempt > 0) {
          console.warn(`🔄 Retry attempt ${retryAttempt}/${maxRetries}: Modifying prompt to be less explicit...`);
          const sanitizedEnhancedPrompt = sanitizeEnhancedPromptForRetry(enhancedPrompt, actualPrompt, retryAttempt);
          currentActualPrompt = sanitizePromptForRetry(actualPrompt, retryAttempt);
          
          // Update contentParts with sanitized prompt
          currentContentParts = [{ text: sanitizedEnhancedPrompt }, ...contentParts.slice(1)];
        }
        
        response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
            parts: currentContentParts
      },
      config: {
        systemInstruction: MANGA_SYSTEM_INSTRUCTION,
        imageConfig: {
          aspectRatio: config.aspectRatio as any
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT' as any,
                threshold: 'BLOCK_NONE' as any
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH' as any,
                threshold: 'BLOCK_NONE' as any
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT' as any,
                threshold: 'BLOCK_NONE' as any
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT' as any,
                threshold: 'BLOCK_NONE' as any
              }
            ] as any
      }
    });

    // Check for errors in response
    if (response.promptFeedback?.blockReason) {
          if (response.promptFeedback.blockReason === 'PROHIBITED_CONTENT' && retryAttempt < maxRetries) {
            console.warn(`⚠️ Attempt ${retryAttempt + 1} blocked: PROHIBITED_CONTENT (promptFeedback). Retrying with modified prompt...`);
            retryAttempt++;
            lastError = new Error(`Content blocked: ${response.promptFeedback.blockReason}. ${response.promptFeedback.blockReasonMessage || ''}`);
            // Wait a bit before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue; // Retry with modified prompt
          } else {
            // Either not PROHIBITED_CONTENT or max retries reached
            console.error("Prompt feedback:", response.promptFeedback);
            if (response.promptFeedback.blockReason === 'PROHIBITED_CONTENT') {
              console.warn("Content was blocked as PROHIBITED_CONTENT after all retry attempts.");
              console.warn("Note: Even with safety settings disabled, Gemini API may still block certain content types.");
              console.warn("Consider using alternative APIs or models that support adult content generation.");
            }
            throw new Error(`Content blocked: ${response.promptFeedback.blockReason}. ${response.promptFeedback.blockReasonMessage || ''}`);
          }
        }
    
    // Check if we have candidates
    if (!response.candidates || response.candidates.length === 0) {
      console.error("No candidates in response:", response);
      throw new Error("No candidates returned from Gemini API");
    }

    const candidate = response.candidates[0];
    
    // Check for PROHIBITED_CONTENT in finishReason
    if (candidate.finishReason === 'PROHIBITED_CONTENT' && retryAttempt < maxRetries) {
      console.warn(`⚠️ Attempt ${retryAttempt + 1} blocked: PROHIBITED_CONTENT (finishReason). Retrying with modified prompt...`);
      retryAttempt++;
      lastError = new Error(`Content blocked: PROHIBITED_CONTENT. ${candidate.finishMessage || 'The image violated Google\'s content policy.'}`);
      // Wait a bit before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      continue; // Retry with modified prompt
    }
    
    // Check for other finish reasons
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
      console.error("Finish reason:", candidate.finishReason);
      console.error("Finish message:", candidate.finishMessage);
      
      if (candidate.finishReason === 'IMAGE_SAFETY') {
        // IMAGE_SAFETY can also be retried
        if (retryAttempt < maxRetries) {
          console.warn(`⚠️ Attempt ${retryAttempt + 1} blocked: IMAGE_SAFETY. Retrying with modified prompt...`);
          retryAttempt++;
          lastError = new Error(`Image blocked by safety filter (IMAGE_SAFETY): ${candidate.finishMessage || 'The image violated Google\'s content policy.'}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        } else {
          console.error("Image was blocked by IMAGE_SAFETY filter");
          console.warn("The generated image violated Google's Generative AI Prohibited Use policy");
          console.warn("This can happen even with safety settings disabled due to Google's content policy");
          console.warn("Suggestions:");
          console.warn("1. Try rephrasing the prompt to be less explicit");
          console.warn("2. Use more artistic/abstract descriptions");
          console.warn("3. Consider using alternative APIs that support adult content");
          throw new Error(`Image blocked by safety filter (IMAGE_SAFETY): ${candidate.finishMessage || 'The image violated Google\'s content policy. Try rephrasing the prompt or using alternative APIs.'}`);
        }
      }
      
      // For other finish reasons, throw error
      throw new Error(`Generation stopped: ${candidate.finishReason}. ${candidate.finishMessage || ''}`);
    }
        
    // Success - break out of retry loop
    console.log(`✅ Generation successful${retryAttempt > 0 ? ` after ${retryAttempt} retry attempt(s)` : ''}`);
    break;
      } catch (error: any) {
        // If it's a PROHIBITED_CONTENT error and we haven't reached max retries, retry
        if (error.message?.includes('PROHIBITED_CONTENT') && retryAttempt < maxRetries) {
          console.warn(`⚠️ Attempt ${retryAttempt + 1} failed: PROHIBITED_CONTENT. Retrying with modified prompt...`);
          retryAttempt++;
          lastError = error;
          // Wait a bit before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        // Otherwise, throw the error
        throw error;
      }
    }
    
    // If we exhausted retries, throw the last error
    if (lastError && !response) {
      throw lastError;
    }
    
    if (!response) {
      throw new Error("Failed to generate content after all retry attempts");
    }

    // Check if we have candidates (should already be checked in retry loop, but double-check)
    if (!response.candidates || response.candidates.length === 0) {
      console.error("No candidates in response:", response);
      throw new Error("No candidates returned from Gemini API");
    }

    const candidate = response.candidates[0];
    
    // Final check for finish reason (should be STOP at this point after retries)
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
      // If we get here, it means we've exhausted retries but still have an error
      console.error("Finish reason:", candidate.finishReason);
      console.error("Finish message:", candidate.finishMessage);
      
      if (candidate.finishReason === 'PROHIBITED_CONTENT' || candidate.finishReason === 'IMAGE_SAFETY') {
        console.warn("Content was blocked after all retry attempts.");
        console.warn("Note: Even with safety settings disabled, Gemini API may still block certain content types.");
        console.warn("Consider using alternative APIs or models that support adult content generation.");
      }
      
      throw new Error(`Generation stopped: ${candidate.finishReason}. ${candidate.finishMessage || ''}`);
    }

    // Check for content
    if (!candidate.content || !candidate.content.parts) {
      console.error("No content parts in candidate:", candidate);
      throw new Error("No content parts in response");
    }

    // Look for image data in parts
    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }

    // If no image found, log the response structure for debugging
    console.error("Response structure:", JSON.stringify({
      candidates: response.candidates?.length,
      firstCandidate: {
        finishReason: candidate.finishReason,
        contentParts: candidate.content?.parts?.length,
        parts: candidate.content?.parts?.map((p: any) => Object.keys(p))
      }
    }, null, 2));

    throw new Error("No image data returned from Gemini - check console for details");
  } catch (error) {
    console.error("Error generating manga image:", error);
    throw error;
  }
};
