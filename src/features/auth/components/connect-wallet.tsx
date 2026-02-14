'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useModal } from '@/components/ui/modal';
import { WalletConnectModal } from '@/features/auth/components/modals/wallet-connect-modal';
import { WalletDetailsModal } from '@/features/auth/components/modals/wallet-details-modal';
import { usePrivy as useWallet, useWallets } from '@privy-io/react-auth';

export function ConnectWallet() {
  const {
    logout: disconnectWallet,
    authenticated,
    user: walletUser,
    ready,
    login: loginOrLink,
  } = useWallet();

  const { wallets } = useWallets();
  const hasConnectedWallet = wallets.length > 0;

  const [presentWalletDetails] = useModal(WalletDetailsModal);
  const [presentWalletConnect] = useModal(WalletConnectModal);

  const walletAddress = walletUser?.wallet?.address;
  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : '';

  const handleOpenWalletModal = () => {
    if (!walletAddress) return;
    presentWalletDetails({
      address: walletAddress,
      onDisconnect: disconnectWallet,
    });
  };

  const handleConnectClick = () => {
    if (hasConnectedWallet && !authenticated) {
      // Wallet connected but not authenticated, trigger signature
      loginOrLink();
    } else {
      // No wallet connected, show custom selection modal
      presentWalletConnect();
    }
  };

  if (!ready) return null;

  if (authenticated) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex flex-col items-end">
          <span className="text-[10px] font-bold text-amber-500/80 flex items-center gap-1 leading-none mb-0.5 tracking-wider">
            <Icons.Network size={10} />
            TESTNET
          </span>
          <span className="text-xs font-mono font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
            {shortAddress}
          </span>
        </div>
        <Button
          onClick={handleOpenWalletModal}
          variant="outline"
          size="sm"
          className="gap-2 bg-zinc-900 border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 h-9 px-3 rounded-full transition-all"
        >
          <div className="w-5 h-5 rounded-full bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-[10px] shadow-sm">
            {shortAddress.slice(0, 2).toUpperCase()}
          </div>
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnectClick}
      disabled={!ready}
      variant="outline"
      size="sm"
      className="gap-2 bg-zinc-900/50 border-amber-500/20 hover:border-amber-500/50 hover:bg-zinc-900 text-amber-500 hover:text-amber-400 h-9 font-semibold transition-all shadow-[0_0_10px_-5px_theme(colors.amber.500/20)] hover:shadow-[0_0_15px_-5px_theme(colors.amber.500/30)]"
    >
      <Icons.Wallet size={14} />
      <span className="hidden sm:inline">
        {hasConnectedWallet ? 'Sign In with Wallet' : 'Connect Wallet'}
      </span>
      <span className="sm:hidden">
        {hasConnectedWallet ? 'Sign In' : 'Connect'}
      </span>
    </Button>
  );
}
