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
            {/* Credits Display */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-full">
              <Icons.Logo className="text-amber-500" size={14} />
              <span className="text-xs font-bold text-zinc-100">
                {profile?.credits || 0}
              </span>
              <button
                onClick={() => router.push(formatUrl(Route.PRICING))}
                className="ml-1 p-1 hover:bg-zinc-800 rounded-full text-amber-500 transition-colors"
                title="Mua Credits"
              >
                <Icons.Plus size={12} />
              </button>
            </div>

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
                <button className="outline-none focus:outline-none ml-1">
                  <Avatar className="h-9 w-9 cursor-pointer border-2 border-zinc-800 hover:border-amber-500 transition-all shadow-lg hover:shadow-amber-500/20">
                    <AvatarImage
                      src={profile?.avatar}
                      alt={profile?.displayName || profile?.username}
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
                className="w-56 bg-zinc-950 border-zinc-800 text-zinc-200"
              >
                <div className="px-2 py-1.5 bg-zinc-900/50">
                  <p className="text-sm font-medium text-white">
                    {profile?.displayName || profile?.username || 'User'}
                  </p>
                  {profile?.username && profile?.displayName && (
                    <p className="text-xs text-zinc-500 truncate font-mono mt-0.5">
                      @{profile.username}
                    </p>
                  )}
                </div>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem
                  className="cursor-pointer focus:bg-amber-500/10 focus:text-amber-500"
                  onClick={() => router.push(formatUrl(Route.PROFILE))}
                >
                  <Icons.User className="mr-2 h-4 w-4 text-zinc-400 " />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem
                  className="cursor-pointer text-amber-500 focus:text-amber-400 focus:bg-amber-500/10"
                  onClick={handleSignOut}
                >
                  <Icons.LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
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
