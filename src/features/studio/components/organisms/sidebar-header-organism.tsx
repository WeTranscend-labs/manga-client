'use client';

import { Icons } from '@/components/icons';
import { MangaProject, MangaSession } from '@/types';
import { SessionSelectorMolecule } from '../molecules/session-selector-molecule';

interface SidebarHeaderProps {
  project: MangaProject;
  currentSession: MangaSession | null;
  pageCount: number;
  onSwitchSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onCreateSession: (name: string) => void;
}

export const SidebarHeaderOrganism = ({
  project,
  currentSession,
  pageCount,
  onSwitchSession,
  onDeleteSession,
  onCreateSession,
}: SidebarHeaderProps) => {
  return (
    <div className="p-4 border-b border-zinc-800 pb-5">
      <div className="flex items-center gap-2 mb-1">
        <Icons.Library size={16} className="text-amber-500" />
        <h2
          className="text-sm font-bold text-zinc-200 uppercase tracking-wider"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          Project History
        </h2>
      </div>
      <p className="text-[10px] text-zinc-500 mb-4 leading-relaxed">
        Manage your manga pages and sessions here.
      </p>

      <div className="flex items-center justify-between mb-3 border-t border-zinc-800/50 pt-3">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
          Pages
        </span>
        <span className="text-[10px] text-zinc-500">{pageCount} total</span>
      </div>

      {currentSession && (
        <SessionSelectorMolecule
          currentSessionId={currentSession.id}
          sessions={Array.isArray(project.sessions) ? project.sessions : []}
          onSwitchSession={onSwitchSession}
          onDeleteSession={onDeleteSession}
          onCreateSession={() =>
            onCreateSession('Session ' + new Date().toLocaleTimeString())
          }
        />
      )}
    </div>
  );
};
