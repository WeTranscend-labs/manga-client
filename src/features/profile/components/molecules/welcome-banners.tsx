'use client';

import { Sparkles, X } from 'lucide-react';

interface WelcomeBannersProps {
  showWelcomeBanner: boolean;
  setShowWelcomeBanner: (val: boolean) => void;
  isProfileIncomplete: boolean | null;
}

export function WelcomeBanners({
  showWelcomeBanner,
  setShowWelcomeBanner,
  isProfileIncomplete,
}: WelcomeBannersProps) {
  return (
    <>
      {/* Welcome Banner */}
      {showWelcomeBanner && (
        <div className="bg-linear-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 relative">
          <div className="bg-amber-500/20 rounded-full p-2 shrink-0">
            <Sparkles className="h-5 w-5 text-amber-400" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-semibold text-amber-300">
              Welcome to Manga Studio!
            </h3>
            <p className="text-xs text-zinc-300">
              Please complete your profile information for the best experience.
              You can add a display name, bio, and avatar.
            </p>
          </div>
          <button
            onClick={() => setShowWelcomeBanner(false)}
            className="text-zinc-400 hover:text-zinc-200 transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Incomplete Profile Banner */}
      {isProfileIncomplete && !showWelcomeBanner && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 flex items-start gap-3">
          <div className="bg-blue-500/20 rounded-full p-2 shrink-0">
            <Sparkles className="h-5 w-5 text-blue-400" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-semibold text-blue-300">
              Complete your profile
            </h3>
            <p className="text-xs text-zinc-300">
              Add more details so the community can get to know you.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
