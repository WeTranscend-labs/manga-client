import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';
import { Footer, Header } from '@/features/landing';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { Bangers, Geist_Mono, Inter } from 'next/font/google';
import { ReactNode, Suspense } from 'react';
import './globals.css';

const _bangers = Bangers({ weight: '400', subsets: ['latin'] });
const _geistMono = Geist_Mono({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Manga Studio - Create AI Manga Art',
  description:
    'Generate stunning manga illustrations with AI. Design custom manga pages with professional inking styles, screentones, and layouts.',
  generator: 'WeTranscend',
  authors: [{ name: 'WeTranscend', url: 'https://x.com/Tod' }],
  creator: 'WeTranscend',
  icons: {
    icon: [
      {
        url: '/logo.png',
        type: 'image/png',
      },
    ],
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-zinc-950 text-white`}
      >
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Suspense fallback={null}>
              <Header />
            </Suspense>
            <div className="flex-1 flex flex-col">
              <Suspense fallback={null}>{children}</Suspense>
            </div>
            <Footer />
          </div>
        </Providers>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
