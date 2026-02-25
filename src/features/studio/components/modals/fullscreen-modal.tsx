'use client';

import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Route } from '@/constants';
import { Eye, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface FullscreenModalProps {
  imageUrl: string;
  isFromCanvas: boolean;
  onClose: () => void;
  onAddToProject?: (markForExport: boolean) => void;
}

export default function FullscreenModal({
  imageUrl,
  isFromCanvas,
  onClose,
  onAddToProject,
}: FullscreenModalProps) {
  const router = useRouter();

  return (
    <div
      className="fixed inset-0 z-9999 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <IconButton
        onClick={onClose}
        title="Close (ESC)"
        className="absolute top-4 right-4 !rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white [&_svg]:hover:rotate-90 [&_svg]:transition-transform [&_svg]:duration-300"
        size="icon"
      >
        <X size={24} />
      </IconButton>

      {isFromCanvas && onAddToProject && (
        <div className="absolute top-4 left-4 flex gap-3 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddToProject(true);
              onClose();
            }}
            className="px-6 py-3 h-auto bg-linear-to-b from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-white rounded-lg shadow-lg"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            ✓ ADD TO PDF
          </Button>
          <Button
            variant="primary-3d"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddToProject(true);
              onClose();
              router.push(Route.STUDIO_PREVIEW);
            }}
            className="px-6 py-3 h-auto"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            <Eye size={16} />
            PREVIEW PDF
          </Button>
        </div>
      )}

      <div className="relative w-[95vw] h-[95vh]">
        <Image
          src={imageUrl}
          alt="Fullscreen manga"
          fill
          className="object-contain rounded-lg shadow-2xl cursor-default"
          onClick={(e) => e.stopPropagation()}
          sizes="95vw"
          priority
        />
      </div>
    </div>
  );
}
