'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useModal } from '@/components/ui/modal';
import { useAuth, useIdentityLogin } from '@/hooks/use-auth';
import { cn } from '@/utils/utils';
import { usePrivy as useWallet, useWallets } from '@privy-io/react-auth';
import { WalletConnectModal } from './modals/wallet-connect-modal';
import { WalletDetailsModal } from './modals/wallet-details-modal';

interface ConnectWalletProps {
  className?: string;
}

export function ConnectWallet({ className }: ConnectWalletProps) {
  const {
    logout: disconnectWallet,
    authenticated: isWeb3Authenticated,
    user: walletUser,
    ready,
    login: loginOrLink,
  } = useWallet();

  const { wallets } = useWallets();
  const hasConnectedWallet = wallets.length > 0;

  const { isAuthenticated, isSyncing } = useAuth();
  const { mutate: identityLogin } = useIdentityLogin();

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
    if (hasConnectedWallet && !isWeb3Authenticated) {
      // Wallet connected but not authenticated, trigger signature
      loginOrLink();
    } else {
      // No wallet connected, show custom selection modal
      presentWalletConnect();
    }
  };

  if (!ready) return null;

  const isLoggingIn = isSyncing;

  if (isAuthenticated) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
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
      disabled={!ready || isLoggingIn}
      variant="outline"
      className={cn(
        'w-full rounded-xl h-10 gap-2 bg-zinc-950 border-amber-500/20 hover:border-amber-500/50 hover:bg-zinc-900/80 text-amber-500 hover:text-amber-400 font-semibold transition-all shadow-[0_0_10px_-5px_rgba(245,158,11,0.1)] hover:shadow-[0_0_15px_-5px_rgba(245,158,11,0.2)]',
        className,
      )}
    >
      {isLoggingIn ? (
        <>
          <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span>Signing In...</span>
        </>
      ) : (
        <>
          <Icons.Wallet size={16} />
          <span>
            {hasConnectedWallet ? 'Sign In with Wallet' : 'Connect Wallet'}
          </span>
        </>
      )}
    </Button>
  );
}
