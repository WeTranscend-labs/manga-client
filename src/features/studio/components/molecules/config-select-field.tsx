'use client';

import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import React from 'react';

interface ConfigSelectFieldProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  badge?: React.ReactNode;
  hint?: string;
  className?: string;
  disabled?: boolean;
}

export const ConfigSelectField = ({
  label,
  value,
  onValueChange,
  children,
  badge,
  hint,
  className = '',
  disabled,
}: ConfigSelectFieldProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label
        className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        <span>{label}</span>
        {badge}
      </label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-amber-500 focus:border-amber-500 h-9 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-zinc-950 border-zinc-800 font-sans max-h-[300px]">
          {children}
        </SelectContent>
      </Select>
      {hint && <p className="text-[9px] text-zinc-600 mt-1">{hint}</p>}
    </div>
  );
};
