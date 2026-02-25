'use client';

import { useProjectsStore } from '@/stores/projects.store';
import { useStudioUIStore } from '@/stores/studio-ui.store';
import { useUIStore } from '@/stores/ui.store';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import SessionSidebar from './session-sidebar';

export const StudioLeftSidebar = () => {
  // Global State
  const currentProject = useProjectsStore((state) => state.currentProject);
  const currentSession = useProjectsStore((state) => state.currentSession);
  const createSession = useProjectsStore((state) => state.createSession);
  const switchSession = useProjectsStore((state) => state.switchSession);
  const updateSessionConfig = useProjectsStore(
    (state) => state.updateSessionConfig,
  );
  const movePage = useProjectsStore((state) => state.movePage);
  const toggleMarkForExport = useProjectsStore(
    (state) => state.toggleMarkForExport,
  );
  const toggleReferencePage = useProjectsStore(
    (state) => state.toggleReferencePage,
  );

  const isMobile = useUIStore((state) => state.isMobile);
  const { setStudioState, setDeleteConfirmation } = useStudioUIStore(
    useShallow((state) => ({
      setStudioState: state.setStudioState,
      setDeleteConfirmation: state.setDeleteConfirmation,
    })),
  );

  // Computed
  const pagesToShow = useMemo(
    () => (currentSession ? currentSession.pages : currentProject?.pages || []),
    [currentSession, currentProject?.pages],
  );

  return (
    <aside className="h-full w-full bg-zinc-900 border-r border-zinc-800 flex flex-col">
      {!currentProject ? (
        <div className="flex-1 flex flex-col p-4 space-y-4">
          <div className="h-8 bg-zinc-800/50 rounded animate-pulse w-3/4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-zinc-800/30 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      ) : (
        <SessionSidebar
          project={currentProject}
          currentSession={currentSession}
          pagesToShow={pagesToShow}
          config={
            currentSession?.config || currentProject.pages[0]?.config || {}
          }
          onSwitchSession={switchSession}
          onDeleteSession={(id) =>
            setDeleteConfirmation({ open: true, type: 'session', id })
          }
          onCreateSession={(name) => createSession(name)}
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
    </aside>
  );
};
