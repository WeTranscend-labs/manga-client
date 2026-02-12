export const TEXT_GENERATION_MODEL = 'gemini-2.0-flash-exp';
export const IMAGE_GENERATION_MODEL = 'imagen-3.0-generate-002';

export const STYLE_GUIDES: Record<string, string> = {
  'Classic Manga':
    'Classic 90s manga style, clean line art, traditional screentones, expressive character features.',
  'Modern Webtoon':
    'Contemporary webtoon style, vibrant digital coloring, sleek lines, cinematic lighting.',
  'Gritty Seinen':
    'Detailed, high-contrast Seinen style, heavy ink work, realistic proportions, atmospheric shading.',
  'Cute Shojo':
    'Soft, decorative Shojo style, focus on emotions, sparkling eyes, floral backgrounds, delicate lines.',
  'Cyberpunk Sci-Fi':
    'Futuristic manga style, neon accents, high-tech details, dark mechanical textures, sharp angles.',
  'Horror Manga':
    'Eerie, Junji Ito inspired style, unsettling details, heavy use of cross-hatching, distorted features.',
};

export const INKING_GUIDES: Record<string, string> = {
  'G-Pen': 'Sharp, dynamic line weight, classic manga feel, bold strokes.',
  'Maru-Pen': 'Fine, delicate lines, intricate details, consistent thin width.',
  'Fude Brush':
    'Ornate strokes, variable thickness, traditional calligraphy feel.',
  'Technical Fineliner': 'Clean, uniform lines, modern digital look, precise.',
};
