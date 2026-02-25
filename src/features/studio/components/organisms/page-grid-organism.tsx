'use client';

import { Icons } from '@/components/icons';
import { GeneratedManga } from '@/types';
import { PageCard } from '../molecules/page-card';
import { SelectionControls } from '../molecules/selection-controls';

interface PageGridOrganismProps {
  pages: GeneratedManga[];
  selectedPages: Set<string>;
  referencePageIds: string[];
  onToggleSelection: (id: string) => void;
  onSelectAll: () => void;
  onDeleteSelected: () => void;
  onToggleReference: (id: string) => void;
  onToggleExport: (id: string) => void;
  onMovePage: (id: string, direction: 'up' | 'down') => void;
  onDeletePage: (id: string) => void;
  onOpenFullscreen: (url: string) => void;
}

export const PageGridOrganism = ({
  pages,
  selectedPages,
  referencePageIds,
  onToggleSelection,
  onSelectAll,
  onDeleteSelected,
  onToggleReference,
  onToggleExport,
  onMovePage,
  onDeletePage,
  onOpenFullscreen,
}: PageGridOrganismProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
      {pages.length > 0 && (
        <SelectionControls
          selectedCount={selectedPages.size}
          totalCount={pages.length}
          onSelectAll={onSelectAll}
          onDeleteSelected={onDeleteSelected}
        />
      )}

      {pages.length === 0 ? (
        <div className="text-center py-20 opacity-20">
          <Icons.Layers size={40} className="mx-auto mb-3 text-zinc-600" />
          <p className="text-xs text-zinc-500">No pages yet</p>
        </div>
      ) : (
        pages.map((page, idx) => (
          <PageCard
            key={page.id}
            page={page}
            index={idx}
            isSelected={selectedPages.has(page.id)}
            isReference={referencePageIds.includes(page.id)}
            onToggleSelection={onToggleSelection}
            onToggleReference={onToggleReference}
            onToggleExport={onToggleExport}
            onMove={onMovePage}
            onDelete={onDeletePage}
            onOpenFullscreen={onOpenFullscreen}
          />
        ))
      )}
    </div>
  );
};
