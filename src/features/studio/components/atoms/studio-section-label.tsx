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
      className={`text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2 ${className}`}
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      {children}
    </label>
  );
};
