'use client';

import { Button } from '@/components/ui/button';
import type { CreditPack } from '@/services/billing.service';
import { cn } from '@/utils/utils';
import { Coins, Sparkles } from 'lucide-react';

interface CreditPackCardProps {
  pack: CreditPack;
  onSelect: (pack: CreditPack) => void;
  isLoading?: boolean;
}

export function CreditPackCard({
  pack,
  onSelect,
  isLoading,
}: CreditPackCardProps) {
  const isPopular = pack.isPopular;

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border bg-zinc-900/50 p-6 text-left transition-all hover:bg-zinc-800/80',
        isPopular
          ? 'border-amber-500/50 shadow-[0_0_30px_-5px_var(--color-amber-500)]'
          : 'border-zinc-800 hover:border-zinc-700',
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-linear-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-semibold text-zinc-950 flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Most Popular
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h3 className="font-manga text-xl text-zinc-100">{pack.name}</h3>
        <p className="text-sm text-zinc-400 min-h-[40px]">{pack.description}</p>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">
          ${(pack.amount / 100).toFixed(2)}
        </span>
      </div>

      <div className="my-6 flex items-center gap-3 rounded-xl bg-zinc-950/50 p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500">
          <Coins className="h-5 w-5" />
        </div>
        <div>
          <div className="font-bold text-amber-400 flex items-center gap-1">
            {pack.credits.toLocaleString()} Credits
          </div>
          <div className="text-xs text-zinc-500">Added to balance</div>
        </div>
      </div>

      <Button
        className={cn(
          'mt-auto w-full font-semibold',
          isPopular
            ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
            : 'bg-zinc-800 text-white hover:bg-zinc-700',
        )}
        disabled={isLoading || !pack.isActive}
        onClick={() => onSelect(pack)}
      >
        {isLoading ? 'Processing...' : 'Select Plan'}
      </Button>
    </div>
  );
}
