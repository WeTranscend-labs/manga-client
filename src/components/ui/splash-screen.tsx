'use client';

import { Logo } from '@/components/ui/logo';
import { cn } from '@/utils/utils';
import { motion } from 'framer-motion';

export function SplashScreen({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 overflow-hidden',
        className,
      )}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.8,
          ease: 'easeOut',
        }}
        className="relative z-10 flex flex-col items-center gap-8"
      >
        <Logo size="lg" showText={false} />

        <div className="flex flex-col items-center gap-3">
          <motion.h1
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="font-manga text-2xl sm:text-3xl text-zinc-200 tracking-widest"
          >
            MANGA STUDIO
          </motion.h1>
        </div>
      </motion.div>
    </div>
  );
}
