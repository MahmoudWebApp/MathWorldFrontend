import { cn } from '@/lib/utils';
import { getStageVisual, type StageVisualIdentity } from '@/lib/stageVisuals';

interface StageIconBadgeProps {
  stage: StageVisualIdentity;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  iconClassName?: string;
}

const sizeClasses = {
  xs: 'h-6 w-6 rounded-lg',
  sm: 'h-10 w-10 rounded-xl',
  md: 'h-12 w-12 rounded-2xl',
  lg: 'h-16 w-16 rounded-2xl',
} as const;

const iconSizeClasses = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
} as const;

export function StageIconBadge({
  stage,
  size = 'md',
  className,
  iconClassName,
}: StageIconBadgeProps) {
  const { icon: Icon, style } = getStageVisual(stage);

  return (
    <span
      className={cn(
        'stage-level-icon inline-flex shrink-0 items-center justify-center border border-white/10 bg-gradient-to-br shadow-sm',
        style.bg,
        sizeClasses[size],
        className,
      )}
      aria-hidden="true"
    >
      <Icon
        className={cn(iconSizeClasses[size], style.iconColor, iconClassName)}
        strokeWidth={1.8}
      />
    </span>
  );
}
