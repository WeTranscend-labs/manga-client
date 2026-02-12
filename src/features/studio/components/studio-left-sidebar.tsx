'use client';

import { useProjectsStore } from '@/stores/projects.store';
import { useStudioUIStore } from '@/stores/studio-ui.store';
import { useUIStore } from '@/stores/ui.store';
import { useEffect, useMemo, useState } from 'react';
import SessionSidebar from './session-sidebar';

export const StudioLeftSidebar = () => {
  // Global State
  const {
    currentProject,
    currentSession,
    createSession,
    switchSession,
    updateSessionContext,
    updateSessionConfig,
    deleteSession,
    deletePage,
    deletePages,
    movePage,
    toggleMarkForExport,
    toggleReferencePage,
  } = useProjectsStore();

  const { isMobile } = useUIStore();
  const { leftWidth, setStudioState, setDeleteConfirmation } =
    useStudioUIStore();

  const [isDragging, setIsDragging] = useState(false);

  // Computed
  const pagesToShow = useMemo(
    () => (currentSession ? currentSession.pages : currentProject?.pages || []),
    [currentSession, currentProject?.pages],
  );

  // Resize Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newWidth = Math.max(200, Math.min(600, e.clientX));
        setStudioState({ leftWidth: newWidth });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, setStudioState]);

  if (isMobile || !currentProject) return null;

  return (
    <>
      <SessionSidebar
        project={currentProject}
        currentSession={currentSession}
        pagesToShow={pagesToShow}
        config={currentSession?.config || currentProject.pages[0]?.config || {}}
        // Note: Config might need robust fallback if logic was different
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
            fullscreenPreview: { open: true, image: url, isFromCanvas: false },
          })
        }
        onConfigChange={updateSessionConfig}
        leftWidth={leftWidth}
      />

      {/* Resize Handle */}
      <div
        className="w-1 bg-zinc-800/30 hover:bg-amber-500/60 cursor-col-resize transition-all duration-200 relative group flex items-center justify-center"
        onMouseDown={() => setIsDragging(true)}
      >
        <div className="absolute inset-y-0 -inset-x-2" />
        <div className="absolute w-1 h-12 bg-zinc-700/50 rounded-full group-hover:bg-amber-400 transition-all duration-200 shadow-lg shadow-amber-500/20" />
      </div>
    </>
  );
};
