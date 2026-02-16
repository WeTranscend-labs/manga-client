import { DEFAULT_CHAIN } from '@/constants/chains';
import { useIdentityLogin } from '@/hooks/use-auth';
import {
  useIdentityToken,
  useLoginWithSiwe,
  usePrivy,
  useWallets,
} from '@privy-io/react-auth';
import { useState } from 'react';
import { toast } from 'sonner';

export function useWalletLogin(onSuccess?: () => void) {
  const { wallets } = useWallets();
  const { authenticated, ready } = usePrivy();
  const { identityToken } = useIdentityToken();
  const { mutate: identityLogin, isPending: isSyncing } = useIdentityLogin();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { generateSiweMessage, loginWithSiwe } = useLoginWithSiwe({
    onComplete: async ({ user }) => {
      console.log('[useWalletLogin] Privy login complete:', user);
      try {
        // ✅ Use Identity Token (OIDC) for backend verification
        if (identityToken) {
          console.log(
            '[useWalletLogin] Syncing with backend using Identity Token...',
          );
          identityLogin(identityToken, {
            onSuccess: () => {
              console.log('[useWalletLogin] Backend sync successful');
              onSuccess?.();
            },
            onError: (err) => {
              console.error('[useWalletLogin] Backend sync failed:', err);
              toast.error('Giao tiếp với server thất bại', {
                description: err.message,
              });
            },
          });
        } else {
          console.warn('[useWalletLogin] No identity token available yet');
        }
      } catch (error) {
        console.error('[useWalletLogin] Failed to sync:', error);
      } finally {
        setIsLoggingIn(false);
      }
    },
    onError: (error) => {
      console.error('[useWalletLogin] SIWE login failed:', error);
      setIsLoggingIn(false);
      toast.error('Đăng nhập ví thất bại', {
        description: error.message,
      });
    },
  });

  const loginWithWallet = async (walletId: string) => {
    if (!ready || isLoggingIn || isSyncing) return;

    setIsLoggingIn(true);
    try {
      const activeWallet = wallets.find((w) => {
        if (walletId === 'metamask') return w.walletClientType === 'metamask';
        if (walletId === 'coinbase_wallet')
          return w.walletClientType === 'coinbase_wallet';
        if (walletId === 'phantom') return w.walletClientType === 'phantom';
        if (walletId === 'rainbow') return w.walletClientType === 'rainbow';
        return false;
      });

      if (!activeWallet) {
        console.warn(`[useWalletLogin] Wallet ${walletId} not found.`);
        setIsLoggingIn(false);
        return;
      }

      if (authenticated) {
        console.log('[useWalletLogin] Already authenticated, syncing...');
        if (identityToken) {
          identityLogin(identityToken, {
            onSuccess: () => onSuccess?.(),
            onSettled: () => setIsLoggingIn(false),
          });
        } else {
          setIsLoggingIn(false);
        }
        return;
      }

      console.log('[useWalletLogin] Generating SIWE message...');
      const message = await generateSiweMessage({
        address: activeWallet.address,
        chainId: `eip155:${DEFAULT_CHAIN.id}`,
      });

      console.log('[useWalletLogin] Requesting signature...');
      const signature = await activeWallet.sign(message);

      console.log('[useWalletLogin] Completing login with SIWE...');
      await loginWithSiwe({ signature, message });
    } catch (error: any) {
      if (error?.message?.includes('already authenticated')) {
        if (identityToken) {
          identityLogin(identityToken, {
            onSuccess: () => onSuccess?.(),
          });
        }
      } else {
        console.error('[useWalletLogin] Error:', error);
        toast.error('Lỗi kết nối ví');
      }
      setIsLoggingIn(false);
    }
  };

  return {
    loginWithWallet,
    isLoading: isLoggingIn || isSyncing,
    isReady: ready,
    isAuthenticated: authenticated,
  };
}
