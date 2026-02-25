/**
 * PreviewButton
 * The distinctive amber 3D "press" action button used in the studio header.
 * Wraps <Button variant="primary-3d"> so behaviour is centralised.
 *
 * Usage:
 *   <PreviewButton onClick={goToPreview} count={3} />
 */
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';
import * as React from 'react';

interface PreviewButtonProps extends React.ComponentProps<'button'> {
  /** Number to show in parentheses next to the label */
  count?: number;
  /** Icon rendered before the label */
  icon?: React.ReactNode;
  /** Button label, defaults to "PREVIEW" */
  label?: string;
  /** Extra classes */
  className?: string;
}

const PreviewButton = React.forwardRef<HTMLButtonElement, PreviewButtonProps>(
  ({ count, icon, label = 'PREVIEW', className, style, ...props }, ref) => (
    <Button
      ref={ref}
      variant="primary-3d"
      size="sm"
      className={cn(
        'text-[10px] sm:text-xs lg:text-sm px-2.5 sm:px-4 lg:px-5 py-1.5 sm:py-2 h-auto',
        className,
      )}
      style={{ fontFamily: 'var(--font-inter)', ...style }}
      {...props}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {/* Mobile: show count inline */}
      {count !== undefined && (
        <span className="sm:hidden font-bold">({count})</span>
      )}
      {/* Desktop: show count after label */}
      {count !== undefined && count > 0 && (
        <span className="hidden sm:inline text-[10px] lg:text-xs ml-0.5">
          ({count})
        </span>
      )}
    </Button>
  ),
);
PreviewButton.displayName = 'PreviewButton';

export { PreviewButton };
