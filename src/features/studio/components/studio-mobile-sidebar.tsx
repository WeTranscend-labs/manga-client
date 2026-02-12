import { useProjectsStore } from '@/stores/projects.store';
import { useStudioUIStore } from '@/stores/studio-ui.store';
import { X } from 'lucide-react';
import { useMemo } from 'react';
import SessionSidebar from './session-sidebar';

export const StudioMobileSidebar = () => {
  const {
    currentProject,
    currentSession,
    switchSession,
    createSession,
    toggleMarkForExport,
    toggleReferencePage,
    movePage,
    deleteSession,
    deletePage,
    deletePages,
    updateSessionConfig,
  } = useProjectsStore();

  const { showMobileSidebar, setStudioState, setDeleteConfirmation } =
    useStudioUIStore();

  const pagesToShow = useMemo(
    () => (currentSession ? currentSession.pages : currentProject?.pages || []),
    [currentSession, currentProject?.pages],
  );

  if (!showMobileSidebar || !currentProject) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        onClick={() => setStudioState({ showMobileSidebar: false })}
      />
      <div className="fixed left-0 top-16 bottom-0 w-[85vw] max-w-sm bg-zinc-900 border-r border-zinc-800 z-50 lg:hidden flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/95 backdrop-blur-sm">
          <h2 className="text-lg font-bold text-zinc-200 uppercase tracking-wider">
            Sessions
          </h2>
          <button
            onClick={() => setStudioState({ showMobileSidebar: false })}
            className="p-2 rounded-lg hover:bg-zinc-800 active:scale-95 transition-transform"
          >
            <X size={20} className="text-zinc-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <SessionSidebar
            project={currentProject}
            currentSession={currentSession}
            pagesToShow={pagesToShow}
            config={
              currentSession?.config || currentProject.pages[0]?.config || {}
            }
            onSwitchSession={(id) => {
              switchSession(id);
              setStudioState({ showMobileSidebar: false });
            }}
            onDeleteSession={(id) =>
              setDeleteConfirmation({ open: true, type: 'session', id })
            }
            onCreateSession={(name) => {
              createSession(name);
              setStudioState({ showMobileSidebar: false });
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
            leftWidth={320}
          />
        </div>
      </div>
    </>
  );
};
