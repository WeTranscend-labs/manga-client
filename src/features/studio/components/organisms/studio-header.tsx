import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconButton } from '@/components/ui/icon-button';
import { Logo } from '@/components/ui/logo';
import { PreviewButton } from '@/components/ui/preview-button';
import { Route } from '@/constants';
import { useUser } from '@/hooks/use-auth';
import { authStore } from '@/stores/auth.store';
import { useProjectsStore } from '@/stores/projects.store';
import { useStudioUIStore } from '@/stores/studio-ui.store';
import { useUIStore } from '@/stores/ui.store';
import { formatUrl } from '@/utils/api-formatter';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';

export const StudioHeader = () => {
  const router = useRouter();
  const { logout: privyLogout } = usePrivy();
  const { data: profile } = useUser();

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

  const handleLogout = async () => {
    try {
      // Clear local store
      authStore.clear();
      authStore.setError(null);

      // Call Privy logout to clear wallet sessions
      await privyLogout();

      toast.success('Signed out successfully');
      router.push(Route.HOME); // Redirect to Home/Landing instead of Login for better UX
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback redirect
      router.push(Route.HOME);
    }
  };

  const planName = profile?.plan?.toLowerCase() || 'free';
  const isPremium = planName === 'pro' || planName === 'ultra';
  const displayPlanName =
    planName.charAt(0).toUpperCase() + planName.slice(1) + ' Plan';

  return (
    <header className="h-14 sm:h-16 border-b border-zinc-800/50 bg-zinc-950/95 backdrop-blur-md flex items-center justify-between px-3 sm:px-4 lg:px-8 shrink-0 shadow-lg shadow-black/20 sticky top-0 z-30">
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 min-w-0 flex-1">
        <Link
          href={Route.HOME}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
        >
          <Logo size="sm" />
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

        {/* Plan usage moved to dropdown */}

        {/* Profile / Sign Out Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative outline-none focus:outline-none ml-1 rounded-full group">
              {isPremium && (
                <div className="absolute -inset-[3px] rounded-full bg-[conic-gradient(from_0deg,#4285F4,#EA4335,#FBBC05,#34A853,#4285F4)] animate-[spin_4s_linear_infinite]" />
              )}
              <Avatar
                className={`relative z-10 h-8 w-8 sm:h-9 sm:w-9 cursor-pointer border-2 transition-all shadow-lg ${
                  isPremium
                    ? 'border-zinc-950'
                    : 'border-zinc-800 hover:border-amber-500 hover:shadow-amber-500/20'
                }`}
              >
                <AvatarImage
                  src={profile?.avatar}
                  alt={profile?.displayName || profile?.username}
                  className="bg-zinc-950"
                />
                <AvatarFallback className="bg-zinc-800 text-amber-500 text-sm font-bold">
                  {profile
                    ? (profile.displayName || profile.username || 'U')
                        .substring(0, 2)
                        .toUpperCase()
                    : 'U'}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-zinc-950 border-zinc-800 text-zinc-200 font-mono rounded-xl p-0 overflow-hidden"
          >
            <div className="flex flex-col p-1">
              <div
                className="px-2 py-2 flex items-center gap-2 cursor-pointer hover:bg-zinc-800/50 rounded-md transition-colors mx-1 mt-1"
                onClick={() => router.push(formatUrl(Route.PROFILE))}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage
                    src={profile?.avatar}
                    alt={profile?.displayName || profile?.username}
                  />
                  <AvatarFallback className="bg-zinc-800 text-zinc-300 font-medium text-xs">
                    {profile
                      ? (profile.displayName || profile.username || 'U')
                          .substring(0, 2)
                          .toUpperCase()
                      : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <p className="text-sm font-medium text-zinc-200 truncate leading-tight">
                    {profile?.displayName || profile?.username || 'User'}
                  </p>
                  {profile?.username && (
                    <p className="text-xs text-zinc-500 truncate mt-0.5">
                      @{profile.username}
                    </p>
                  )}
                </div>
              </div>

              <DropdownMenuSeparator className="bg-zinc-800/80 my-1 mx-1" />

              <DropdownMenuItem
                className="cursor-pointer flex items-center justify-between px-2 py-1.5 mx-1 text-sm outline-none focus:bg-zinc-800 focus:text-zinc-100 rounded-sm text-zinc-300 transition-colors"
                onClick={() => router.push(formatUrl(Route.PRICING))}
              >
                <div className="flex items-center gap-2">
                  <Icons.CreditCard className="w-4 h-4 text-zinc-400" />
                  <span>{displayPlanName}</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-medium bg-zinc-800/50 px-1.5 py-0.5 rounded">
                  Upgrade
                </span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer flex items-center gap-2 px-2 py-1.5 mx-1 text-sm outline-none focus:bg-zinc-800 focus:text-zinc-100 rounded-sm text-zinc-300 transition-colors"
                onClick={handleLogout}
              >
                <Icons.LogOut className="w-4 h-4 text-zinc-400" />
                <span>Log out</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
