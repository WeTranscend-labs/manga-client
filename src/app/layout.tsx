import { Providers } from '@/components/providers';
import type { Metadata } from 'next';
import { Bangers, Geist_Mono, Inter } from 'next/font/google';
import { ReactNode } from 'react';
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
        className={`${inter.variable} ${_bangers.className} ${_geistMono.className} font-sans antialiased bg-zinc-950 text-white`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
