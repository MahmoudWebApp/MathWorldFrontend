import {
  Calculator,
  Compass,
  FunctionSquare,
  Infinity as InfinityIcon,
  type LucideIcon,
} from 'lucide-react';

import { STAGE_BRAND_STYLES, type StageBrandStyle } from '@/lib/brand';

export interface StageVisualIdentity {
  Id?: number;
  Order?: number;
  NameAr?: string | null;
  NameEn?: string | null;
  Name?: string | null;
}

export interface StageVisual {
  index: number;
  ordinal: number;
  icon: LucideIcon;
  style: StageBrandStyle;
  toneClass: `stage-tone-${number}`;
}

const STAGE_ICONS: readonly LucideIcon[] = [
  Calculator,
  Compass,
  FunctionSquare,
  InfinityIcon,
];

function getIndexFromName(name?: string | null): number | null {
  if (!name) return null;

  const normalized = name.trim().toLowerCase();

  if (/ابتد|elementary|primary/.test(normalized)) return 0;
  if (/إعداد|اعداد|middle|intermediate/.test(normalized)) return 1;
  if (/ثانو|high school|secondary/.test(normalized)) return 2;
  if (/جامع|univers/.test(normalized)) return 3;

  return null;
}

export function getStageVisualIndex(stage: StageVisualIdentity): number {
  const nameIndex =
    getIndexFromName(stage.NameAr) ??
    getIndexFromName(stage.NameEn) ??
    getIndexFromName(stage.Name);

  if (nameIndex !== null) return nameIndex;

  if (typeof stage.Order === 'number' && Number.isFinite(stage.Order)) {
    if (stage.Order >= 1 && stage.Order <= STAGE_ICONS.length) return stage.Order - 1;
    if (stage.Order >= 0 && stage.Order < STAGE_ICONS.length) return stage.Order;
  }

  const stableId =
    typeof stage.Id === 'number' && Number.isFinite(stage.Id)
      ? Math.max(1, stage.Id)
      : 1;

  return (stableId - 1) % STAGE_ICONS.length;
}

export function getStageVisual(stage: StageVisualIdentity): StageVisual {
  const index = getStageVisualIndex(stage);

  return {
    index,
    ordinal: index + 1,
    icon: STAGE_ICONS[index],
    style: STAGE_BRAND_STYLES[index % STAGE_BRAND_STYLES.length],
    toneClass: `stage-tone-${index}`,
  };
}

export function sortStagesByOrder<T extends { Order?: number; Id: number }>(stages: readonly T[]): T[] {
  return [...stages].sort((a, b) => {
    const orderA = typeof a.Order === 'number' ? a.Order : Number.MAX_SAFE_INTEGER;
    const orderB = typeof b.Order === 'number' ? b.Order : Number.MAX_SAFE_INTEGER;
    const orderDiff = orderA - orderB;
    return orderDiff || a.Id - b.Id;
  });
}
