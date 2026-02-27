import { cn } from '@/utils/utils';
import React from 'react';

export const FeatureDescription = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  return (
    <p
      className={cn(
        'text-sm md:text-base max-w-4xl text-left mx-auto',
        'text-zinc-500 font-normal',
        'text-left max-w-sm mx-0 md:text-sm my-2',
      )}
    >
      {children}
    </p>
  );
};
