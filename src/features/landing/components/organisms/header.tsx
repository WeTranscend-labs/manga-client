'use client';
import { Icons } from '@/components/icons';
import { AnimatedShinyButton } from '@/components/ui/animated-shiny-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Logo } from '@/components/ui/logo';
import { Route } from '@/constants';
import { useLogout, useUser } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth.store';
import { formatUrl } from '@/utils/api-formatter';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: profile } = useUser();
  const { mutate: logout } = useLogout();

  const handleSignOut = () => {
    logout();
  };

  const getInitials = (username: string) => {
    return username?.substring(0, 2).toUpperCase() || 'U';
  };

  const planName = profile?.plan?.toLowerCase() || 'free';
  const isPremium = planName === 'pro' || planName === 'ultra';
  const displayPlanName =
    planName.charAt(0).toUpperCase() + planName.slice(1) + ' Plan';

  return (
    <header className="h-16 flex items-center justify-between container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-8">
        <Link href={Route.HOME} className="flex items-center gap-2">
          <Logo size="md" showText={false} />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link
            href="#gallery"
            className="text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            Gallery
          </Link>
          <Link
            href="#pricing"
            className="text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
          <Link
            href={Route.COMMUNITY}
            className="text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            Community
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            {/* Plan pill moved to dropdown */}

            <AnimatedShinyButton
              url={Route.STUDIO}
              className="hidden sm:inline-flex text-xs h-9 px-4 [--shiny-cta-highlight:#f59e0b] [--shiny-cta-highlight-subtle:#d97706]"
            >
              <span
                style={{ fontFamily: 'var(--font-inter)', fontWeight: 600 }}
              >
                Studio
              </span>
            </AnimatedShinyButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative outline-none focus:outline-none ml-1 rounded-full group">
                  {isPremium && (
                    <div className="absolute -inset-[3px] rounded-full bg-[conic-gradient(from_0deg,#4285F4,#EA4335,#FBBC05,#34A853,#4285F4)] animate-[spin_4s_linear_infinite]" />
                  )}
                  <Avatar
                    className={`relative z-10 h-9 w-9 cursor-pointer border-2 transition-all shadow-lg ${
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
                        ? getInitials(profile.displayName || profile.username)
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
                          ? getInitials(profile.displayName || profile.username)
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
                    onClick={handleSignOut}
                  >
                    <Icons.LogOut className="w-4 h-4 text-zinc-400" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex text-zinc-400 hover:text-white hover:bg-zinc-800 h-9"
            >
              <Link href={Route.LOGIN}>Sign In</Link>
            </Button>

            <Link href={Route.LOGIN} className="sm:hidden">
              <Avatar className="h-9 w-9 cursor-pointer border border-zinc-700 hover:border-amber-400 transition-colors">
                <AvatarFallback className="bg-zinc-800 text-amber-400 text-sm font-semibold">
                  <Icons.User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Link>

            <AnimatedShinyButton
              url={Route.REGISTER}
              className="text-sm h-9 px-5"
            >
              <span
                style={{ fontFamily: 'var(--font-inter)', fontWeight: 600 }}
              >
                Get Started
              </span>
            </AnimatedShinyButton>
          </div>
        )}
      </div>
    </header>
  );
}
