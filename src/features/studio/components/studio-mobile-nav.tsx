'use client';
import { ROUTES } from '@/constants/routes';
import { useProjectsStore } from '@/stores/projects.store';
import { useStudioUIStore } from '@/stores/studio-ui.store';
import { Eye, Layers, Settings, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const StudioMobileNav = () => {
  const router = useRouter();
  const { currentSession, currentProject: project } = useProjectsStore();
  const {
    showMobileSidebar,
    showMobileSettings,
    activeMobileTab, // Need to make sure this is in store
    setStudioState,
    toggleMobileSidebar,
  } = useStudioUIStore();

  const exportCount = currentSession
    ? currentSession.pages.filter((p) => p.markedForExport).length
    : (project?.pages || []).filter((p) => p.markedForExport).length;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/50 z-50 lg:hidden safe-area-inset-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Sessions Tab */}
        <button
          onClick={() => {
            toggleMobileSidebar();
            setStudioState({
              showMobileSettings: false,
              activeMobileTab: 'sessions',
            });
          }}
          className={`flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-xl transition-all relative ${
            showMobileSidebar
              ? 'bg-zinc-800/60 text-amber-400'
              : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-300'
          }`}
        >
          <Layers
            size={20}
            className={
              showMobileSidebar
                ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                : ''
            }
          />
          <span
            className="text-[10px] font-medium"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Sessions
          </span>
        </button>

        {/* Prompt Tab */}
        <button
          onClick={() => {
            setStudioState({
              showMobileSettings: true,
              showMobileSidebar: false,
              activeMobileTab: 'prompt',
            });
          }}
          className={`flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-xl transition-all relative ${
            showMobileSettings && activeMobileTab === 'prompt'
              ? 'bg-zinc-800/60 text-amber-400'
              : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-300'
          }`}
        >
          <Sparkles
            size={20}
            className={
              showMobileSettings && activeMobileTab === 'prompt'
                ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                : ''
            }
          />
          <span
            className="text-[10px] font-medium"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Generate
          </span>
        </button>

        {/* Settings Tab */}
        <button
          onClick={() => {
            setStudioState({
              showMobileSettings: true,
              showMobileSidebar: false,
              activeMobileTab: 'settings',
            });
          }}
          className={`flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-xl transition-all relative ${
            showMobileSettings && activeMobileTab === 'settings'
              ? 'bg-zinc-800/60 text-amber-400'
              : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-300'
          }`}
        >
          <Settings
            size={20}
            className={
              showMobileSettings && activeMobileTab === 'settings'
                ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                : ''
            }
          />
          <span
            className="text-[10px] font-medium"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Settings
          </span>
        </button>

        {/* Preview Button */}
        <button
          onClick={() => router.push(ROUTES.STUDIO.PREVIEW)}
          className="flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-xl transition-all text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-300 relative"
        >
          <Eye size={20} />
          <span
            className="text-[10px] font-medium"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Preview
          </span>
          {exportCount > 0 && (
            <span className="absolute top-0 right-2 w-4 h-4 bg-linear-to-br from-amber-400 to-amber-600 rounded-full text-[8px] flex items-center justify-center text-black font-bold shadow-lg shadow-amber-500/30 ring-2 ring-zinc-900">
              {exportCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
