'use client';

import { ModalContainer } from '@/components/ui/modal';
import { NotificationContainer } from '@/components/ui/notification';
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes';
import { Toaster } from 'sonner';

export function UIProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      {...props}
    >
      {children}
      <Toaster />
      <ModalContainer />
      <NotificationContainer />
    </NextThemesProvider>
  );
}
