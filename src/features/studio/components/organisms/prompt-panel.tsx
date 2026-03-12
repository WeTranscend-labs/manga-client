'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { GenerationProgress } from '@/components/ui/generation-progress';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { MangaConfig, MangaSession, UserProfile } from '@/types';
import { useDebouncedCallback } from '@/utils/react-utils';
import { useState } from 'react';

import { StudioTextArea } from '../atoms/studio-text-area';
import { StudioSectionHeader } from '../molecules/studio-section-header';

interface PromptPanelProps {
  prompt: string;
  profile: UserProfile | null;
  currentSession: MangaSession | null;
  loading: boolean;
  error: string | null;
  batchLoading: boolean;
  batchProgress: { current: number; total: number } | null;
  generationProgress?: number;
  retryCount?: number;
  config: MangaConfig;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  onBatchGenerate: (count: number) => void;
  onCancelBatch: () => void;
}

export function PromptPanel({
  prompt,
  profile,
  currentSession,
  loading,
  error,
  batchLoading,
  batchProgress,
  generationProgress = 0,
  retryCount = 0,
  config,
  onPromptChange,
  onGenerate,
  onBatchGenerate,
  onCancelBatch,
}: PromptPanelProps) {
  // Local state for immediate responsiveness
  // Key reset in parent handles initial sync/resets on session switch.
  const [localPrompt, setLocalPrompt] = useState(prompt);

  const debouncedOnPromptChange = useDebouncedCallback((val: string) => {
    onPromptChange(val);
  }, 500);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalPrompt(val);
    debouncedOnPromptChange(val);
  };

  const handleManualSyncAndGenerate = () => {
    if (localPrompt !== prompt) {
      onPromptChange(localPrompt);
    }
    onGenerate();
  };

  const handleManualSyncAndBatch = (count: number) => {
    if (localPrompt !== prompt) {
      onPromptChange(localPrompt);
    }
    onBatchGenerate(count);
  };

  const showBatchMenu = currentSession && currentSession.pages.length === 0;

  return (
    <div className="flex-1 min-h-0 flex flex-col p-4 pt-3 bg-zinc-950/20">
      <StudioSectionHeader step={3} label="Describe your page" />

      <div className="flex-1 min-h-0 flex flex-col space-y-4">
        <div className="flex-1 min-h-0 relative">
          <StudioTextArea
            value={localPrompt}
            onChange={handlePromptChange}
            placeholder="What's happening in this page? Describe the characters, action, and setting..."
          />
        </div>

        {/* Generate Button Section */}
        <div className="shrink-0 space-y-3">
          {batchLoading && batchProgress ? (
            <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest italic">
                <span className="text-amber-500">Batch Processing</span>
                <span className="text-amber-500/50">
                  {batchProgress.current} / {batchProgress.total}
                </span>
              </div>
              <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-500 ease-out"
                  style={{
                    width: `${(batchProgress.current / batchProgress.total) * 100}%`,
                  }}
                />
              </div>
              <button
                onClick={onCancelBatch}
                className="w-full py-1 text-[9px] font-bold text-zinc-500 hover:text-red-400 uppercase tracking-widest transition-colors"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Cancel Batch
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                disabled={loading}
                onClick={handleManualSyncAndGenerate}
                variant="primary-3d"
                className="flex-1 h-12"
              >
                <div className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Icons.Loader2 className="w-4 h-4 animate-spin" />
                      <span className="uppercase tracking-widest text-xs">
                        Generating...
                      </span>
                    </>
                  ) : (
                    <>
                      <Icons.Sparkles className="w-4 h-4" />
                      <span className="uppercase tracking-widest text-xs font-black italic">
                        GENERATE PAGE
                      </span>
                    </>
                  )}
                </div>
              </Button>

              {showBatchMenu && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      disabled={loading}
                      variant="secondary"
                      className="w-12 h-12 p-0 flex items-center justify-center border-zinc-800"
                    >
                      <Icons.Layers className="w-5 h-5 text-zinc-500" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="top"
                    align="end"
                    className="w-56 p-2 bg-zinc-900 border-zinc-800 shadow-2xl rounded-xl"
                  >
                    <div className="px-2 py-1.5 mb-2 border-b border-zinc-800">
                      <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        Batch Generation
                      </h4>
                    </div>
                    {[5, 10, 15, 20].map((count) => (
                      <button
                        key={count}
                        onClick={() => handleManualSyncAndBatch(count)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
                        style={{ fontFamily: 'var(--font-inter)' }}
                      >
                        <span className="font-medium">
                          Generate {count} Pages
                        </span>
                        <Icons.ChevronRight size={12} className="opacity-50" />
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
              )}
            </div>
          )}
        </div>

        {/* Progress Display */}
        {loading && generationProgress > 0 && (
          <GenerationProgress
            progress={generationProgress}
            retryCount={retryCount}
            className="pb-2"
          />
        )}

        {/* Error Display */}
        {error && (
          <div
            className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-[11px] text-red-400 leading-relaxed"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            <div className="flex items-center gap-2 mb-1 font-bold uppercase tracking-wider">
              <Icons.AlertTriangle size={14} />
              <span>Generation Error</span>
            </div>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default PromptPanel;
