import { cn } from '@/lib/utils';
import { BrandMark } from '@/components/layout/BrandMark';

interface BrandLogoProps {
  compact?: boolean;
  className?: string;
}

export function BrandLogo({ compact = false, className }: BrandLogoProps) {
  return (
    <div className={cn(compact ? 'brand-logo-lockup' : 'brand-logo-lockup brand-logo-lockup-large', className)}>
      <span className={cn('brand-mark-shell', !compact && 'brand-mark-shell-large')}>
        <BrandMark className={compact ? 'h-11 w-11' : 'h-16 w-16'} />
      </span>
      <span className={cn('brand-wordmark sr-title-accent font-extrabold tracking-tight', compact ? 'hidden text-[1.08rem] min-[430px]:inline' : 'text-2xl')} dir="ltr">
        MathWorld
      </span>
    </div>
  );
}
