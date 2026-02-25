'use client';

import { Icons } from '@/components/icons';
import { GenerationProgress } from '@/components/ui/generation-progress';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { MangaConfig, MangaSession } from '@/types';
import { cleanUserPrompt } from '@/utils/prompt-utils';
import { useState } from 'react';

interface PromptPanelProps {
  prompt: string;
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

export default function PromptPanel({
  prompt,
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
  const [batchPopoverOpen, setBatchPopoverOpen] = useState(false);
  const hasPages = currentSession && currentSession.pages.length > 0;
  const isAutoContinue = config.autoContinueStory && hasPages;

  const handleBatchSelect = (count: number) => {
    setBatchPopoverOpen(false);
    // Small delay to ensure state updates are processed
    setTimeout(() => {
      onBatchGenerate(count);
    }, 100);
  };

  return (
    <div className="flex-1 h-full min-h-0 flex flex-col bg-transparent overflow-hidden">
      {/* 1. Scrollable Content Area: Header + Textarea + Progress */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 sm:p-5 flex flex-col gap-4">
        {/* Step 3 Header */}
        <div className="flex items-center gap-3 pb-1 shrink-0">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-amber-400 to-amber-600 text-black font-bold text-sm flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30 ring-2 ring-amber-500/20">
            3
          </div>
          <div className="flex-1">
            <label
              className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              <span>Write Your Prompt</span>
              {currentSession && currentSession.pages.length > 0 && (
                <span className="text-[9px] text-zinc-500 font-normal normal-case">
                  (Page {currentSession.pages.length + 1})
                </span>
              )}
              {isAutoContinue && (
                <span className="text-[9px] text-amber-400/80 font-normal normal-case flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <Icons.Wand2 size={10} />
                  Auto-Continue ON
                </span>
              )}
            </label>
          </div>
        </div>

        {/* Prompt Textarea Container */}
        <div className="flex-1 min-h-0 flex flex-col">
          <textarea
            value={prompt}
            onChange={(e) => {
              const value = e.target.value;
              if (
                value.length > 200 &&
                (value.includes('╔') ||
                  value.includes('⚠️') ||
                  value.includes('CRITICAL'))
              ) {
                const cleaned = cleanUserPrompt(value);
                onPromptChange(cleaned);
              } else {
                onPromptChange(value);
              }
            }}
            onPaste={(e) => {
              const pastedText = e.clipboardData.getData('text');
              if (
                pastedText.length > 200 &&
                (pastedText.includes('╔') ||
                  pastedText.includes('⚠️') ||
                  pastedText.includes('CRITICAL'))
              ) {
                e.preventDefault();
                const cleaned = cleanUserPrompt(pastedText);
                onPromptChange(cleaned);
              }
            }}
            placeholder={
              isAutoContinue
                ? "Gợi ý hướng phát triển story (optional)... VD: 'The hero discovers a secret', 'A battle begins', 'They meet a new character'..."
                : hasPages
                  ? 'Continue the story with the SAME characters from Context...'
                  : 'Describe the scene: A hero standing on a rooftop, looking at the sunset...'
            }
            className="w-full flex-1 h-full min-h-0 bg-zinc-950/60 border border-zinc-800/60 rounded-xl p-3 sm:p-4 text-sm sm:text-base leading-relaxed text-zinc-200 placeholder:text-zinc-600 placeholder:text-xs sm:placeholder:text-sm focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none custom-scrollbar backdrop-blur-sm shadow-inner"
            style={{ fontFamily: 'var(--font-inter)' }}
            disabled={batchLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                onGenerate();
              }
            }}
          />
        </div>

        {/* Progress Section */}
        {(loading || batchLoading) && (
          <div className="shrink-0 space-y-4">
            {/* Single Generation Progress */}
            {loading && !batchLoading && (
              <GenerationProgress
                progress={generationProgress}
                retryCount={retryCount}
                label="Generating image..."
              />
            )}

            {/* Batch Progress */}
            {batchLoading && batchProgress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span
                    className="text-zinc-300 font-bold flex items-center gap-2"
                    style={{ fontFamily: 'var(--font-inter)' }}
                  >
                    <Icons.Zap size={14} className="animate-pulse" />
                    {batchProgress.current === 0
                      ? 'CREATING PAGE 1...'
                      : batchProgress.current < batchProgress.total
                        ? `CREATING PAGE ${batchProgress.current + 1}...`
                        : 'COMPLETE!'}
                  </span>
                  <span
                    className="text-zinc-400"
                    style={{ fontFamily: 'var(--font-inter)' }}
                  >
                    {batchProgress.current} / {batchProgress.total} pages
                  </span>
                </div>
                <div className="relative h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className="absolute inset-y-0 left-0 bg-linear-to-r from-zinc-600 via-zinc-500 to-zinc-600 transition-all duration-500"
                    style={{
                      width: `${(batchProgress.current / batchProgress.total) * 100}%`,
                    }}
                  />
                </div>
                {batchProgress.current >= 1 &&
                  batchProgress.current < batchProgress.total && (
                    <div className="text-[9px] text-zinc-400 flex items-center gap-1 leading-relaxed">
                      <Icons.Wand2
                        size={10}
                        className="animate-spin shrink-0"
                      />
                      <span>
                        <strong>2-Step Process:</strong> ① AI tạo prompt mới từ
                        page {batchProgress.current}→ ② Gen ảnh từ prompt đó
                      </span>
                    </div>
                  )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Fixed Footer Area: Buttons + Error */}
      <div className="shrink-0 border-t border-zinc-800/50 bg-zinc-900/80 backdrop-blur-md p-4 sm:p-5 space-y-3">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <button
            onClick={onGenerate}
            disabled={
              loading || batchLoading || (!prompt.trim() && !isAutoContinue)
            }
            className="px-4 sm:px-6 py-3 sm:py-3.5 bg-linear-to-b from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 disabled:from-zinc-800 disabled:to-zinc-900 disabled:text-zinc-600 text-black font-manga text-sm sm:text-base rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_4px_0_0_rgb(180,83,9)] hover:shadow-[0_4px_0_0_rgb(180,83,9)] hover:scale-[1.02] active:shadow-[0_1px_0_0_rgb(180,83,9)] disabled:shadow-none active:translate-y-1 disabled:translate-y-0 disabled:cursor-not-allowed ring-2 ring-transparent hover:ring-amber-500/30 touch-manipulation min-h-[48px] sm:min-h-[52px]"
          >
            {loading ? 'GEN...' : isAutoContinue ? 'CONTINUE' : 'GENERATE'}
          </button>

          {batchLoading ? (
            <button
              onClick={onCancelBatch}
              className="px-4 sm:px-6 py-3 sm:py-3.5 bg-linear-to-b from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_4px_0_0_rgb(153,27,27)] hover:shadow-[0_4px_0_0_rgb(153,27,27)] hover:scale-[1.02] active:shadow-[0_1px_0_0_rgb(153,27,27)] active:translate-y-1 ring-2 ring-transparent hover:ring-red-500/30 touch-manipulation min-h-[48px] sm:min-h-[52px]"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              <Icons.X size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">CANCEL</span>
              <span className="sm:hidden">STOP</span>
            </button>
          ) : (
            <Popover open={batchPopoverOpen} onOpenChange={setBatchPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  disabled={
                    loading ||
                    batchLoading ||
                    (!prompt.trim() && !isAutoContinue)
                  }
                  className="px-4 sm:px-6 py-3 sm:py-3.5 bg-linear-to-b from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 disabled:from-zinc-800 disabled:to-zinc-900 disabled:text-zinc-600 text-black font-manga text-sm sm:text-base rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_4px_0_0_rgb(180,83,9)] hover:shadow-[0_4px_0_0_rgb(180,83,9)] hover:scale-[1.02] active:shadow-[0_1px_0_0_rgb(180,83,9)] disabled:shadow-none active:translate-y-1 disabled:translate-y-0 disabled:cursor-not-allowed ring-2 ring-transparent hover:ring-amber-500/30 touch-manipulation min-h-[48px] sm:min-h-[52px]"
                >
                  <Icons.Zap size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">MULTIPLE</span>
                  <span className="sm:hidden">BATCH</span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-48 bg-zinc-950/95 border-zinc-800/60 backdrop-blur-md p-2 shadow-xl"
                align="end"
              >
                <div className="space-y-1">
                  <button
                    onClick={() => handleBatchSelect(10)}
                    className="w-full px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800/60 hover:text-amber-400 rounded-lg transition-all text-left font-medium"
                    style={{ fontFamily: 'var(--font-inter)' }}
                  >
                    x10 Pages
                  </button>
                  <button
                    onClick={() => handleBatchSelect(15)}
                    className="w-full px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800/60 hover:text-amber-400 rounded-lg transition-all text-left font-medium"
                    style={{ fontFamily: 'var(--font-inter)' }}
                  >
                    x15 Pages
                  </button>
                  <button
                    onClick={() => handleBatchSelect(20)}
                    className="w-full px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800/60 hover:text-amber-400 rounded-lg transition-all text-left font-medium"
                    style={{ fontFamily: 'var(--font-inter)' }}
                  >
                    x20 Pages
                  </button>
                  <button
                    onClick={() => handleBatchSelect(30)}
                    className="w-full px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800/60 hover:text-amber-400 rounded-lg transition-all text-left font-medium"
                    style={{ fontFamily: 'var(--font-inter)' }}
                  >
                    x30 Pages
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="p-3 bg-red-900/20 border border-red-800/50 rounded-xl text-red-400 text-xs text-center backdrop-blur-sm shadow-lg shadow-red-900/10 shrink-0"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
