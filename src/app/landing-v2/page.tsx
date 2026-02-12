import { Header } from '@/features/landing/components/header';
import { Hero } from '@/features/landing/components/hero';

export default function LandingV2Page() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main>
        <Hero />
      </main>
    </div>
  );
}
