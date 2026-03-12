'use client';

interface StudioStepNumberProps {
  number: string | number;
  className?: string;
}

export const StudioStepNumber = ({
  number,
  className = '',
}: StudioStepNumberProps) => {
  return (
    <div
      className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center shrink-0 bg-amber-500/10 border border-amber-500/20 text-amber-500 shadow-sm ${className}`}
    >
      {number}
    </div>
  );
};
