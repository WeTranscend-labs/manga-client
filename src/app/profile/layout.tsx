'use client';

import { Footer, Header } from '@/features/landing';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:px-60 sm:px-10 flex flex-col bg-zinc-950">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
