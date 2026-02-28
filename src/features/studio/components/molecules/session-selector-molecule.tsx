'use client';

import { Icons } from '@/components/icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MangaSession } from '@/types';
import { SidebarButton } from '../atoms/sidebar-button';

interface SessionSelectorMoleculeProps {
  currentSessionId: string;
  sessions: MangaSession[];
  onSwitchSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onCreateSession: () => void;
}

export const SessionSelectorMolecule = ({
  currentSessionId,
  sessions,
  onSwitchSession,
  onDeleteSession,
  onCreateSession,
}: SessionSelectorMoleculeProps) => {
  return (
    <div className="space-y-2 mb-1">
      <div className="flex gap-2 min-w-0">
        <Select value={currentSessionId} onValueChange={onSwitchSession}>
          <SelectTrigger className="flex-1 min-w-0 bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-amber-500 focus:border-amber-500 h-10 font-sans">
            <span className="truncate flex-1 text-left">
              <SelectValue />
            </span>
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-zinc-800">
            {sessions.map((s) => (
              <SelectItem
                key={s.id}
                value={s.id}
                className="text-zinc-300 hover:bg-amber-500/20 focus:bg-amber-500/20 focus:text-white cursor-pointer"
              >
                {s.name} ({s.pages.length})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <SidebarButton
          variant="danger"
          onClick={() => onDeleteSession(currentSessionId)}
          title="Delete Session"
          className="px-3"
        >
          <Icons.Trash2 size={14} />
        </SidebarButton>
      </div>
      <SidebarButton
        variant="success"
        className="w-full"
        icon={<Icons.Plus size={12} />}
        onClick={onCreateSession}
      >
        NEW SESSION
      </SidebarButton>
    </div>
  );
};
