import { planService } from '@/services/plan.service';
import { useQuery } from '@tanstack/react-query';

export const usePlans = () => {
  return useQuery({
    queryKey: ['plans'],
    queryFn: () => planService.getAllPlans(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
