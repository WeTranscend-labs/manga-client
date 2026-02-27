'use client';

import type { CreditPack } from '@/services/billing.service';
import { useCreditPacks } from '../../hooks/use-credit-packs';
import { CreditPackCard } from '../molecules/credit-pack-card';

interface CreditPacksGridProps {
  onSelectPack: (pack: CreditPack) => void;
  isProcessingId?: string | null;
}

export function CreditPacksGrid({
  onSelectPack,
  isProcessingId,
}: CreditPacksGridProps) {
  const { data: packs, isLoading, isError } = useCreditPacks();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[350px] rounded-2xl border border-zinc-800 bg-zinc-900/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError || !packs) {
    return (
      <div className="w-full py-12 text-center border rounded-2xl border-zinc-800 bg-zinc-900/30">
        <p className="text-zinc-400">
          Failed to load available packages. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
      {packs.map((pack) => (
        <CreditPackCard
          key={pack.id}
          pack={pack}
          onSelect={onSelectPack}
          isLoading={isProcessingId === pack.id}
        />
      ))}
    </div>
  );
}
