'use client';

import { Page } from '@/components/layout/page';
import { BILLING_CONTRACT_ADDRESS, BILLING_NETWORK_ID } from '@/constants/env';
import { CreditPacksGrid } from '@/features/billing/components/organisms/credit-packs-grid';
import type { CreditPack } from '@/services/billing.service';
import { billingService } from '@/services/billing.service';
import { useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { useState } from 'react';
import { toast } from 'sonner';

const POLKADOT_TESTNET_ID = BILLING_NETWORK_ID
  ? Number(BILLING_NETWORK_ID)
  : 1002;

export function PricingPage() {
  const { wallets } = useWallets();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleSelectPack = async (pack: CreditPack) => {
    if (!wallets.length) {
      toast.error('Please connect your wallet first');
      return;
    }

    setProcessingId(pack.id);
    try {
      const wallet = wallets[0];

      // 1. Ensure correct network
      if (wallet.chainId !== `eip155:${POLKADOT_TESTNET_ID}`) {
        toast.info('Switching to requested network...');
        try {
          await wallet.switchChain(POLKADOT_TESTNET_ID);
        } catch (switchError: any) {
          toast.error('Network switch failed', {
            description:
              switchError.message ||
              'Please manually switch your wallet to the correct network.',
          });
          return;
        }
      }

      // 2. Create top-up session
      const { top_up_id: depositId } = await billingService.initiateTopUp(
        pack.credits,
      );

      // 3. Initiate Transaction
      const ethereumProvider = await wallet.getEthereumProvider();
      const provider = new ethers.BrowserProvider(ethereumProvider);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: BILLING_CONTRACT_ADDRESS,
        value: ethers.parseEther(pack.amount.toString()),
      });

      toast.promise(tx.wait(), {
        loading: 'Confirming transaction on blockchain...',
        success: 'Transaction successful!',
        error: 'Transaction confirmation failed',
      });

      await tx.wait();

      // 4. Submit Hash to Backend
      await billingService.submitTransaction(depositId, tx.hash);

      toast.success('Payment successful!', {
        description: `You have purchased ${pack.credits} credits. Please wait for system confirmation.`,
      });
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error('Payment failed', {
        description: error.message || 'An error occurred during transaction',
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
