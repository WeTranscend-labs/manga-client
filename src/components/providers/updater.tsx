'use client';

import { useAuthEvents } from '@/features/auth';
import { useUIEffects } from '@/hooks';

export const Updater = () => {
  useAuthEvents();
  useUIEffects();

  return null;
};
