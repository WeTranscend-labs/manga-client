import { ApiEndpoints } from '@/constants/server';
import { ApiClient } from '@/services/api-client';
import { Plan } from '@/types/plans';

class PlanService extends ApiClient {
  /**
   * Fetch all available subscription plans
   * @returns Array of available plans natively from the backend
   */
  async getAllPlans(): Promise<Plan[]> {
    return this.get<Plan[]>(ApiEndpoints.PLANS_LIST);
  }
}

export const planService = new PlanService();
