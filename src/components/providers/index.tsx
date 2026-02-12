import { ReactNode } from 'react';
import { AuthProvider } from './auth-provider';
import { UIProvider } from './ui-provider';

import { QueryProvider } from './query-provider';
import { Updater } from './updater';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <UIProvider>
        <AuthProvider>
          <Updater />
          {children}
        </AuthProvider>
      </UIProvider>
    </QueryProvider>
  );
}
