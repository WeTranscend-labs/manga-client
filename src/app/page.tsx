import {
  AnimatedMangaListSection,
  AutoContinueSection,
  FeaturesSection,
  Footer,
  Header,
  Hero,
  HolographicShowcaseSection,
  RecentCreationsSection,
} from '@/features/landing';

export default function LandingPage() {
  return (
    <div className=" lg:px-50 sm:px-10 ">
      <Header />
      <Hero />
      <AutoContinueSection />
      <AnimatedMangaListSection />
      <HolographicShowcaseSection />
      <RecentCreationsSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
}
