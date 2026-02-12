'use client';

import StorySettingsPanel from '@/components/story-settings-panel';
import { useStudioGeneration } from '@/features/studio/hooks/useStudioGeneration';
import { useProjectsStore } from '@/stores/projects.store';
import { useStudioUIStore } from '@/stores/studio-ui.store';
import { X } from 'lucide-react';
import { useState } from 'react';
import PromptPanel from './prompt-panel';

export const StudioMobileSheet = () => {
  const {
    currentProject,
    currentSession,
    setCurrentSession,
    setLoading,
    setError,
    updateSessionContext,
    updateSessionConfig,
  } = useProjectsStore();

  const { showMobileSettings, activeMobileTab, prompt, setStudioState } =
    useStudioUIStore();

  const [retryCount, setRetryCount] = useState(0);

  const {
    batchLoading,
    batchProgress,
    generationProgress,
    handleGenerate,
    handleBatchGenerate,
    cancelBatchGenerate,
  } = useStudioGeneration({
    prompt,
    context: currentSession?.context || '',
    config: currentSession?.config || currentProject?.pages[0]?.config || {},
    project: currentProject!,
    setProject: () => {},
    currentSession,
    setCurrentSession,
    setCurrentImage: (url) => setStudioState({ currentImage: url }), // Need support in store
    setLoading,
    setError,
    setRetryCount,
    retryCount,
  });

  if (!showMobileSettings || !currentProject) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        onClick={() => setStudioState({ showMobileSettings: false })}
      />
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-50 lg:hidden flex flex-col shadow-2xl rounded-t-3xl max-h-[85vh] animate-in slide-in-from-bottom duration-300">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-zinc-700 rounded-full" />
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/50 px-4">
          <button
            onClick={() => setStudioState({ activeMobileTab: 'prompt' })}
            className={`flex-1 px-4 py-4 text-sm font-bold transition-all relative ${
              activeMobileTab === 'prompt' ? 'text-amber-400' : 'text-zinc-400'
            }`}
          >
            Generate
            {activeMobileTab === 'prompt' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setStudioState({ activeMobileTab: 'settings' })}
            className={`flex-1 px-4 py-4 text-sm font-bold transition-all relative ${
              activeMobileTab === 'settings'
                ? 'text-amber-400'
                : 'text-zinc-400'
            }`}
          >
            Settings
            {activeMobileTab === 'settings' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setStudioState({ showMobileSettings: false })}
            className="p-3 text-zinc-400 hover:text-zinc-200 active:scale-95 transition-transform"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeMobileTab === 'prompt' ? (
            <div className="p-4 pb-8">
              <PromptPanel
                prompt={prompt}
                currentSession={currentSession}
                loading={false}
                error={null}
                batchLoading={batchLoading}
                batchProgress={batchProgress}
                generationProgress={generationProgress}
                retryCount={retryCount}
                config={currentSession?.config || {}}
                onPromptChange={(p) => setStudioState({ prompt: p })}
                onGenerate={() => {
                  handleGenerate();
                  setStudioState({ showMobileSettings: false });
                }}
                onBatchGenerate={(count) => {
                  handleBatchGenerate(count);
                  setStudioState({ showMobileSettings: false });
                }}
                onCancelBatch={cancelBatchGenerate}
              />
            </div>
          ) : (
            <div className="p-4 pb-8">
              <StorySettingsPanel
                context={currentSession?.context || ''}
                config={currentSession?.config || {}}
                onContextChange={updateSessionContext}
                onConfigChange={updateSessionConfig}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
