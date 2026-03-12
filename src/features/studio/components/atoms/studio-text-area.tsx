'use client';

import { cn } from '@/utils/utils';
import React from 'react';

interface StudioTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const StudioTextArea = React.forwardRef<
  HTMLTextAreaElement,
  StudioTextAreaProps
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full flex-1 h-full min-h-0 bg-zinc-950/40 border border-zinc-800/80 rounded-xl p-3 sm:p-4 text-sm leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all resize-none custom-scrollbar shadow-inner',
        className,
      )}
      style={{ fontFamily: 'var(--font-inter)' }}
      {...props}
    />
  );
});

StudioTextArea.displayName = 'StudioTextArea';
