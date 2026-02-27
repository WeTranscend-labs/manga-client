'use client';

import { Icons } from '@/components/icons';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DialogProps } from '@/components/ui/modal';
import { useWalletLogin } from '../../../hooks/use-wallet-login';

const WALLET_OPTIONS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: Icons.Metamask,
    color: 'hover:border-orange-500/50',
  },
  {
    id: 'coinbase_wallet',
    name: 'Coinbase',
    icon: Icons.Coinbase,
    color: 'hover:border-blue-500/50',
  },
  {
    id: 'phantom',
    name: 'Phantom',
    icon: Icons.Phantom,
    color: 'hover:border-purple-500/50',
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    icon: Icons.Rainbow,
    color: 'hover:border-indigo-400/50',
  },
] as const;

export function WalletConnectModal({ isOpen, onDismiss }: DialogProps) {
  const { loginWithWallet, isLoading } = useWalletLogin(onDismiss);

  const handleWalletLogin = async (walletId: string) => {
    await loginWithWallet(walletId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onDismiss()}>
      <DialogContent className="max-w-[400px] bg-zinc-950/90 border-zinc-800/50 text-zinc-100 backdrop-blur-xl shadow-2xl overflow-hidden p-0 gap-0">
        <div className="absolute inset-0 bg-linear-to-tr from-amber-500/5 via-transparent to-transparent pointer-events-none" />

        <DialogHeader className="p-6 border-b border-zinc-900/50 relative bg-zinc-900/20">
          <DialogTitle className="flex items-center gap-3 text-lg font-bold tracking-tight text-white">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Icons.Wallet className="text-amber-500" size={20} />
            </div>
            <span>Connect Wallet</span>
          </DialogTitle>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            Choose your preferred wallet to connect to Manga Studio.
          </p>
        </DialogHeader>

        <div className="p-6 grid grid-cols-2 gap-4 relative">
          {WALLET_OPTIONS.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => handleWalletLogin(wallet.id)}
              disabled={isLoading}
              className={`flex flex-col items-center justify-center gap-3 p-5 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl transition-all duration-300 group relative hover:bg-zinc-800/40 hover:-translate-y-1 ${wallet.color} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="relative">
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-white/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-14 h-14 flex items-center justify-center relative grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110">
                  <wallet.icon className="w-12 h-12 text-white" />
                </div>
              </div>
              <span className="text-[11px] font-bold text-zinc-500 group-hover:text-zinc-100 uppercase tracking-widest transition-colors">
                {wallet.name}
              </span>
            </button>
          ))}
        </div>

        <div className="p-6 bg-zinc-900/40 border-t border-zinc-900/50 text-center relative">
          <p className="text-[10px] text-zinc-500 leading-relaxed max-w-[280px] mx-auto">
            By connecting your wallet, you agree to our{' '}
            <span className="text-zinc-400 hover:text-amber-500 cursor-pointer transition-colors">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="text-zinc-400 hover:text-amber-500 cursor-pointer transition-colors">
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
