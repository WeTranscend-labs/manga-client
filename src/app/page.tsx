import { Page } from '@/components/layout/page';
import {
  AnimatedMangaListSection,
  AutoContinueSection,
  FeaturesSection,
  Hero,
  HolographicShowcaseSection,
  RecentCreationsSection,
} from '@/features/landing';

export default function LandingPage() {
  return (
    <Page className="py-12 lg:px-50 sm:px-10">
      <Hero />
      <AutoContinueSection />
      <AnimatedMangaListSection />
      <HolographicShowcaseSection />
      <RecentCreationsSection />
      <FeaturesSection />
    </Page>
  );
}
