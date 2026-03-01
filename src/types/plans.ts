export interface Plan {
  id: 'free' | 'pro' | 'ultra' | string;
  name: string;
  description: string;
  price: number;
  monthlyGenerationLimit: number; // -1 represents unlimited
  storageLimit: number;
  features: string[];
}
