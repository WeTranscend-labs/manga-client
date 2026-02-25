'use client';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
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
import { StudioDialogs } from '../modals/studio-dialogs';
import { StudioMobileNav } from '../molecules/studio-mobile-nav-molecule';
import { StudioMobileSheet } from '../molecules/studio-mobile-sheet-molecule';
import CanvasArea from '../organisms/canvas-area';
import ChatHistoryPanel from '../organisms/chat-history-panel';
import { StudioControls } from '../organisms/studio-controls-organism';
import { StudioLeftSidebar } from '../organisms/studio-left-sidebar';
import { StudioTabletSidebarDrawer } from '../organisms/studio-tablet-sidebar-drawer';

import { useProjectsStore } from '@/stores/projects.store';
import { useStudioUIStore } from '@/stores/studio-ui.store';
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
  const loadProject = useProjectsStore((state) => state.loadProject);
  const switchSession = useProjectsStore((state) => state.switchSession);
  const createSession = useProjectsStore((state) => state.createSession);

  const { prompt, showChat, setStudioState } = useStudioUIStore(
    useShallow((state) => ({
      prompt: state.prompt,
      showChat: state.showChat,
      setStudioState: state.setStudioState,
    })),
  );

  // Local state for retry count and loading which hooks might use
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

  // Initialize project on mount
  useEffect(() => {
    if (!project) {
      loadProject('default').catch(console.error);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select session once project is loaded
  useEffect(() => {
    if (!project) return;
    if (currentSession) return; // already have one
    const sessions = project.sessions ?? [];
    if (sessions.length > 0) {
      // Pick most-recently-updated session
      const latest = sessions.reduce((a, b) =>
        (b.updatedAt ?? 0) > (a.updatedAt ?? 0) ? b : a,
      );
      switchSession(latest.id);
    } else {
      // No sessions yet — create a default one
      createSession('Session 1').catch(console.error);
    }
  }, [project?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Layout Effects
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const canvasArea = (
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
  );

  return (
    <>
      <div className="flex h-full w-full overflow-hidden bg-zinc-950">
        {/* ── MOBILE layout (< md / 768px): canvas fills screen, bottom-nav overlays ── */}
        <div className="flex md:hidden w-full h-full pb-16">{canvasArea}</div>

        {/* ── TABLET layout (md to lg / 768–1023px): fixed controls + canvas ── */}
        <div className="hidden md:flex lg:hidden w-full h-full">
          {/* Controls panel — fixed width */}
          <div className="w-[360px] shrink-0 h-full">
            <StudioControls />
          </div>
          {/* Canvas takes remaining space */}
          <div className="flex-1 min-w-0 h-full">{canvasArea}</div>
        </div>

        {/* ── DESKTOP layout (≥ lg / 1024px): 3-panel resizable ── */}
        <div className="hidden lg:flex h-full w-full">
          <ResizablePanelGroup
            direction="horizontal"
            autoSaveId="studio-main-layout"
          >
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <StudioLeftSidebar />
            </ResizablePanel>

            <ResizableHandle
              withHandle
              className="w-1.5 bg-zinc-800/30 hover:bg-amber-500/50 transition-all duration-200 relative group"
            />

            <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
              <StudioControls />
            </ResizablePanel>

            <ResizableHandle
              withHandle
              className="w-1.5 bg-zinc-800/30 hover:bg-amber-500/50 transition-all duration-200 relative group"
            />

            <ResizablePanel defaultSize={45}>{canvasArea}</ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      {/* Chat History Overlay */}
      {showChat && currentSession && (
        <ChatHistoryPanel
          currentSession={currentSession}
          onClose={() => setStudioState({ showChat: false })}
        />
      )}

      {/* Mobile Components (< md) — unified bottom sheet handles Sessions/Generate/Settings */}
      <StudioMobileSheet />
      <StudioMobileNav />

      {/* Tablet Components (md to lg) */}
      <StudioTabletSidebarDrawer />

      {/* Shared Dialogs */}
      <StudioDialogs />
    </>
  );
};
