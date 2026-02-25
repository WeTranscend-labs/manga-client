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
      className={`w-8 h-8 rounded-full bg-linear-to-br from-amber-400 to-amber-600 text-black font-bold text-sm flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30 ring-2 ring-amber-500/20 ${className}`}
    >
      {number}
    </div>
  );
};
