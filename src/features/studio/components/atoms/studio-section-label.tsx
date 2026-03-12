'use client';

import React from 'react';

interface StudioSectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export const StudioSectionLabel = ({
  children,
  className = '',
}: StudioSectionLabelProps) => {
  return (
    <label
      className={`text-xs font-semibold text-zinc-300 uppercase tracking-widest flex items-center gap-2 ${className}`}
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      {children}
    </label>
  );
};
