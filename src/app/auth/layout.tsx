import { TestimonialCard } from '@/features/auth/components/testimonial-card';
import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center bg-zinc-950">
      <div className="container mx-auto py-10 md:py-20 max-w-6xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:gap-20 items-center">
          <div className="flex flex-col max-w-md mx-auto w-full">
            {children}
          </div>
          <div className="hidden md:flex md:justify-end">
            <div className="w-full">
              <TestimonialCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
