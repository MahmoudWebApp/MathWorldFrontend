'use client';

import { useLocale } from 'next-intl';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * A physical arrow chosen from the meaning of the action, not from CSS
 * rotation. All navigation actions must follow:
 *
 * Arabic (RTL): back/previous -> right, forward/next -> left.
 * English (LTR): back/previous -> left, forward/next -> right.
 *
 * This also works when a button sits inside a direction-isolated container.
 * Do not add rtl:rotate-180 or other mirroring utilities to this component.
 */
export function DirectionalArrow({
  direction,
  variant = 'arrow',
  size = 16,
  className,
}: {
  direction: 'back' | 'forward';
  variant?: 'arrow' | 'chevron';
  size?: number;
  className?: string;
}) {
  const isArabic = useLocale() === 'ar';
  const pointsRight = isArabic
    ? direction === 'back'
    : direction === 'forward';
  const Icon = variant === 'chevron'
    ? (pointsRight ? ChevronRight : ChevronLeft)
    : (pointsRight ? ArrowRight : ArrowLeft);

  return <Icon size={size} className={className} aria-hidden="true" />;
}
