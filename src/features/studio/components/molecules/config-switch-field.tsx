'use client';

import { Switch } from '@/components/ui/switch';

interface ConfigSwitchFieldProps {
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const ConfigSwitchField = ({
  label,
  hint,
  checked,
  onCheckedChange,
}: ConfigSwitchFieldProps) => {
  return (
    <div className="flex items-center justify-between space-x-2">
      <div className="flex flex-col space-y-1">
        <label
          className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          {label}
        </label>
        {hint && (
          <span className="text-[9px] text-zinc-500 font-normal normal-case">
            {hint}
          </span>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
};
