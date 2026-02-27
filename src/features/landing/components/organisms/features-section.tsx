'use client';

export function FeaturesSection() {
  const features = [
    {
      title: 'AI-Powered Manga Generation',
      description:
        'Generate professional manga pages in seconds. Just describe your scene and watch it come to life.',
      skeleton: <SkeletonOne />,
      className:
        'col-span-1 lg:col-span-4 border-b lg:border-r dark:border-neutral-800',
    },
    {
      title: 'Character Consistency',
      description:
        'Keep your characters consistent across all pages with our Context feature. Define once, use forever.',
      skeleton: <SkeletonTwo />,
      className: 'border-b col-span-1 lg:col-span-2 dark:border-neutral-800',
    },
    {
      title: 'Multiple Manga Styles',
      description:
        'Choose from various manga styles: Shonen, Seinen, Shoujo, and more. Customize everything from inking to screentones.',
      skeleton: <SkeletonThree />,
      className: 'col-span-1 lg:col-span-3 lg:border-r dark:border-neutral-800',
    },
    {
      title: 'Session & PDF Export',
      description:
        'Organize your work in sessions and export to professional PDF. Perfect for creating complete manga chapters.',
      skeleton: <SkeletonFour />,
      className: 'col-span-1 lg:col-span-3 border-b lg:border-none',
    },
  ];

  return (
    <div className="relative z-20 py-10 lg:py-40 max-w-7xl mx-auto">
      <div className="px-8">
        <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-manga text-zinc-200">
          Everything You Need to Create Manga
        </h4>

        <p className="text-sm lg:text-base max-w-2xl my-4 mx-auto text-zinc-400 text-center font-normal">
          From character design to final PDF export, our AI-powered studio has
          all the tools you need to bring your manga stories to life.
        </p>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-6 mt-12 xl:border rounded-md dark:border-neutral-800">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className="h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

import { FeatureCard } from '../atoms/feature-card';
import { FeatureDescription } from '../atoms/feature-description';
import { FeatureTitle } from '../atoms/feature-title';
import {
  SkeletonFour,
  SkeletonOne,
  SkeletonThree,
  SkeletonTwo,
} from '../molecules/feature-skeletons';
