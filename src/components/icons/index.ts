import * as LucideIcons from 'lucide-react';
import { CoinbaseIcon } from './coinbase';
import { LogoIcon } from './logo';
import { MetamaskIcon } from './metamask';
import { PhantomIcon } from './phantom';
import { RainbowIcon } from './rainbow';

export const Icons = {
  Coinbase: CoinbaseIcon,
  Logo: LogoIcon,
  Metamask: MetamaskIcon,
  Phantom: PhantomIcon,
  Rainbow2: RainbowIcon,
  ...LucideIcons,
} as const;

export type IconType = typeof Icons;
