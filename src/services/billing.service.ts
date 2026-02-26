import { ApiEndpoints } from '@/constants/server';
import { ApiClient } from '@/services/api-client';
import { formatUrl } from '@/utils/api-formatter';

export interface CreateTopUpResponse {
  top_up_id: string;
  amount: number;
}

export interface TopUpStatusResponse {
  top_up_id: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
}

export class BillingService extends ApiClient {
  async initiateTopUp(amount: number): Promise<CreateTopUpResponse> {
    return this.post<CreateTopUpResponse>(ApiEndpoints.BILLING_TOP_UP, {
      amount,
    });
  }

  async submitTransaction(
    topUpId: string,
    txHash: string,
  ): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>(ApiEndpoints.BILLING_TOP_UP_SUBMIT, {
      top_up_id: topUpId,
      tx_hash: txHash,
    });
  }

  async getTopUpStatus(topUpId: string): Promise<TopUpStatusResponse> {
    const url = formatUrl(ApiEndpoints.BILLING_TOP_UP_STATUS, {
      topUpId,
    });
    return this.get<TopUpStatusResponse>(url);
  }
}

export const billingService = new BillingService();
