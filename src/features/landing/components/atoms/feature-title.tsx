import React from 'react';

export const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className="max-w-5xl mx-auto text-left tracking-tight text-zinc-200 text-xl md:text-2xl md:leading-snug font-bold">
      {children}
    </p>
  );
};
