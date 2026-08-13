export interface StageBrandStyle {
  from: string;
  to: string;
  bg: string;
  iconColor: string;
  hoverText: string;
  hoverBg: string;
  hoverShadow: string;
  spotlight: string;
}

export interface CategoryBrandStyle {
  from: string;
  to: string;
  bg: string;
  hoverText: string;
  hoverShadow: string;
  spotlight: string;
}

export const STAGE_BRAND_STYLES: StageBrandStyle[] = [
  {
    from: 'from-brand-primary',
    to: 'to-brand-secondary',
    bg: 'from-brand-primary/20 to-brand-secondary/10',
    iconColor: 'text-brand-primary-strong dark:text-brand-primary-light',
    hoverText: 'group-hover:text-brand-primary-strong dark:group-hover:text-brand-primary-light',
    hoverBg: 'group-hover:bg-brand-primary-strong',
    hoverShadow: 'hover:shadow-brand-primary/20',
    spotlight: 'rgba(92, 36, 255, 0.18)',
  },
  {
    from: 'from-brand-secondary',
    to: 'to-brand-primary',
    bg: 'from-brand-secondary/18 to-brand-primary/10',
    iconColor: 'text-brand-secondary-strong dark:text-brand-secondary-light',
    hoverText: 'group-hover:text-brand-secondary-strong dark:group-hover:text-brand-secondary-light',
    hoverBg: 'group-hover:bg-brand-secondary-strong',
    hoverShadow: 'hover:shadow-brand-secondary/20',
    spotlight: 'rgba(255, 35, 153, 0.18)',
  },
  {
    from: 'from-brand-primary-strong',
    to: 'to-brand-primary-light',
    bg: 'from-brand-primary/18 to-brand-primary-light/8',
    iconColor: 'text-brand-primary dark:text-brand-primary-light',
    hoverText: 'group-hover:text-brand-primary dark:group-hover:text-brand-primary-light',
    hoverBg: 'group-hover:bg-brand-primary',
    hoverShadow: 'hover:shadow-brand-primary/20',
    spotlight: 'rgba(92, 36, 255, 0.18)',
  },
  {
    from: 'from-brand-secondary-strong',
    to: 'to-brand-secondary-light',
    bg: 'from-brand-secondary/16 to-brand-secondary-light/8',
    iconColor: 'text-brand-secondary-strong dark:text-brand-secondary-light',
    hoverText: 'group-hover:text-brand-secondary-strong dark:group-hover:text-brand-secondary-light',
    hoverBg: 'group-hover:bg-brand-secondary-strong',
    hoverShadow: 'hover:shadow-brand-secondary/20',
    spotlight: 'rgba(216, 7, 121, 0.16)',
  },
];

export const CATEGORY_BRAND_STYLES: CategoryBrandStyle[] = [
  {
    from: 'from-brand-primary',
    to: 'to-brand-secondary',
    bg: 'bg-brand-primary/10',
    hoverText: 'group-hover:text-brand-primary-strong dark:group-hover:text-brand-primary-light',
    hoverShadow: 'hover:shadow-brand-primary/20',
    spotlight: 'rgba(92, 36, 255, 0.16)',
  },
  {
    from: 'from-brand-secondary',
    to: 'to-brand-primary',
    bg: 'bg-brand-secondary/10',
    hoverText: 'group-hover:text-brand-secondary-strong dark:group-hover:text-brand-secondary-light',
    hoverShadow: 'hover:shadow-brand-secondary/20',
    spotlight: 'rgba(255, 35, 153, 0.16)',
  },
  {
    from: 'from-brand-primary-strong',
    to: 'to-brand-primary-light',
    bg: 'bg-brand-primary/8',
    hoverText: 'group-hover:text-brand-primary dark:group-hover:text-brand-primary-light',
    hoverShadow: 'hover:shadow-brand-primary/20',
    spotlight: 'rgba(92, 36, 255, 0.16)',
  },
  {
    from: 'from-brand-secondary-strong',
    to: 'to-brand-secondary-light',
    bg: 'bg-brand-secondary/8',
    hoverText: 'group-hover:text-brand-secondary-strong dark:group-hover:text-brand-secondary-light',
    hoverShadow: 'hover:shadow-brand-secondary/20',
    spotlight: 'rgba(216, 7, 121, 0.14)',
  },
  {
    from: 'from-brand-primary-light',
    to: 'to-brand-secondary-light',
    bg: 'bg-brand-primary-light/8',
    hoverText: 'group-hover:text-brand-primary-strong dark:group-hover:text-brand-primary-light',
    hoverShadow: 'hover:shadow-brand-primary/15',
    spotlight: 'rgba(138, 102, 255, 0.14)',
  },
  {
    from: 'from-brand-secondary-light',
    to: 'to-brand-primary',
    bg: 'bg-brand-secondary-light/8',
    hoverText: 'group-hover:text-brand-secondary-strong dark:group-hover:text-brand-secondary-light',
    hoverShadow: 'hover:shadow-brand-secondary/15',
    spotlight: 'rgba(255, 106, 185, 0.14)',
  },
];

export const MATH_CARD_SYMBOLS = [
  { symbol: 'x²', equation: 'ax² + bx + c = 0' },
  { symbol: 'πr²', equation: 'A = πr²' },
  { symbol: '∫', equation: '∫ f(x) dx' },
  { symbol: 'σ', equation: 'μ ± σ' },
  { symbol: 'n!', equation: 'n! = n(n-1)…1' },
  { symbol: 'P(A)', equation: 'P(A) = n(A) / n(S)' },
  { symbol: 'sinθ', equation: 'sin²θ + cos²θ = 1' },
  { symbol: '[A]', equation: 'Ax = λx' },
  { symbol: '∑', equation: '∑ xᵢ' },
  { symbol: '∂', equation: '∂f/∂x' },
  { symbol: '∇', equation: '∇ × F' },
  { symbol: '∞', equation: 'lim x→∞' },
];
