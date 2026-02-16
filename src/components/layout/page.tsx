import { cn } from '@/utils/utils';
import { ReactNode } from 'react';

interface GlobalPageProps {
  children: ReactNode;
  className?: string;
}

export function Page({ children, className }: GlobalPageProps) {
  return (
    <main
      className={cn('flex-1 container mx-auto px-4 sm:px-6 lg:px-8', className)}
    >
      {children}
    </main>
  );
}
