import { geminiService } from '@/services/gemini.service';
import {
  GeneratedManga,
  MangaConfig,
  MangaProject,
  MangaSession,
} from '@/types';
import { extractErrorMessage } from '@/utils/error-handler';
import { cleanUserPrompt } from '@/utils/prompt-utils';
import { generateId } from '@/utils/react-utils';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseStudioGenerationProps {
  prompt: string;
  context: string;
  config: MangaConfig;
  project: MangaProject;
  setProject: React.Dispatch<React.SetStateAction<MangaProject>>;
  currentSession: MangaSession | null;
  setCurrentSession: React.Dispatch<React.SetStateAction<MangaSession | null>>;
  setCurrentImage: (url: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRetryCount: React.Dispatch<React.SetStateAction<number>>;
  retryCount: number;
}

export function useStudioGeneration({
  prompt,
  context,
  config,
  project,
  setProject,
  currentSession,
  setCurrentSession,
  setCurrentImage,
  setLoading,
  setError,
  setRetryCount,
  retryCount,
}: UseStudioGenerationProps) {
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const batchCancelledRef = useRef(false);
  const batchGeneratingRef = useRef(false);
  const generatingRef = useRef(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
    };
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!currentSession || generatingRef.current) return;
    generatingRef.current = true;
    setLoading(true);
    setError(null);
    setCurrentImage(null);

    const finalPrompt = cleanUserPrompt(prompt);
    const userMessage = {
      id: generateId(),
      role: 'user' as const,
      content: prompt,
      timestamp: Date.now(),
      config: { ...config, context: context || config.context },
    };

    const sessionWithUserMessage = {
      ...currentSession,
      chatHistory: [...(currentSession.chatHistory || []), userMessage],
      updatedAt: Date.now(),
    };

    setCurrentSession(sessionWithUserMessage);
    setProject((prev) => ({
      ...prev,
      sessions: (prev.sessions || []).map((s) =>
        s.id === currentSession.id ? sessionWithUserMessage : s,
      ),
    }));

    const startProgress = () => {
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
      setGenerationProgress(0);
      let currentProgress = 0;
      progressIntervalRef.current = setInterval(() => {
        if (currentProgress < 90) {
          currentProgress = Math.min(
            90,
            currentProgress + (Math.random() * 8 + 2),
          );
          setGenerationProgress(currentProgress);
        } else if (currentProgress < 95) {
          currentProgress = Math.min(95, currentProgress + 0.5);
          setGenerationProgress(currentProgress);
        } else if (currentProgress < 99) {
          currentProgress = Math.min(99, currentProgress + 0.2);
          setGenerationProgress(currentProgress);
        }
      }, 200);
    };

    startProgress();

    try {
      const imageUrl = await geminiService.generateMangaImage(
        finalPrompt,
        { ...config, context: context || config.context },
        currentSession.pages || [],
        currentSession.selectedReferencePageIds || [],
      );

      setGenerationProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setCurrentImage(imageUrl);

      const assistantMessage = {
        id: generateId(),
        role: 'assistant' as const,
        content: 'Generated manga page',
        imageUrl: imageUrl,
        timestamp: Date.now(),
        config: { ...config, context: context || config.context },
      };

      const finalSession = {
        ...sessionWithUserMessage,
        chatHistory: [...sessionWithUserMessage.chatHistory, assistantMessage],
        updatedAt: Date.now(),
      };
      setCurrentSession(finalSession);
      setProject((prev) => ({
        ...prev,
        sessions: (prev.sessions || []).map((s) =>
          s.id === currentSession.id ? finalSession : s,
        ),
      }));
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
      generatingRef.current = false;
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
    }
  }, [
    currentSession,
    prompt,
    context,
    config,
    setProject,
    setCurrentSession,
    setCurrentImage,
    setLoading,
    setError,
  ]);

  const handleBatchGenerate = useCallback(
    async (totalPages: number = 10) => {
      if (!currentSession || batchGeneratingRef.current) return;
      batchGeneratingRef.current = true;
      batchCancelledRef.current = false;
      setBatchLoading(true);
      setBatchProgress({ current: 0, total: totalPages });
      setError(null);

      const sessionId = currentSession.id;
      let localSession = {
        ...currentSession,
        pages: [...(currentSession.pages || [])],
      };
      let currentPrompt = prompt;

      for (let i = 0; i < totalPages; i++) {
        if (batchCancelledRef.current) break;

        try {
          const configWithContext = {
            ...config,
            context: context || config.context,
            autoContinueStory: false,
          };
          const sessionHistory = localSession.pages || [];

          if (i > 0) {
            const actualPageNumber = sessionHistory.length + 1;
            setBatchProgress({ current: i, total: totalPages });
            currentPrompt = await geminiService.generateNextPrompt(
              sessionHistory,
              context || config.context || '',
              prompt,
              actualPageNumber,
              totalPages,
              configWithContext,
            );
          }

          let imageUrl = await geminiService.generateMangaImage(
            currentPrompt,
            configWithContext,
            sessionHistory,
            currentSession.selectedReferencePageIds,
          );

          const newPage: GeneratedManga = {
            id: generateId(),
            url: imageUrl,
            prompt: currentPrompt,
            timestamp: Date.now(),
            config: configWithContext,
            markedForExport: true,
          };

          localSession = {
            ...localSession,
            pages: [...localSession.pages, newPage],
            updatedAt: Date.now(),
          };
          setCurrentSession((prev) =>
            prev?.id === sessionId ? localSession : prev,
          );
        } catch (err) {
          console.error(`Batch page ${i + 1} error:`, err);
          if (i === 0) throw err;
          break;
        }
      }

      setBatchLoading(false);
      setBatchProgress(null);
      batchGeneratingRef.current = false;
    },
    [currentSession, prompt, context, config, setCurrentSession, setError],
  );

  const cancelBatchGenerate = useCallback(() => {
    batchCancelledRef.current = true;
    setBatchLoading(false);
    setBatchProgress(null);
    batchGeneratingRef.current = false;
  }, []);

  return {
    batchLoading,
    batchProgress,
    generationProgress,
    handleGenerate,
    handleBatchGenerate,
    cancelBatchGenerate,
  };
}
