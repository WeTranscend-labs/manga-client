'use client';

import { StudioHeader } from '@/features/studio/components/organisms/studio-header';
import { ReactNode } from 'react';

export default function StudioRoutesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 overflow-hidden">
      <StudioHeader />
      <main className="flex-1 flex overflow-hidden w-full h-full relative">
        {children}
      </main>
    </div>
  );
}
