'use client';

import { Icons } from '@/components/icons';
import {
  GeneratedManga,
  MangaConfig,
  MangaProject,
  MangaSession,
} from '@/types';
import { useState } from 'react';
import { SidebarButton } from '../atoms/sidebar-button';
import { PageGridOrganism } from './page-grid-organism';
import { SidebarHeaderOrganism } from './sidebar-header-organism';
import { SidebarReferenceOrganism } from './sidebar-reference-organism';

interface SessionSidebarProps {
  project: MangaProject;
  currentSession: MangaSession | null;
  pagesToShow: GeneratedManga[];
  config?: MangaConfig;
  onSwitchSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onCreateSession: (name: string) => void;
  onToggleMarkForExport: (pageId: string) => void;
  onMovePage: (pageId: string, direction: 'up' | 'down') => void;
  onDeletePage: (pageId: string) => void;
  onDeletePages: (pageIds: string[]) => void;
  onOpenFullscreen: (imageUrl: string) => void;
  onConfigChange?: (config: MangaConfig) => void;
  onToggleReferencePage?: (pageId: string) => void;
}

export default function SessionSidebar({
  project,
  currentSession,
  pagesToShow,
  config,
  onSwitchSession,
  onDeleteSession,
  onCreateSession,
  onToggleMarkForExport,
  onMovePage,
  onDeletePage,
  onDeletePages,
  onOpenFullscreen,
  onConfigChange,
  onToggleReferencePage,
}: SessionSidebarProps) {
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [showReferencePanel, setShowReferencePanel] = useState(false);

  const referenceImages = config?.referenceImages || [];
  const enabledCount = referenceImages.filter((img) =>
    typeof img === 'string' ? true : img.enabled,
  ).length;

  const togglePageSelection = (pageId: string) => {
    setSelectedPages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pageId)) newSet.delete(pageId);
      else newSet.add(pageId);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedPages.size === pagesToShow.length) setSelectedPages(new Set());
    else setSelectedPages(new Set(pagesToShow.map((p) => p.id)));
  };

  const handleDeleteSelected = () => {
    const pageIds = Array.from(selectedPages).filter((id) =>
      pagesToShow.some((p) => p.id === id),
    );
    if (pageIds.length > 0) onDeletePages(pageIds);
    setSelectedPages(new Set());
  };

  return (
    <aside className="border-r border-zinc-800 bg-zinc-900 flex flex-col h-full w-full overflow-hidden">
      <SidebarHeaderOrganism
        project={project}
        currentSession={currentSession}
        pageCount={pagesToShow.length}
        onSwitchSession={onSwitchSession}
        onDeleteSession={onDeleteSession}
        onCreateSession={onCreateSession}
      />

      {referenceImages.length > 0 && !showReferencePanel && (
        <div className="px-4 pb-3">
          <SidebarButton
            variant="blue"
            className="w-full"
            icon={<Icons.Image size={12} />}
            onClick={() => setShowReferencePanel(true)}
          >
            STYLE REFERENCES ({enabledCount}/{referenceImages.length})
          </SidebarButton>
        </div>
      )}

      {config && onConfigChange && (
        <SidebarReferenceOrganism
          config={config}
          isOpen={showReferencePanel}
          onClose={() => setShowReferencePanel(false)}
          onConfigChange={onConfigChange}
        />
      )}

      <PageGridOrganism
        pages={pagesToShow}
        selectedPages={selectedPages}
        referencePageIds={currentSession?.selectedReferencePageIds || []}
        onToggleSelection={togglePageSelection}
        onSelectAll={handleSelectAll}
        onDeleteSelected={handleDeleteSelected}
        onToggleReference={onToggleReferencePage || (() => {})}
        onToggleExport={onToggleMarkForExport}
        onMovePage={onMovePage}
        onDeletePage={onDeletePage}
        onOpenFullscreen={onOpenFullscreen}
      />
    </aside>
  );
}
