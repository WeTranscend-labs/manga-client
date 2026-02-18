'use client';

import { cn } from '@/utils/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const studioButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-manga uppercase tracking-wider transition-all active:scale-[0.97] skew-x-[-12deg] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:pointer-events-none relative group overflow-hidden select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-blue-600 text-white hover:bg-blue-500 ring-1 ring-blue-400/30',
        success:
          'bg-[#2dd4bf] text-white hover:bg-[#14b8a6] ring-1 ring-emerald-400/30',
        warning:
          'bg-amber-500 text-white hover:bg-amber-400 ring-1 ring-amber-300/30',
        danger: 'bg-red-500 text-white hover:bg-red-400 ring-1 ring-red-400/30',
        outline:
          'bg-white text-zinc-900 border-2 border-zinc-200 hover:border-zinc-800 ring-0 shadow-none',
        secondary:
          'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 ring-1 ring-zinc-700/30',
      },
      size: {
        default: 'h-11 px-8 text-lg',
        sm: 'h-9 px-4 text-sm',
        lg: 'h-14 px-10 text-xl',
        xl: 'h-16 px-12 text-2xl',
      },
      isFullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

export interface StudioButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof studioButtonVariants> {
  asChild?: boolean;
}

const StudioButton = React.forwardRef<HTMLButtonElement, StudioButtonProps>(
  ({ className, variant, size, isFullWidth, ...props }, ref) => {
    return (
      <button
        className={cn(
          studioButtonVariants({ variant, size, isFullWidth, className }),
        )}
        ref={ref}
        {...props}
      >
        <span className="skew-x-[12deg] flex items-center gap-2">
          {props.children}
        </span>
      </button>
    );
  },
);
StudioButton.displayName = 'StudioButton';

export { StudioButton, studioButtonVariants };
