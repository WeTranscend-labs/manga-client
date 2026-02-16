import { AppApiClient } from './app-api-client';

export interface CreateDepositResponse {
  depositId: string;
  amount: number;
  currency: string;
  status: string;
  // Add other fields as per API standard if needed
}

export interface DepositStatusResponse {
  depositId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  amount: number;
  txHash?: string;
}

export class DepositService extends AppApiClient {
  /**
   * Create a new deposit session
   * POST /deposit/create
   */
  async createDeposit(amount: number): Promise<CreateDepositResponse> {
    return this.post<CreateDepositResponse>('/api/deposit/create', { amount });
  }

  /**
   * Submit transaction hash for a deposit
   * POST /deposit/submit
   */
  async submitTransaction(depositId: string, txHash: string): Promise<void> {
    return this.post('/api/deposit/submit', { depositId, txHash });
  }

  /**
   * Check deposit status (Fallback polling)
   * GET /deposit/check?depositId=uuid
   */
  async checkDepositStatus(depositId: string): Promise<DepositStatusResponse> {
    return this.get<DepositStatusResponse>(
      `/api/deposit/check?depositId=${depositId}`,
    );
  }
}

export const depositService = new DepositService();
