'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';
import React from 'react';

type SidebarVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'blue'
  | 'ghost';
type SidebarSize = 'xs' | 'sm' | 'md';

interface SidebarButtonProps extends React.ComponentProps<'button'> {
  variant?: SidebarVariant;
  size?: SidebarSize;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const variantMap: Record<SidebarVariant, string> = {
  primary:
    'bg-linear-to-b from-amber-400 to-amber-600 text-black hover:from-amber-500 hover:to-amber-700 shadow-[0_3px_0_0_rgb(180,83,9)] active:shadow-[0_1px_0_0_rgb(180,83,9)] active:translate-y-1',
  secondary:
    'bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-amber-500/50',
  danger:
    'bg-linear-to-b from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white shadow-[0_2px_0_0_rgb(153,27,27)] active:shadow-[0_0.5px_0_0_rgb(153,27,27)] active:translate-y-0.5',
  success:
    'bg-linear-to-b from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-white shadow-[0_2px_0_0_rgb(5,150,105)] active:shadow-[0_0.5px_0_0_rgb(5,150,105)] active:translate-y-0.5',
  blue: 'bg-linear-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-[0_2px_0_0_rgb(29,78,216)] active:shadow-[0_0.5px_0_0_rgb(29,78,216)] active:translate-y-0.5',
  ghost: 'text-zinc-400 hover:text-amber-500 transition-colors',
};

const sizeMap: Record<SidebarSize, string> = {
  xs: 'px-2 py-0.5 text-[9px] h-auto',
  sm: 'px-2 py-1 text-[10px] h-auto',
  md: 'px-3 py-1.5 text-xs h-auto',
};

export const SidebarButton = ({
  variant = 'secondary',
  size = 'md',
  icon,
  children,
  className,
  ...props
}: SidebarButtonProps) => (
  <Button
    variant="ghost"
    size="sm"
    className={cn(
      'rounded-lg font-bold flex items-center justify-center gap-2',
      variantMap[variant],
      sizeMap[size],
      className,
    )}
    style={{ fontFamily: 'var(--font-inter)' }}
    {...props}
  >
    {icon}
    {children}
  </Button>
);
