import { Page } from '@/components/layout/page';
import { AnimatedMangaListSection } from '@/features/landing/components/organisms/animated-manga-list-section';
import { FeaturesSection } from '@/features/landing/components/organisms/features-section';
import { Hero } from '@/features/landing/components/organisms/hero';
import { RecentCreationsSection } from '@/features/landing/components/organisms/recent-creations-section';
import { VideoDemoSection } from '@/features/landing/components/organisms/video-demo-section';

export default function LandingPage() {
  return (
    <Page className="py-12 lg:px-50 sm:px-10">
      <Hero />
      <VideoDemoSection
        youtubeId="gFHGGryWHxw"
        title="How to Create Manga with AI Studio"
        subtitle="Create your own manga with AI - no drawing skills required. Learn everything from starting a new project to generating stunning manga pages."
      />
      <AnimatedMangaListSection />
      <RecentCreationsSection />
      <FeaturesSection />
    </Page>
  );
}
