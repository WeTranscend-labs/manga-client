'use client';

import { Icons } from '@/components/icons';
import { IconButton } from '@/components/ui/icon-button';
import { GeneratedManga } from '@/types';
import { cn } from '@/utils/utils';
import Image from 'next/image';
import { SidebarButton } from '../atoms/sidebar-button';

interface PageCardProps {
  page: GeneratedManga;
  index: number;
  isSelected: boolean;
  isReference: boolean;
  onToggleSelection: (id: string) => void;
  onToggleReference: (id: string) => void;
  onToggleExport: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onDelete: (id: string) => void;
  onOpenFullscreen: (url: string) => void;
}

export const PageCard = ({
  page,
  index,
  isSelected,
  isReference,
  onToggleSelection,
  onToggleReference,
  onToggleExport,
  onMove,
  onDelete,
  onOpenFullscreen,
}: PageCardProps) => {
  return (
    <div
      className={cn(
        'group relative bg-zinc-950 border rounded-lg overflow-hidden transition-all cursor-pointer',
        isSelected
          ? 'border-amber-500 ring-2 ring-amber-500/50'
          : 'border-zinc-800 hover:border-amber-500/30',
      )}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button') === null) {
          onToggleSelection(page.id);
        }
      }}
    >
      <div className="relative w-full h-40">
        <Image
          src={page.url || '/placeholder.svg'}
          alt={`Page ${index + 1}`}
          fill
          className="object-cover opacity-70 group-hover:opacity-100 transition-opacity"
          sizes="(max-width: 768px) 100vw, 200px"
        />
      </div>

      <div className="absolute top-2 left-2 flex items-center gap-1.5">
        {/* Selection toggle — custom styled checkbox, kept as small icon button */}
        <IconButton
          size="icon-xs"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelection(page.id);
          }}
          className="bg-black/80 backdrop-blur-sm hover:bg-black/90"
          title={isSelected ? 'Deselect' : 'Select'}
        >
          {isSelected ? (
            <Icons.CheckSquare size={14} className="text-amber-500" />
          ) : (
            <Icons.Square size={14} className="text-zinc-400" />
          )}
        </IconButton>
        <div className="px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-[10px] font-bold text-amber-500">
          P.{index + 1}
        </div>

        {/* Reference star toggle */}
        <IconButton
          size="icon-xs"
          onClick={(e) => {
            e.stopPropagation();
            onToggleReference(page.id);
          }}
          className={cn(
            'bg-black/80 backdrop-blur-sm hover:bg-black/90',
            isReference
              ? 'text-amber-400 ring-1 ring-amber-400/50'
              : 'text-zinc-400',
          )}
          title={isReference ? 'Remove reference' : 'Set as reference'}
        >
          <Icons.Star size={14} className={isReference ? 'fill-current' : ''} />
        </IconButton>
      </div>

      {isReference && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-linear-to-br from-amber-500/90 to-amber-600/90 backdrop-blur-sm rounded text-[10px] font-bold text-black flex items-center gap-1 shadow-lg">
          <Icons.Star size={10} className="fill-current" />
          REF
        </div>
      )}

      {page.markedForExport && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-green-500/90 backdrop-blur-sm rounded text-[10px] font-bold text-white">
          PDF
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-2 pb-3 bg-linear-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1 mb-0.5">
          <SidebarButton
            variant="blue"
            size="xs"
            icon={<Icons.Maximize2 size={12} />}
            onClick={(e) => {
              e.stopPropagation();
              onOpenFullscreen(page.url);
            }}
          />
          <SidebarButton
            variant={page.markedForExport ? 'success' : 'secondary'}
            size="xs"
            icon={<Icons.FileText size={12} />}
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExport(page.id);
            }}
          />
          <SidebarButton
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              onMove(page.id, 'up');
            }}
          >
            ▲
          </SidebarButton>
          <SidebarButton
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              onMove(page.id, 'down');
            }}
          >
            ▼
          </SidebarButton>
          <SidebarButton
            variant="danger"
            size="xs"
            icon={<Icons.Trash2 size={12} />}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(page.id);
            }}
          />
        </div>
      </div>
    </div>
  );
};
