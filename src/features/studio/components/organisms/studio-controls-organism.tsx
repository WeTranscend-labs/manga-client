'use client';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useStudioGeneration } from '@/features/studio/hooks/useStudioGeneration';
import { useUser } from '@/hooks/use-auth';
import { useProjectsStore, useUIStore } from '@/stores';
import { useStudioUIStore } from '@/stores/studio-ui.store';
import { MangaConfig } from '@/types';
import { useCallback, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import PromptPanel from './prompt-panel';
import StorySettingsPanel from './story-settings-panel';

export const StudioControls = () => {
  // Global State
  const { currentProject: project, currentSession } = useProjectsStore(
    useShallow((state: any) => ({
      currentProject: state.currentProject,
      currentSession: state.currentSession,
    })),
  );

  const setProject = useProjectsStore((state: any) => state.setCurrentProject);
  const setCurrentSession = useProjectsStore(
    (state: any) => state.setCurrentSession,
  );

  const { prompt, setStudioState, generationLoading, generationProgress } =
    useStudioUIStore(
      useShallow((state: any) => ({
        prompt: state.prompt,
        setStudioState: state.setStudioState,
        generationLoading: state.generationLoading,
        generationProgress: state.generationProgress,
      })),
    );

  const { data: profile } = useUser();
  const isMobile = useUIStore((state: any) => state.isMobile);
  const [retryCount, setRetryCount] = useState(0);

  // Callbacks stabilized with useCallback
  const onContextChange = useCallback((context: string) => {
    const updateSessionContext =
      useProjectsStore.getState().updateSessionContext;
    updateSessionContext(context);
  }, []);

  const onConfigChange = useCallback((config: MangaConfig) => {
    const updateSessionConfig = useProjectsStore.getState().updateSessionConfig;
    updateSessionConfig(config);
  }, []);

  const {
    batchLoading,
    batchProgress,
    handleGenerate,
    handleBatchGenerate,
    cancelBatchGenerate,
  } = useStudioGeneration({
    prompt,
    context: currentSession?.context || '',
    config: (currentSession?.config ||
      project?.pages[0]?.config ||
      {}) as MangaConfig,
    project: project!,
    setProject,
    currentSession,
    setCurrentSession,
    setCurrentImage: (url: string | null) =>
      setStudioState({ currentImage: url }),
    setLoading: (loading) => setStudioState({ generationLoading: loading }),
    setError: (error) => setStudioState({ error }),
    setRetryCount,
    retryCount,
  });

  return (
    <aside className="border-r border-zinc-800/40 bg-zinc-900/40 backdrop-blur-xl flex flex-col h-full w-full shadow-2xl relative overflow-hidden">
      <ResizablePanelGroup
        direction="vertical"
        autoSaveId="studio-controls-layout-v7"
        className="flex-1 min-h-0 w-full"
      >
        {/* Section 1: Settings */}
        <ResizablePanel
          defaultSize={45}
          minSize={20}
          className="min-h-0 overflow-hidden"
        >
          <div className="h-full overflow-hidden flex flex-col">
            <StorySettingsPanel
              key={currentSession?.id || 'none'}
              context={currentSession?.context || ''}
              config={(currentSession?.config || {}) as MangaConfig}
              onContextChange={onContextChange}
              onConfigChange={onConfigChange}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle
          withHandle
          className="h-1.5 bg-zinc-800/20 hover:bg-amber-500/30 transition-all duration-300 relative group shrink-0"
        >
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-zinc-800 group-hover:bg-amber-500/40" />
        </ResizableHandle>

        {/* Section 2: Prompt */}
        <ResizablePanel
          defaultSize={55}
          minSize={25}
          className="min-h-0 overflow-hidden"
        >
          <div className="h-full overflow-hidden flex flex-col">
            <PromptPanel
              key={currentSession?.id || 'none'}
              prompt={prompt}
              profile={profile || null}
              currentSession={currentSession}
              loading={generationLoading}
              error={null} // Handle error state correctly if needed
              batchLoading={batchLoading}
              batchProgress={batchProgress}
              generationProgress={generationProgress}
              retryCount={retryCount}
              config={(currentSession?.config || {}) as MangaConfig}
              onPromptChange={(p: string) => setStudioState({ prompt: p })}
              onGenerate={handleGenerate}
              onBatchGenerate={handleBatchGenerate}
              onCancelBatch={cancelBatchGenerate}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </aside>
  );
};
