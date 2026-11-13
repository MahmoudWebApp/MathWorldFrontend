'use client';

import { useLocale } from 'next-intl';
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';
import type { ComponentProps } from 'react';

export type NavigationDirection = 'back' | 'forward';

/**
 * One source of truth for semantic navigation direction.
 * Arabic: back/previous is RIGHT, forward/next is LEFT.
 * English: back/previous is LEFT, forward/next is RIGHT.
 *
 * Never add rtl:rotate-180 to this icon; the glyph is selected explicitly.
 */
export function DirectionalChevron({
  direction,
  ...props
}: { direction: NavigationDirection } & Omit<ComponentProps<typeof ChevronLeft>, 'ref'>) {
  const rtl = useLocale() === 'ar';
  const Icon = (direction === 'back') === rtl ? ChevronRight : ChevronLeft;
  return <Icon aria-hidden="true" {...props} />;
}

export function DirectionalArrow({
  direction,
  ...props
}: { direction: NavigationDirection } & Omit<ComponentProps<typeof ArrowLeft>, 'ref'>) {
  const rtl = useLocale() === 'ar';
  const Icon = (direction === 'back') === rtl ? ArrowRight : ArrowLeft;
  return <Icon aria-hidden="true" {...props} />;
}
