import { cn } from '@/lib/utils';
import { getStageVisual, getStageAccent, type StageVisualIdentity } from '@/lib/stageVisuals';
import { StageGeometry } from '@/components/math/StageGeometry';

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
  const { index } = getStageVisual(stage);
  const accent = getStageAccent(stage);

  return (
    <span
      className={cn(
        'stage-level-icon inline-flex shrink-0 items-center justify-center border shadow-sm',
        sizeClasses[size],
        className,
      )}
      aria-hidden="true"
      style={{
        color: accent,
        borderColor: `${accent}40`,
        backgroundColor: `${accent}15`,
      }}
    >
      <StageGeometry
        variant={index}
        className={cn(iconSizeClasses[size], iconClassName)}
        strokeWidth={5}
      />
    </span>
  );
}
