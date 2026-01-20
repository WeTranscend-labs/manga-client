'use client'

import { Sparkles, Zap, X, Wand2 } from 'lucide-react';
import { MangaSession, MangaConfig } from '@/lib/types';

interface PromptPanelProps {
    prompt: string;
    currentSession: MangaSession | null;
    loading: boolean;
    error: string | null;
    batchLoading: boolean;
    batchProgress: { current: number; total: number } | null;
    config: MangaConfig;
    onPromptChange: (value: string) => void;
    onGenerate: () => void;
    onBatchGenerate: () => void;
    onCancelBatch: () => void;
}

export default function PromptPanel({
    prompt,
    currentSession,
    loading,
    error,
    batchLoading,
    batchProgress,
    config,
    onPromptChange,
    onGenerate,
    onBatchGenerate,
    onCancelBatch,
}: PromptPanelProps) {
    const hasPages = currentSession && currentSession.pages.length > 0;
    const isAutoContinue = config.autoContinueStory && hasPages;
    
    return (
        <div className="h-1/2 bg-zinc-900 p-4 flex flex-col">
            <div className="flex-1 flex flex-col gap-3">
                {/* Step 3 Header */}
                <div className="flex items-center gap-3 pb-2">
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-black font-bold text-sm flex items-center justify-center shrink-0">
                        3
                    </div>
                    <div className="flex-1">
                        <label className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: 'var(--font-inter)' }}>
                            <span>Write Your Prompt</span>
                            {currentSession && currentSession.pages.length > 0 && (
                                <span className="text-[9px] text-green-500 font-normal normal-case">(Page {currentSession.pages.length + 1})</span>
                            )}
                            {isAutoContinue && (
                                <span className="text-[9px] text-emerald-400 font-normal normal-case flex items-center gap-1">
                                    <Wand2 size={10} />
                                    Auto-Continue ON
                                </span>
                            )}
                        </label>
                    </div>
                </div>

                {/* Auto-Continue Info */}
                {isAutoContinue && (
                    <div className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded p-2 leading-relaxed flex items-start gap-2">
                        <Wand2 size={12} className="mt-0.5 flex-shrink-0" />
                        <span>
                            <strong>Auto-Continue Mode:</strong> AI sẽ tự động tiếp tục câu chuyện từ page {currentSession?.pages.length}. 
                            Prompt của bạn sẽ được dùng làm gợi ý cho hướng phát triển story.
                        </span>
                    </div>
                )}
                
                {/* Batch Mode Info */}
                {!batchLoading && (
                    <div className="text-[9px] text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded p-2 leading-relaxed flex items-start gap-2">
                        <Zap size={12} className="mt-0.5 flex-shrink-0" />
                        <div>
                            <div className="font-bold mb-1">BATCH x10 - AI Story Generator 🔥</div>
                            <div className="space-y-1 text-[8px] text-purple-300">
                                <div>• <strong>Page 1:</strong> Gen từ prompt của bạn</div>
                                <div>• <strong>Pages 2-10:</strong> Mỗi page có 2 bước:</div>
                                <div className="ml-3">1️⃣ AI tự tạo prompt mới dựa trên ảnh trước</div>
                                <div className="ml-3">2️⃣ Dùng prompt đó để gen ảnh tiếp theo</div>
                                <div>• <strong>Kết quả:</strong> 10 pages với story tự nhiên và liên tục!</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Prompt Textarea */}
                <textarea
                    value={prompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                    placeholder={isAutoContinue
                        ? "Gợi ý hướng phát triển story (optional)... VD: 'The hero discovers a secret', 'A battle begins', 'They meet a new character'..."
                        : hasPages
                            ? "Continue the story with the SAME characters from Context..."
                            : "Describe the scene: A hero standing on a rooftop, looking at the sunset..."}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-sm leading-relaxed text-zinc-300 placeholder:text-zinc-600 placeholder:text-xs focus:outline-none focus:border-amber-500 transition-colors resize-none custom-scrollbar"
                    style={{ fontFamily: 'var(--font-inter)' }}
                    disabled={batchLoading}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            onGenerate();
                        }
                    }}
                />

                {/* Batch Progress */}
                {batchLoading && batchProgress && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-purple-400 font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-inter)' }}>
                                <Zap size={14} className="animate-pulse" />
                                {batchProgress.current === 0 ? '🎬 CREATING PAGE 1...' : 
                                 batchProgress.current < batchProgress.total ? `🤖 CREATING PAGE ${batchProgress.current + 1}...` :
                                 '✅ COMPLETE!'}
                            </span>
                            <span className="text-zinc-400" style={{ fontFamily: 'var(--font-inter)' }}>
                                {batchProgress.current} / {batchProgress.total} pages
                            </span>
                        </div>
                        <div className="relative h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                            <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 transition-all duration-500 animate-gradient"
                                style={{
                                    width: `${(batchProgress.current / batchProgress.total) * 100}%`,
                                    backgroundSize: '200% 100%'
                                }}
                            />
                        </div>
                        {batchProgress.current >= 1 && batchProgress.current < batchProgress.total && (
                            <div className="text-[9px] text-purple-300 flex items-center gap-1 leading-relaxed">
                                <Wand2 size={10} className="animate-spin flex-shrink-0" />
                                <span>
                                    <strong>2-Step Process:</strong> ① AI tạo prompt mới từ page {batchProgress.current} 
                                    → ② Gen ảnh từ prompt đó
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Generate Buttons */}
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={onGenerate}
                        disabled={loading || batchLoading || (!prompt.trim() && !isAutoContinue)}
                        className="px-6 py-3 bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 disabled:from-zinc-800 disabled:to-zinc-900 disabled:text-zinc-600 text-black font-manga text-base rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_4px_0_0_rgb(180,83,9)] hover:shadow-[0_4px_0_0_rgb(180,83,9)] active:shadow-[0_1px_0_0_rgb(180,83,9)] disabled:shadow-none active:translate-y-1 disabled:translate-y-0"
                    >
                        {loading ? 'GEN...' : isAutoContinue ? '▶ CONTINUE' : 'GENERATE'}
                    </button>

                    {batchLoading ? (
                        <button
                            onClick={onCancelBatch}
                            className="px-6 py-3 bg-gradient-to-b from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_4px_0_0_rgb(153,27,27)] hover:shadow-[0_4px_0_0_rgb(153,27,27)] active:shadow-[0_1px_0_0_rgb(153,27,27)] active:translate-y-1"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            <X size={16} />
                            CANCEL
                        </button>
                    ) : (
                        <button
                            onClick={onBatchGenerate}
                            disabled={loading || batchLoading || (!prompt.trim() && !isAutoContinue)}
                            className="px-6 py-3 bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 disabled:from-zinc-800 disabled:to-zinc-900 disabled:text-zinc-600 text-white font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_4px_0_0_rgb(109,40,217)] hover:shadow-[0_4px_0_0_rgb(109,40,217)] active:shadow-[0_1px_0_0_rgb(109,40,217)] disabled:shadow-none active:translate-y-1 disabled:translate-y-0"
                            style={{ fontFamily: 'var(--font-inter)' }}
                            title={hasPages 
                                ? "Generate 10 pages: Page 1 from prompt, Pages 2-10 auto-continue story!" 
                                : "Generate 10 pages at once and auto-add to session"}
                        >
                            <Zap size={16} />
                            {hasPages ? 'BATCH x10 🔄' : 'BATCH x10'}
                        </button>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-2 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-[10px] text-center" style={{ fontFamily: 'var(--font-inter)' }}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}

