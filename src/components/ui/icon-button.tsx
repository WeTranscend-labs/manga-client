/**
 * IconButton
 * A round/square toolbar button that wraps a single icon.
 * Uses the `icon-ghost` variant of <Button> so it inherits all base styles
 * and is consistent across every toolbar/header in the app.
 *
 * Usage:
 *   <IconButton onClick={toggle} title="Close" size="icon-sm">
 *     <Icons.X />
 *   </IconButton>
 */
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/utils/utils';
import { type VariantProps } from 'class-variance-authority';
import * as React from 'react';

type IconButtonSize = 'icon' | 'icon-sm' | 'icon-xs' | 'icon-lg';

interface IconButtonProps
  extends
    React.ComponentProps<'button'>,
    Omit<VariantProps<typeof buttonVariants>, 'variant' | 'size'> {
  /** Override size — defaults to 'icon-sm' */
  size?: IconButtonSize;
  /** Optional extra classes */
  className?: string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = 'icon-sm', className, children, ...props }, ref) => (
    <Button
      ref={ref}
      variant="icon-ghost"
      size={size}
      className={cn('rounded-lg', className)}
      {...props}
    >
      {children}
    </Button>
  ),
);
IconButton.displayName = 'IconButton';

export { IconButton };
