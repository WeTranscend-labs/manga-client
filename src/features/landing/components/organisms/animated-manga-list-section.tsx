'use client';

import Image from 'next/image';

import { AnimatedList } from '../molecules/animated-list';

const MANGA_ITEMS = [
  {
    title: 'Neon Knights: Chapter 01',
    user: '@akira',
    image: '/demo-img/demoimg1.png',
  },
  {
    title: 'Foxfire Shrine Incident',
    user: '@hana',
    image: '/demo-img/demoimg2.png',
  },
  {
    title: 'Skyline Chase Across Tokyo',
    user: '@kaito',
    image: '/demo-img/demoimg3.png',
  },
  {
    title: 'Midnight Duel on the Bridge',
    user: '@yui',
    image: '/demo-img/demoimg4.png',
  },
  {
    title: 'Crimson Alley Pact',
    user: '@ren',
    image: '/demo-img/demoimg5.png',
  },
  {
    title: 'Echoes of the Rooftop',
    user: '@mika',
    image: '/demo-img/demoimg6.png',
  },
];

export function AnimatedMangaListSection() {
  return (
    <section className=" my-16  px-4">
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <h2
          className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/80"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          Animated Story Reel
        </h2>
        <p className="font-manga text-2xl sm:text-3xl text-zinc-50">
          A continuous stream of stories made with Manga Studio.
        </p>
      </div>

      <div className="relative h-[820px] w-full overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/70">
        <AnimatedList stackGap={28} columnGap={400} scaleFactor={0.03}>
          {MANGA_ITEMS.map((item, index) => (
            <div
              key={index}
              className="w-full max-w-[390px] overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/80 shadow-md"
            >
              <div className="relative w-full overflow-hidden">
                <div className="aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 600px) 100vw, 400px"
                  />
                </div>
              </div>
            </div>
          ))}
        </AnimatedList>
      </div>
    </section>
  );
}
