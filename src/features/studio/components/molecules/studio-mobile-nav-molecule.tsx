'use client';

import { Button } from '@/components/ui/button';
import { Route } from '@/constants';
import { useProjectsStore } from '@/stores/projects.store';
import { useStudioUIStore } from '@/stores/studio-ui.store';
import { Eye, LayoutGrid } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';

export const StudioMobileNav = () => {
  const router = useRouter();
  const currentSession = useProjectsStore((state) => state.currentSession);
  const project = useProjectsStore((state) => state.currentProject);

  const { showMobileSettings, setStudioState } = useStudioUIStore(
    useShallow((state) => ({
      showMobileSettings: state.showMobileSettings,
      setStudioState: state.setStudioState,
    })),
  );

  const exportCount = currentSession
    ? currentSession.pages.filter((p) => p.markedForExport).length
    : (project?.pages || []).filter((p) => p.markedForExport).length;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/50 z-50 md:hidden safe-area-inset-bottom">
      <div className="flex items-stretch gap-3 h-16 px-4">
        {/* Single entry point → unified sheet */}
        <Button
          variant="ghost"
          onClick={() =>
            setStudioState({ showMobileSettings: !showMobileSettings })
          }
          className={`flex-1 flex items-center justify-center gap-2 h-10 self-center rounded-xl font-semibold text-sm transition-all border ${
            showMobileSettings
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-zinc-800/50 border-zinc-700/30 text-zinc-300 hover:bg-zinc-700/50 hover:text-white'
          }`}
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          <LayoutGrid
            size={16}
            className={showMobileSettings ? 'text-amber-400' : ''}
          />
          Menu
        </Button>

        {/* Preview CTA */}
        <Button
          onClick={() => router.push(Route.STUDIO_PREVIEW)}
          className="flex-1 flex items-center justify-center gap-2 h-10 self-center rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-black transition-all shadow-lg shadow-amber-500/25 relative"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          <Eye size={16} />
          Preview
          {exportCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold shadow ring-2 ring-zinc-950">
              {exportCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};
