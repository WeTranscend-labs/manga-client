'use client';

import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Route } from '@/constants';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

interface FullscreenModalProps {
  imageUrl: string;
  images: string[];
  currentIndex: number;
  isFromCanvas: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onAddToProject?: (markForExport: boolean) => void;
}

export default function FullscreenModal({
  imageUrl,
  images = [],
  currentIndex = 0,
  isFromCanvas,
  onClose,
  onNavigate,
  onAddToProject,
}: FullscreenModalProps) {
  const router = useRouter();

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (images.length <= 1) return;
      const nextIndex = (currentIndex + 1) % images.length;
      onNavigate(nextIndex);
    },
    [currentIndex, images.length, onNavigate],
  );

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (images.length <= 1) return;
      const prevIndex = (currentIndex - 1 + images.length) % images.length;
      onNavigate(prevIndex);
    },
    [currentIndex, images.length, onNavigate],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  const hasMultipleImages = images.length > 1;

  return (
    <div
      className="fixed inset-0 z-9999 bg-black/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-500 overflow-hidden"
      onClick={onClose}
    >
      {/* Top Bar for Canvas Actions */}
      {isFromCanvas && onAddToProject && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-6 left-6 flex gap-3 z-50 pointer-events-auto"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddToProject(true);
              onClose();
            }}
            className="px-6 py-4 h-auto bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl shadow-lg backdrop-blur-md transition-all font-bold"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            ✓ ADD TO PROJECT
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
            className="px-6 py-4 h-auto"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            <Eye size={16} />
            PREVIEW PDF
          </Button>
        </motion.div>
      )}

      {/* Close Button - More robust UX */}
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        title="Close (ESC)"
        className="absolute top-6 right-6 rounded-full! bg-zinc-800/50 hover:bg-zinc-700/80 text-white z-50 w-12 h-12 shadow-2xl transition-all border border-zinc-700/30 hover:scale-110 active:scale-95 flex items-center justify-center p-0"
        size="icon"
      >
        <X size={28} />
      </IconButton>

      {/* Navigation Controls */}
      {hasMultipleImages && (
        <>
          <IconButton
            onClick={handlePrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full! bg-zinc-800/30 hover:bg-zinc-700/60 text-white z-50 w-14 h-14 backdrop-blur-md border border-zinc-700/20 transition-all hover:scale-110 active:scale-95 group flex items-center justify-center p-0"
          >
            <ChevronLeft
              size={32}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
          </IconButton>
          <IconButton
            onClick={handleNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full! bg-zinc-800/30 hover:bg-zinc-700/60 text-white z-50 w-14 h-14 backdrop-blur-md border border-zinc-700/20 transition-all hover:scale-110 active:scale-95 group flex items-center justify-center p-0"
          >
            <ChevronRight
              size={32}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </IconButton>
        </>
      )}

      {/* Image Container with Transitions */}
      <div className="relative w-[92vw] h-[92vh] flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={imageUrl}
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full h-full flex items-center justify-center"
          >
            <Image
              src={imageUrl}
              alt="Manga preview"
              fill
              className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-lg pointer-events-auto cursor-default"
              onClick={(e) => e.stopPropagation()}
              sizes="92vw"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress/Index Counter */}
      {hasMultipleImages && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 px-5 py-2 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/50 rounded-full text-xs font-bold text-zinc-400 tracking-widest shadow-2xl z-50"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          <span className="text-amber-500">{currentIndex + 1}</span>
          <span className="mx-2 opacity-30">/</span>
          {images.length}
        </motion.div>
      )}

      {/* Background Hint for touch devices or general navigation tip */}
      {hasMultipleImages && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-zinc-600 uppercase tracking-widest font-medium pointer-events-none">
          Use arrow keys to navigate
        </div>
      )}
    </div>
  );
}
