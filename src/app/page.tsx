import {
  AnimatedMangaListSection,
  FeaturesSection,
  Footer,
  Header,
  Hero,
  RecentCreationsSection,
} from "@/features/landing";
import { VideoDemoSection } from "@/features/landing/components/video-demo-section";

export default function LandingPage() {
  return (
    <div className=" lg:px-50 sm:px-10 ">
      <Header />
      <Hero />
      <VideoDemoSection
        youtubeId="gFHGGryWHxw"
        title="How to Create Manga with AI Studio"
        subtitle="Create your own manga with AI - no drawing skills required. Learn everything from starting a new project to generating stunning manga pages."
      />
      <AnimatedMangaListSection />
      <RecentCreationsSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
}
