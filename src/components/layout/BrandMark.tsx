import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BrandMarkProps {
  className?: string;
  title?: string;
  priority?: boolean;
}

/**
 * Uses the original MathWorld mark artwork, cropped to the symbol only.
 * The artwork keeps the original cap / sigma / x² geometry and is recolored
 * to the SR brand palette without redrawing the logo.
 */
export function BrandMark({
  className,
  title = 'MathWorld',
  priority = false,
}: BrandMarkProps) {
  return (
    <Image
      src="/mathworld-mark-v2.png"
      alt={title}
      width={512}
      height={512}
      priority={priority}
      className={cn('shrink-0 object-contain', className)}
    />
  );
}
