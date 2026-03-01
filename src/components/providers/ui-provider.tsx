'use client';

import { ModalContainer } from '@/components/ui/modal';
import { NotificationContainer } from '@/components/ui/notification';
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes';
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';

export function UIProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      {...props}
    >
      <NextTopLoader color="#f59e0b" showSpinner={false} />
      {children}
      <Toaster />
      <ModalContainer />
      <NotificationContainer />
    </NextThemesProvider>
  );
}
