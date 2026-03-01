'use client';

import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { DEFAULT_MANGA_CONFIG } from '@/constants/manga-defaults';
import { useStudioGeneration } from '@/features/studio/hooks/useStudioGeneration';
import { useUser } from '@/hooks/use-auth';
import { useProjectsStore } from '@/stores/projects.store';
import { useStudioUIStore } from '@/stores/studio-ui.store';
import { MangaConfig } from '@/types';
import { Layers, MessageSquare, Settings, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import ChatHistoryPanel from '../organisms/chat-history-panel';
import PromptPanel from '../organisms/prompt-panel';
import SessionSidebar from '../organisms/session-sidebar';
import StorySettingsPanel from '../organisms/story-settings-panel';

export const StudioMobileSheet = () => {
  const { data: profile } = useUser();
  const currentProject = useProjectsStore((state) => state.currentProject);
  const currentSession = useProjectsStore((state) => state.currentSession);
  const setCurrentSession = useProjectsStore(
    (state) => state.setCurrentSession,
  );
  const switchSession = useProjectsStore((state) => state.switchSession);
  const createSession = useProjectsStore((state) => state.createSession);
  const setLoading = useProjectsStore((state) => state.setLoading);
  const setError = useProjectsStore((state) => state.setError);
  const updateSessionContext = useProjectsStore(
    (state) => state.updateSessionContext,
  );
  const updateSessionConfig = useProjectsStore(
    (state) => state.updateSessionConfig,
  );
  const toggleMarkForExport = useProjectsStore(
    (state) => state.toggleMarkForExport,
  );
  const toggleReferencePage = useProjectsStore(
    (state) => state.toggleReferencePage,
  );
  const movePage = useProjectsStore((state) => state.movePage);

  const {
    showMobileSettings,
    activeMobileTab,
    prompt,
    setStudioState,
    setDeleteConfirmation,
  } = useStudioUIStore(
    useShallow((state) => ({
      showMobileSettings: state.showMobileSettings,
      activeMobileTab: state.activeMobileTab,
      prompt: state.prompt,
      setStudioState: state.setStudioState,
      setDeleteConfirmation: state.setDeleteConfirmation,
    })),
  );

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
    config: (currentSession?.config ||
      currentProject?.pages[0]?.config ||
      DEFAULT_MANGA_CONFIG) as MangaConfig,
    project: currentProject!,
    setProject: () => {},
    currentSession,
    setCurrentSession,
    setCurrentImage: (url) => setStudioState({ currentImage: url }),
    setLoading,
    setError,
    setRetryCount,
    retryCount,
  });

  const pagesToShow = useMemo(
    () => (currentSession ? currentSession.pages : currentProject?.pages || []),
    [currentSession, currentProject?.pages],
  );

  const close = () => setStudioState({ showMobileSettings: false });

  if (!showMobileSettings || !currentProject) return null;

  const chatCount = currentSession?.chatHistory?.length ?? 0;

  const tabs = [
    {
      key: 'sessions',
      label: 'Sessions',
      Icon: Layers,
      badge: undefined as number | undefined,
    },
    {
      key: 'chat',
      label: 'Chat',
      Icon: MessageSquare,
      badge: chatCount > 0 ? chatCount : undefined,
    },
    {
      key: 'settings',
      label: 'Settings',
      Icon: Settings,
      badge: undefined as number | undefined,
    },
  ] as const;

  return (
    <>
      {/* Backdrop — above bottom nav (z-50) */}
      <div
        className="fixed inset-0 bg-black/60 z-60 md:hidden backdrop-blur-sm transition-opacity"
        onClick={close}
      />

      {/* Sheet — above backdrop */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-70 md:hidden flex flex-col shadow-2xl rounded-t-3xl max-h-[90vh] animate-in slide-in-from-bottom duration-300">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-12 h-1.5 bg-zinc-700 rounded-full" />
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/50 px-2 shrink-0">
          {tabs.map(({ key, label, Icon, badge }) => {
            const active = activeMobileTab === key;
            return (
              <Button
                key={key}
                variant="ghost"
                size="sm"
                onClick={() => setStudioState({ activeMobileTab: key })}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 h-auto text-xs font-bold transition-all relative rounded-none ${
                  active ? 'text-amber-400' : 'text-zinc-400'
                }`}
              >
                <span className="relative">
                  <Icon size={14} />
                  {badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2 w-3.5 h-3.5 bg-amber-400 rounded-full text-[8px] flex items-center justify-center text-black font-bold">
                      {badge}
                    </span>
                  )}
                </span>
                {label}
                {active && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
                )}
              </Button>
            );
          })}

          {/* Close */}
          <IconButton
            onClick={close}
            size="icon-sm"
            className="text-zinc-400 hover:text-zinc-200 ml-1 shrink-0"
          >
            <X size={18} />
          </IconButton>
        </div>

        {/* Content — each tab scrolls independently */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          {activeMobileTab === 'sessions' && (
            <SessionSidebar
              project={currentProject}
              currentSession={currentSession}
              pagesToShow={pagesToShow}
              config={
                currentSession?.config || currentProject.pages[0]?.config || {}
              }
              onSwitchSession={(id) => {
                switchSession(id);
                close();
              }}
              onDeleteSession={(id) =>
                setDeleteConfirmation({ open: true, type: 'session', id })
              }
              onCreateSession={(name) => {
                createSession(name);
                close();
              }}
              onToggleMarkForExport={toggleMarkForExport}
              onToggleReferencePage={toggleReferencePage}
              onMovePage={movePage}
              onDeletePage={(id) =>
                setDeleteConfirmation({ open: true, type: 'page', id })
              }
              onDeletePages={(ids) =>
                setDeleteConfirmation({ open: true, type: 'pages', ids })
              }
              onOpenFullscreen={(url) =>
                setStudioState({
                  fullscreenPreview: {
                    open: true,
                    image: url,
                    isFromCanvas: false,
                  },
                })
              }
              onConfigChange={updateSessionConfig}
            />
          )}

          {activeMobileTab === 'settings' && (
            <div className="p-4 pb-8 flex flex-col gap-6">
              <StorySettingsPanel
                context={currentSession?.context || ''}
                config={
                  (currentSession?.config ||
                    DEFAULT_MANGA_CONFIG) as MangaConfig
                }
                onContextChange={updateSessionContext}
                onConfigChange={updateSessionConfig}
              />
              {/* Step 3 — Write Your Prompt + Generate */}
              <PromptPanel
                prompt={prompt}
                profile={profile || null}
                currentSession={currentSession}
                loading={false}
                error={null}
                batchLoading={batchLoading}
                batchProgress={batchProgress}
                generationProgress={generationProgress}
                retryCount={retryCount}
                config={
                  (currentSession?.config ||
                    DEFAULT_MANGA_CONFIG) as MangaConfig
                }
                onPromptChange={(p) => setStudioState({ prompt: p })}
                onGenerate={() => {
                  handleGenerate();
                  close();
                }}
                onBatchGenerate={(count) => {
                  handleBatchGenerate(count);
                  close();
                }}
                onCancelBatch={cancelBatchGenerate}
              />
            </div>
          )}
          {activeMobileTab === 'chat' && (
            <div className="p-4 pb-8">
              {currentSession && chatCount > 0 ? (
                <ChatHistoryPanel
                  currentSession={currentSession}
                  onClose={close}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                  <MessageSquare size={36} className="mb-3 opacity-30" />
                  <p
                    className="text-sm"
                    style={{ fontFamily: 'var(--font-inter)' }}
                  >
                    No chat history yet
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
