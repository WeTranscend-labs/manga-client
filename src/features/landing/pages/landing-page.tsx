'use client';

import { Page } from '@/components/layout/page';
import { Hero } from '@/features/landing/components/organisms/hero';

export function LandingV2Page() {
  return (
    <Page className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Hero />
    </Page>
  );
}
