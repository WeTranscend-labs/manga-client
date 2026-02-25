'use client';

import React from 'react';
import { StudioSectionLabel } from '../atoms/studio-section-label';
import { StudioStepNumber } from '../atoms/studio-step-number';

interface StudioSectionHeaderProps {
  step: string | number;
  label: string;
  badge?: React.ReactNode;
  className?: string;
}

export const StudioSectionHeader = ({
  step,
  label,
  badge,
  className = '',
}: StudioSectionHeaderProps) => {
  return (
    <div className={`flex items-center gap-3 pb-1 shrink-0 ${className}`}>
      <StudioStepNumber number={step} />
      <div className="flex-1">
        <StudioSectionLabel>
          <span>{label}</span>
          {badge}
        </StudioSectionLabel>
      </div>
    </div>
  );
};
