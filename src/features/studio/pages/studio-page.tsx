'use client';

import { Page } from '@/components/layout/page';
import { MangaStudio } from '@/features/studio';

export function StudioPage() {
  return (
    <Page className="bg-zinc-950 text-white min-h-[calc(100vh-4rem)]">
      <MangaStudio />
    </Page>
  );
}
