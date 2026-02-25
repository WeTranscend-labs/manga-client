import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { PreviewButton } from '@/components/ui/preview-button';
import { Route } from '@/constants';
import { authStore } from '@/stores/auth.store';
import { useProjectsStore } from '@/stores/projects.store';
import { useStudioUIStore } from '@/stores/studio-ui.store';
import { useUIStore } from '@/stores/ui.store';
import { formatUrl } from '@/utils/api-formatter';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';

export const StudioHeader = () => {
  const router = useRouter();

  // Stores
  const currentProject = useProjectsStore((state) => state.currentProject);
  const currentSession = useProjectsStore((state) => state.currentSession);
  const isMobile = useUIStore((state) => state.isMobile);

  const { toggleChat, toggleSettings, setStudioState } = useStudioUIStore(
    useShallow((state) => ({
      toggleChat: state.toggleChat,
      toggleSettings: state.toggleSettings,
      setStudioState: state.setStudioState,
    })),
  );

  const exportCount = currentSession
    ? currentSession.pages.filter((p) => p.markedForExport).length
    : (currentProject?.pages || []).filter((p) => p.markedForExport).length;

  const handleLogout = () => {
    authStore.clear();
    authStore.setError(null);
    toast.success('Signed out successfully');
    router.push(Route.LOGIN);
  };

  return (
    <header className="h-14 sm:h-16 border-b border-zinc-800/50 bg-zinc-950/95 backdrop-blur-md flex items-center justify-between px-3 sm:px-4 lg:px-8 shrink-0 shadow-lg shadow-black/20 sticky top-0 z-30">
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 min-w-0 flex-1">
        <Link
          href={Route.HOME}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
        >
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 overflow-hidden rounded-lg border border-zinc-800/50 bg-white/5 flex items-center justify-center ring-1 ring-zinc-700/30">
            <Image
              src="/logo.png"
              alt="Manga Studio logo"
              fill
              className="object-contain p-1"
              sizes="(max-width: 640px) 32px, 40px"
            />
          </div>
          <h1 className="text-sm sm:text-base lg:text-xl font-manga text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)] hidden sm:block">
            MANGA STUDIO
          </h1>
        </Link>
        {currentSession && (
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-zinc-900/60 rounded-lg border border-zinc-800/60 backdrop-blur-sm shadow-sm ring-1 ring-zinc-700/20 shrink-0 min-w-0">
            <Icons.Layers
              size={12}
              className="sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0"
            />
            <span
              className="text-[10px] sm:text-xs font-semibold text-zinc-200 truncate"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              {currentSession.name}
            </span>
            <span className="text-[9px] sm:text-[10px] text-zinc-500 font-medium shrink-0">
              ({currentSession.pages.length})
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0">
        {/* Tablet-only: Sessions drawer trigger (shown md to lg) */}
        <IconButton
          onClick={() => setStudioState({ showTabletSidebar: true })}
          title="Sessions"
          className="hidden md:flex lg:hidden"
        >
          <Icons.Layers size={20} />
        </IconButton>

        <IconButton
          onClick={toggleChat}
          title="Chat History"
          className="relative hidden md:flex"
        >
          <Icons.MessageSquare size={18} className="sm:w-5 sm:h-5" />
          {currentSession &&
            currentSession.chatHistory &&
            currentSession.chatHistory.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-linear-to-br from-amber-400 to-amber-600 rounded-full text-[9px] flex items-center justify-center text-black font-bold shadow-lg shadow-amber-500/30 ring-2 ring-zinc-900">
                {currentSession.chatHistory.length}
              </span>
            )}
        </IconButton>

        {/* Settings (desktop only) */}
        {!isMobile && (
          <IconButton onClick={toggleSettings} title="Settings">
            <Icons.Settings size={20} />
          </IconButton>
        )}

        <div className="h-6 sm:h-8 w-px bg-zinc-800/50 mx-1 sm:mx-2" />

        {/* Preview — hidden on mobile (lives in bottom nav) */}
        <PreviewButton
          onClick={() => router.push(Route.STUDIO_PREVIEW)}
          count={exportCount}
          icon={
            <Icons.Eye size={12} className="sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
          }
          className="hidden md:flex"
        />

        {/* Download PDF (desktop only) */}
        <Button
          variant="secondary"
          size="sm"
          className="hidden sm:flex gap-1.5 text-xs lg:text-sm"
          style={{ fontFamily: 'var(--font-inter)' }}
          onClick={() =>
            router.push(formatUrl(Route.STUDIO_PREVIEW, { autoDownload: 1 }))
          }
        >
          <Icons.Download size={14} className="lg:w-4 lg:h-4" />
          <span>Download PDF</span>
        </Button>

        {/* Sign Out */}
        <IconButton
          onClick={handleLogout}
          title="Sign Out"
          className="hover:text-red-400"
        >
          <Icons.LogOut size={18} className="sm:w-5 sm:h-5" />
        </IconButton>
      </div>
    </header>
  );
};
