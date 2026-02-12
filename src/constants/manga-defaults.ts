import {
  AspectRatio,
  DialogueDensity,
  InkingStyle,
  Language,
  MangaConfig,
  MangaStyle,
  PanelBorderStyle,
  PanelLayout,
  ScreentoneDensity,
} from '@/types';

export const DEFAULT_MANGA_CONFIG: MangaConfig = {
  style: MangaStyle.SHONEN,
  inking: InkingStyle.GPEN,
  screentone: ScreentoneDensity.MEDIUM,
  layout: PanelLayout.SINGLE,
  aspectRatio: AspectRatio.PORTRAIT,
  useColor: false,
  dialogueDensity: DialogueDensity.MEDIUM,
  language: Language.ENGLISH,
  panelBorderStyle: PanelBorderStyle.FULL_BORDER,
  context: '',
  referenceImages: [],
  autoContinueStory: false,
  storyDirection: '',
};
