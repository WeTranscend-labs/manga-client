'use client';

import { useDebouncedCallback } from '@/utils/react-utils';
import { useState } from 'react';

interface StoryContextFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function StoryContextField({
  value,
  onChange,
  label = 'Context',
  placeholder = 'Describe your story context...',
}: StoryContextFieldProps) {
  // Local state for immediate feedback
  // Initially synced from prop, but we don't sync back down via Effect to avoid loops.
  // The 'key' in parent handles resets on session switch.
  const [localValue, setLocalValue] = useState(value);

  const debouncedOnChange = useDebouncedCallback((val: string) => {
    onChange(val);
  }, 500);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    debouncedOnChange(val);
  };

  return (
    <div className="space-y-2">
      <label
        className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        <span>{label}</span>
        <span className="text-[9px] text-zinc-500 font-normal normal-case">
          (Keep characters consistent!)
        </span>
      </label>
      <textarea
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm leading-relaxed text-zinc-300 placeholder:text-zinc-600 placeholder:text-[11px] placeholder:leading-relaxed focus:outline-none focus:border-amber-500 transition-colors resize-none custom-scrollbar min-h-[80px]"
        style={{ fontFamily: 'var(--font-inter)' }}
        maxLength={10000}
      />
    </div>
  );
}
