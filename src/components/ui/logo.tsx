import { cn } from '@/utils/utils';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const sizeConfig = {
  sm: {
    container: 'w-8 h-8 sm:w-10 sm:h-10 rounded-lg',
    image: '32px, 40px',
    text: 'text-sm sm:text-base lg:text-lg',
  },
  md: {
    container: 'w-20 h-10 rounded-lg',
    image: '80px',
    text: 'text-xl',
  },
  lg: {
    container: 'w-24 h-12 rounded-xl',
    image: '96px',
    text: 'text-2xl',
  },
};

export function Logo({ className, size = 'md', showText = true }: LogoProps) {
  const config = sizeConfig[size];

  return (
    <div className={cn('flex items-center gap-2 shrink-0', className)}>
      <div
        className={cn(
          'relative overflow-hidden border border-transparent bg-transparent flex items-center justify-center',
          config.container,
          size === 'sm' &&
            'bg-white/5 border-zinc-800/50 ring-1 ring-zinc-700/30',
        )}
      >
        <Image
          src="/logo.png"
          alt="Manga Studio logo"
          fill
          className="object-contain p-1"
          sizes={`(max-width: 640px) ${config.image}`}
        />
      </div>
      {showText && (
        <h1
          className={cn(
            'font-manga text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]',
            size === 'sm' ? 'hidden sm:block' : '',
            config.text,
          )}
        >
          MANGA STUDIO
        </h1>
      )}
    </div>
  );
}
