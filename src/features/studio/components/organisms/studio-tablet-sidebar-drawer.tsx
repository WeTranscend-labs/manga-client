'use client';

import { IconButton } from '@/components/ui/icon-button';
import { useStudioUIStore } from '@/stores/studio-ui.store';
import { X } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { StudioLeftSidebar } from './studio-left-sidebar';

export const StudioTabletSidebarDrawer = () => {
  const { showTabletSidebar, setStudioState } = useStudioUIStore(
    useShallow((state) => ({
      showTabletSidebar: state.showTabletSidebar,
      setStudioState: state.setStudioState,
    })),
  );

  return (
    <>
      {/* Backdrop */}
      {showTabletSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 hidden md:block lg:hidden backdrop-blur-sm"
          onClick={() => setStudioState({ showTabletSidebar: false })}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-zinc-900 border-r border-zinc-800 z-50 hidden md:flex lg:hidden flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          showTabletSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button row */}
        <div className="flex items-center justify-between px-4 h-14 sm:h-16 border-b border-zinc-800 shrink-0">
          <span
            className="text-sm font-bold text-zinc-200 uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Project History
          </span>
          <IconButton
            onClick={() => setStudioState({ showTabletSidebar: false })}
            size="icon-sm"
            title="Close"
          >
            <X size={18} />
          </IconButton>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <StudioLeftSidebar />
        </div>
      </div>
    </>
  );
};
