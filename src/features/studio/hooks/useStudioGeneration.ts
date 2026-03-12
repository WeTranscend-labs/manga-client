import { generateService } from '@/services/generate.service';
import { MangaConfig, MangaProject, MangaSession } from '@/types';
import { extractErrorMessage } from '@/utils/error-handler';
import { cleanUserPrompt } from '@/utils/prompt-utils';
import { generateId } from '@/utils/react-utils';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseStudioGenerationProps {
  prompt: string;
  context: string;
  config: MangaConfig;
  project: MangaProject;
  setProject: (project: MangaProject) => void;
  currentSession: MangaSession | null;
  setCurrentSession: (session: MangaSession | null) => void;
  setCurrentImage: (url: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRetryCount?: (fn: (prev: number) => number) => void;
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

    if (project) {
      setProject({
        ...project,
        sessions: (project.sessions || []).map((s) =>
          s.id === currentSession.id ? sessionWithUserMessage : s,
        ),
      });
    }

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
      const response: any = await generateService.generateSingle({
        prompt: finalPrompt,
        config: { ...config, context: context || config.context },
        sessionHistory: currentSession.pages || [],
      });

      if (!response) {
        throw new Error('No data returned from generation');
      }

      const { page: generatedPage, imageUrl } = response;

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

      const finalSession: MangaSession = {
        ...sessionWithUserMessage,
        chatHistory: [...sessionWithUserMessage.chatHistory, assistantMessage],
        pages: [...(currentSession.pages || []), generatedPage],
        updatedAt: Date.now(),
      };

      setCurrentSession(finalSession);

      if (project) {
        setProject({
          ...project,
          sessions: (project.sessions || []).map((s) =>
            s.id === currentSession.id ? finalSession : s,
          ),
        });
      }
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
    project,
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

      try {
        const sessionId = currentSession.id;
        let localSession = {
          ...currentSession,
          pages: [...(currentSession.pages || [])],
        };

        for (let i = 0; i < totalPages; i++) {
          if (batchCancelledRef.current) break;

          try {
            const configWithContext = {
              ...config,
              context: context || config.context,
              autoContinueStory: false,
            };
            const sessionHistory = localSession.pages || [];
            const pagePrompt = i === 0 ? prompt : '';

            if (i > 0) {
              setBatchProgress({ current: i, total: totalPages });
            }

            const response: any = await generateService.generateSingle({
              prompt: pagePrompt,
              config: configWithContext,
              sessionHistory: sessionHistory,
              isAutoContinue: i > 0 || !prompt?.trim(),
            });

            if (!response || !response.page) {
              throw new Error('No page returned from generation');
            }

            const newPage = response.page;
            newPage.markedForExport = true;

            localSession = {
              ...localSession,
              pages: [...localSession.pages, newPage],
              updatedAt: Date.now(),
            };

            setCurrentSession(localSession);

            if (project) {
              setProject({
                ...project,
                sessions: (project.sessions || []).map((s) =>
                  s.id === sessionId ? localSession : s,
                ),
              });
            }
          } catch (err) {
            console.error(`Batch page ${i + 1} error:`, err);
            if (i === 0) throw err;
            break;
          }
        }
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setBatchLoading(false);
        setBatchProgress(null);
        batchGeneratingRef.current = false;
      }
    },
    [
      currentSession,
      project,
      prompt,
      context,
      config,
      setCurrentSession,
      setProject,
      setError,
    ],
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
