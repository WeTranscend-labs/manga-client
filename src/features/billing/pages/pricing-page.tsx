'use client';

import { Page } from '@/components/layout/page';
import { CreditPacksGrid } from '@/features/billing/components/organisms/credit-packs-grid';
import type { CreditPack } from '@/services/billing.service';
import { useState } from 'react';
import { toast } from 'sonner';

export function PricingPage() {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleSelectPack = async (pack: CreditPack) => {
    setProcessingId(pack.id);
    try {
      // Simulate top-up initialization (this would connect to actual billing flow)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Ready for checkout', {
        description: `Proceeding with ${pack.name} package.`,
      });
      // Redirect or open modal for payment here
    } catch (error) {
      toast.error('Checkout failed', {
        description: 'Unable to initiate checkout process.',
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Page>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-3xl md:text-5xl font-manga text-amber-400">
            Credit Packages
          </h1>
          <p className="text-base text-zinc-400">
            Fuel your creativity. Get more credits to generate pages,
            characters, and complete stories in Manga Studio.
          </p>
        </div>

        <CreditPacksGrid
          onSelectPack={handleSelectPack}
          isProcessingId={processingId}
        />
      </div>
    </Page>
  );
}
