'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { SidebarButton } from '../atoms/sidebar-button';

interface SelectionControlsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeleteSelected: () => void;
}

export const SelectionControls = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeleteSelected,
}: SelectionControlsProps) => {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={onSelectAll}
        title={selectedCount === totalCount ? 'Deselect All' : 'Select All'}
        className="flex items-center gap-1.5 px-2 py-1 h-auto text-[10px] text-zinc-400 hover:text-amber-500"
      >
        {selectedCount === totalCount ? (
          <Icons.CheckSquare size={14} />
        ) : (
          <Icons.Square size={14} />
        )}
        <span>
          {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
        </span>
      </Button>
      {selectedCount > 0 && (
        <SidebarButton
          variant="danger"
          size="sm"
          icon={<Icons.Trash2 size={12} />}
          onClick={onDeleteSelected}
        >
          Delete ({selectedCount})
        </SidebarButton>
      )}
    </div>
  );
};
