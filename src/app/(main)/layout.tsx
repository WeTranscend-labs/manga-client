'use client';

import { Footer } from '@/features/landing/components/organisms/footer';
import { Header } from '@/features/landing/components/organisms/header';
import { ReactNode } from 'react';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
