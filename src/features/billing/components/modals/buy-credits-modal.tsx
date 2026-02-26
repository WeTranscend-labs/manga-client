'use client';

import { Icons } from '@/components/icons';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DialogProps } from '@/components/ui/modal';
import { BILLING_CONTRACT_ADDRESS, BILLING_NETWORK_ID } from '@/constants/env';
import { billingService } from '@/services/billing.service';
import { useAuthStore } from '@/stores/auth.store';
import { useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { CheckCircle2, Loader2, Sparkles, Wallet } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const CREDIT_PLANS = [
  { credits: 100, price: 0.1, label: 'Starter', popular: false },
  { credits: 500, price: 0.45, label: 'Creator', popular: true },
  { credits: 2000, price: 1.5, label: 'Pro', popular: false },
];

const POLKADOT_TESTNET_ID = BILLING_NETWORK_ID
  ? Number(BILLING_NETWORK_ID)
  : 1002;

export function BuyCreditsModal({ isOpen, onDismiss }: DialogProps) {
  const { wallets } = useWallets();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<'plan' | 'payment' | 'verifying'>('plan');
  const [selectedPlan, setSelectedPlan] = useState<
    (typeof CREDIT_PLANS)[0] | null
  >(null);

  const handlePurchase = async (plan: (typeof CREDIT_PLANS)[0]) => {
    if (!wallets.length) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setSelectedPlan(plan);
    setStep('payment');

    try {
      const wallet = wallets[0]; // Use first connected wallet

      // 1. Ensure correct network
      if (wallet.chainId !== `eip155:${POLKADOT_TESTNET_ID}`) {
        toast.info('Switching to Polkadot TestNet...');
        await wallet.switchChain(POLKADOT_TESTNET_ID);
      }

      // 2. Create top-up session
      const { top_up_id: depositId } = await billingService.initiateTopUp(
        plan.credits,
      );

      // 3. Initiate Transaction
      const ethereumProvider = await wallet.getEthereumProvider();
      const provider = new ethers.BrowserProvider(ethereumProvider);
      const signer = await provider.getSigner();

      // Recipient address from contract config

      const tx = await signer.sendTransaction({
        to: BILLING_CONTRACT_ADDRESS,
        value: ethers.parseEther(plan.price.toString()),
      });

      setStep('verifying');
      toast.promise(tx.wait(), {
        loading: 'Confirming transaction on blockchain...',
        success: 'Transaction successful!',
        error: 'Transaction confirmation failed',
      });

      await tx.wait();

      // 4. Submit Hash to Backend
      await billingService.submitTransaction(depositId, tx.hash);

      setSuccess(true);
      toast.success('Payment successful!', {
        description: `You have purchased ${plan.credits} credits. Please wait for system confirmation.`,
      });

      // We don't close immediately, let them see the success state
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error('Payment failed', {
        description: error.message || 'An error occurred during transaction',
      });
      setStep('plan');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setSuccess(false);
    setStep('plan');
    onDismiss();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="max-w-[440px] bg-zinc-950 border-zinc-800 text-zinc-100 overflow-hidden p-0 gap-0">
        <DialogHeader className="p-6 border-b border-zinc-900 bg-zinc-900/20">
          <DialogTitle className="flex items-center gap-3 text-lg font-bold">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Sparkles className="text-amber-500" size={20} />
            </div>
            <span>Buy Credits</span>
          </DialogTitle>
          <p className="text-xs text-zinc-500 mt-1">
            Upgrade your account to generate more manga.
          </p>
        </DialogHeader>

        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="text-green-500" size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold">Transaction Sent!</h3>
                <p className="text-sm text-zinc-400">
                  The system is verifying your transaction on-chain. <br />
                  Your credit balance will be updated automatically.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-full mt-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-3">
                {CREDIT_PLANS.map((plan) => (
                  <button
                    key={plan.credits}
                    disabled={loading}
                    onClick={() => handlePurchase(plan)}
                    className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      plan.popular
                        ? 'bg-amber-500/5 border-amber-500/30'
                        : 'bg-zinc-900/40 border-zinc-800'
                    } hover:border-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-xl ${plan.popular ? 'bg-amber-500/20' : 'bg-zinc-800'}`}
                      >
                        <Icons.Logo
                          className={
                            plan.popular ? 'text-amber-500' : 'text-zinc-400'
                          }
                          size={24}
                        />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white">
                            {plan.credits}
                          </span>
                          <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">
                            Credits
                          </span>
                        </div>
                        <span className="text-xs text-zinc-500">
                          {plan.label} Plan
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-amber-500">
                        {plan.price} DOT
                      </div>
                      {plan.popular && (
                        <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.5 rounded font-bold uppercase">
                          Popular
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {step !== 'plan' && (
                <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800 flex items-center gap-3">
                  {step === 'payment' ? (
                    <Wallet
                      className="text-amber-500 animate-pulse"
                      size={20}
                    />
                  ) : (
                    <Loader2
                      className="text-amber-500 animate-spin"
                      size={20}
                    />
                  )}
                  <div className="text-xs">
                    <p className="font-semibold text-zinc-200">
                      {step === 'payment'
                        ? 'Processing payment...'
                        : 'Verifying transaction...'}
                    </p>
                    <p className="text-zinc-500">
                      Please check and confirm in your wallet.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                <Icons.Wallet className="text-blue-400 shrink-0" size={16} />
                <p className="text-[10px] text-zinc-400">
                  Connected:{' '}
                  <span className="text-zinc-200 font-mono">
                    {wallets[0]?.address.slice(0, 6)}...
                    {wallets[0]?.address.slice(-4)}
                  </span>{' '}
                  on{' '}
                  <span className="text-blue-400 font-semibold">
                    Polkadot TestNet
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
