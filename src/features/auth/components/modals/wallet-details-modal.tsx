'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DialogProps } from '@/components/ui/modal';
import { toast } from 'sonner';

interface WalletDetailsModalProps extends DialogProps {
  address: string;
  onDisconnect: () => void;
}

export function WalletDetailsModal({
  isOpen,
  onDismiss,
  address,
  onDisconnect,
}: WalletDetailsModalProps) {
  const shortAddress = `${address.slice(0, 8)}...${address.slice(-6)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  const handleOpenExplorer = () => {
    window.open(
      `https://blockscout-testnet.polkadot.io/address/${address}`,
      '_blank',
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onDismiss()}>
      <DialogContent className="max-w-sm bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader className="border-b border-zinc-900 pb-4">
          <DialogTitle className="flex items-center gap-2 text-zinc-100">
            <Icons.Wallet className="text-amber-500" size={20} />
            Wallet Connection
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Address Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Connected Address
            </label>
            <div className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl group hover:border-zinc-700 transition-colors">
              <span className="font-mono text-sm text-zinc-200">
                {shortAddress}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-amber-400 transition-all"
                  title="Copy Address"
                >
                  <Icons.Copy size={14} />
                </button>
                <button
                  onClick={handleOpenExplorer}
                  className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-amber-400 transition-all"
                  title="View on Explorer"
                >
                  <Icons.ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Network Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Active Network
            </label>
            <div className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-emerald-500/20 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                  <Icons.Network size={14} className="text-emerald-500" />
                  Polkadot Hub TestNet
                </span>
                <span className="text-[10px] text-zinc-500">
                  Chain ID: 420420417
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2 border-t border-zinc-900">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all"
            onClick={() => {
              onDisconnect();
              onDismiss();
            }}
          >
            <Icons.LogOut size={18} />
            <span className="font-bold text-xs">Disconnect Wallet</span>
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 rounded-xl transition-all"
            onClick={onDismiss}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
