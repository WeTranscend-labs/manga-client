import { PricingPage } from '@/features/billing/pages/pricing-page';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing | Manga Studio',
  description: 'Purchase credit packs to generate your manga stories.',
};

export default function PricingRoute() {
  return <PricingPage />;
}
