import { billingService, type CreditPack } from '@/services/billing.service';
import { useQuery } from '@tanstack/react-query';

export function useCreditPacks() {
  return useQuery<CreditPack[], Error>({
    queryKey: ['credit-packs'],
    queryFn: async () => {
      return billingService.getCreditPacks();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
