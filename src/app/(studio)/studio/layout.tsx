'use client';

import { StudioHeader } from '@/features/studio/components/studio-header';
import { ReactNode, Suspense } from 'react';

export default function StudioRoutesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 overflow-hidden">
      <Suspense
        fallback={<div className="h-14 sm:h-16 bg-zinc-900 animate-pulse" />}
      >
        <StudioHeader />
      </Suspense>
      <main className="flex-1 flex overflow-hidden w-full h-full relative">
        {children}
      </main>
    </div>
  );
}
