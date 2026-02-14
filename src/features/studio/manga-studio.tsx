'use client';
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
import CanvasArea from './components/canvas-area';
import ChatHistoryPanel from './components/chat-history-panel';
import { StudioControls } from './components/studio-controls';
import { StudioDialogs } from './components/studio-dialogs';
import { StudioHeader } from './components/studio-header';
import { StudioLeftSidebar } from './components/studio-left-sidebar';
import { StudioMobileNav } from './components/studio-mobile-nav';
import { StudioMobileSheet } from './components/studio-mobile-sheet';
import { StudioMobileSidebar } from './components/studio-mobile-sidebar';

import { useProjectsStore } from '@/stores/projects.store';
import { useStudioUIStore } from '@/stores/studio-ui.store';
import { useUIStore } from '@/stores/ui.store';
import { generateId } from '@/utils/react-utils';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';

export const DEFAULT_CONFIG: MangaConfig = {
  style: MangaStyle.SHONEN,
  inking: InkingStyle.GPEN,
  screentone: ScreentoneDensity.MEDIUM,
  layout: PanelLayout.DYNAMIC_FREESTYLE,
  aspectRatio: AspectRatio.PORTRAIT,
  useColor: false,
  dialogueDensity: DialogueDensity.MEDIUM,
  language: Language.ENGLISH,
  panelBorderStyle: PanelBorderStyle.FULL_BORDER,
};

export const MangaStudio = () => {
  // Global State
  const project = useProjectsStore((state) => state.currentProject);
  const currentSession = useProjectsStore((state) => state.currentSession);
  const addPage = useProjectsStore((state) => state.addPage);

  const isMobile = useUIStore((state) => state.isMobile);
  const { prompt, showChat, setStudioState } = useStudioUIStore(
    useShallow((state) => ({
      prompt: state.prompt,
      showChat: state.showChat,
      setStudioState: state.setStudioState,
    })),
  );

  // Local state for retry count and loading which hooks might use
  // Ideally these go to stores too, but for generation hook we pass setters
  const [retryCount, setRetryCount] = useState(0);

  // CurrentImage is used for CanvasArea.
  const { currentImage, generationProgress, generationLoading } =
    useStudioUIStore(
      useShallow((state) => ({
        currentImage: state.currentImage,
        generationProgress: state.generationProgress,
        generationLoading: state.generationLoading,
      })),
    );

  // We also need `addToProject` logic for CanvasArea.
  const addToProject = async () => {
    if (!currentImage || !project) return;
    const newPage = {
      id: generateId(),
      url: currentImage,
      prompt: prompt || 'Generated Image',
      timestamp: Date.now(),
      markedForExport: true,
      config: currentSession?.config || DEFAULT_CONFIG,
    };
    try {
      await addPage(newPage);
      toast.success('Image added to project');
      setStudioState({ currentImage: null });
    } catch (e) {
      toast.error('Failed to add image');
    }
  };

  // Layout Effects
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      <StudioHeader />

      <div className="flex-1 flex overflow-hidden">
        <StudioLeftSidebar />
        <StudioControls />

        {/* Right Section - Canvas */}
        <CanvasArea
          loading={generationLoading}
          generationProgress={generationProgress}
          retryCount={retryCount}
          currentImage={currentImage}
          onShowFullscreen={() =>
            setStudioState({
              fullscreenPreview: {
                open: true,
                image: currentImage,
                isFromCanvas: true,
              },
            })
          }
          onAddToProject={addToProject}
          onDiscardImage={() => setStudioState({ currentImage: null })}
        />

        {/* Chat History Overlay */}
        {showChat && currentSession && (
          <ChatHistoryPanel
            currentSession={currentSession}
            onClose={() => setStudioState({ showChat: false })}
          />
        )}

        {/* Mobile Components */}
        <StudioMobileSidebar />
        <StudioMobileSheet />
      </div>

      <style>{`
        /* Styles from original file */
        @keyframes shimmer { to { transform: translateX(200%); } }
        .animate-shimmer { animation: shimmer 2s infinite; }
        @keyframes gradient { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .animate-gradient { animation: gradient 3s ease infinite; }
        @keyframes slide-in-from-bottom { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slide-in-from-left { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-in { animation-fill-mode: both; }
        .slide-in-from-bottom { animation: slide-in-from-bottom 0.3s ease-out; }
        .slide-in-from-left { animation: slide-in-from-left 0.3s ease-out; }
        .touch-manipulation { touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #52525b; }
        @media (max-width: 640px) { .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; } }
      `}</style>

      <StudioDialogs />
      <StudioMobileNav />
    </div>
  );
};
