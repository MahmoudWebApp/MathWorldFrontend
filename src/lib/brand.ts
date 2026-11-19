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
    from: 'from-cyan-600', to: 'to-cyan-500', bg: 'from-cyan-500/15 to-cyan-500/5',
    iconColor: 'text-cyan-700 dark:text-cyan-300',
    hoverText: 'group-hover:text-cyan-700 dark:group-hover:text-cyan-300',
    hoverBg: 'group-hover:bg-cyan-600', hoverShadow: 'hover:shadow-cyan-500/15',
    spotlight: 'rgba(8, 126, 153, 0.16)',
  },
  {
    from: 'from-orange-600', to: 'to-orange-500', bg: 'from-orange-500/15 to-orange-500/5',
    iconColor: 'text-orange-700 dark:text-orange-300',
    hoverText: 'group-hover:text-orange-700 dark:group-hover:text-orange-300',
    hoverBg: 'group-hover:bg-orange-600', hoverShadow: 'hover:shadow-orange-500/15',
    spotlight: 'rgba(192, 91, 24, 0.16)',
  },
  {
    from: 'from-emerald-600', to: 'to-emerald-500', bg: 'from-emerald-500/15 to-emerald-500/5',
    iconColor: 'text-emerald-700 dark:text-emerald-300',
    hoverText: 'group-hover:text-emerald-700 dark:group-hover:text-emerald-300',
    hoverBg: 'group-hover:bg-emerald-600', hoverShadow: 'hover:shadow-emerald-500/15',
    spotlight: 'rgba(33, 120, 95, 0.16)',
  },
  {
    from: 'from-violet-600', to: 'to-violet-500', bg: 'from-violet-500/15 to-violet-500/5',
    iconColor: 'text-violet-700 dark:text-violet-300',
    hoverText: 'group-hover:text-violet-700 dark:group-hover:text-violet-300',
    hoverBg: 'group-hover:bg-violet-600', hoverShadow: 'hover:shadow-violet-500/15',
    spotlight: 'rgba(121, 55, 195, 0.16)',
  },
];

export const CATEGORY_BRAND_STYLES: CategoryBrandStyle[] = [
  {
    from: 'from-brand-primary',
    to: 'to-brand-secondary',
    bg: 'bg-brand-primary/10',
    hoverText: 'group-hover:text-brand-primary-strong dark:group-hover:text-brand-primary-light',
    hoverShadow: 'hover:shadow-brand-primary/20',
    spotlight: 'rgba(109, 40, 217, 0.16)',
  },
  {
    from: 'from-brand-secondary',
    to: 'to-brand-primary',
    bg: 'bg-brand-secondary/10',
    hoverText: 'group-hover:text-brand-secondary-strong dark:group-hover:text-brand-secondary-light',
    hoverShadow: 'hover:shadow-brand-secondary/20',
    spotlight: 'rgba(236, 72, 153, 0.16)',
  },
  {
    from: 'from-brand-primary-strong',
    to: 'to-brand-primary-light',
    bg: 'bg-brand-primary/8',
    hoverText: 'group-hover:text-brand-primary dark:group-hover:text-brand-primary-light',
    hoverShadow: 'hover:shadow-brand-primary/20',
    spotlight: 'rgba(109, 40, 217, 0.16)',
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

// Match the four educational stage identities already used by StagePremiumCard
// and Flutter's AppColors.stageCyan/Orange/Green/Violet. Unlike category-id
// cycling, this keeps every topic in one stage visually related.
export const STAGE_CATEGORY_BRAND_STYLES: readonly CategoryBrandStyle[] = [
  {
    from: 'from-cyan-600', to: 'to-cyan-500', bg: 'bg-cyan-500/10',
    hoverText: 'group-hover:text-cyan-700 dark:group-hover:text-cyan-300',
    hoverShadow: 'hover:shadow-cyan-500/20', spotlight: 'rgba(8, 126, 153, 0.16)',
  },
  {
    from: 'from-orange-600', to: 'to-orange-500', bg: 'bg-orange-500/10',
    hoverText: 'group-hover:text-orange-700 dark:group-hover:text-orange-300',
    hoverShadow: 'hover:shadow-orange-500/20', spotlight: 'rgba(192, 91, 24, 0.16)',
  },
  {
    from: 'from-emerald-600', to: 'to-emerald-500', bg: 'bg-emerald-500/10',
    hoverText: 'group-hover:text-emerald-700 dark:group-hover:text-emerald-300',
    hoverShadow: 'hover:shadow-emerald-500/20', spotlight: 'rgba(33, 120, 95, 0.16)',
  },
  {
    from: 'from-violet-600', to: 'to-violet-500', bg: 'bg-violet-500/10',
    hoverText: 'group-hover:text-violet-700 dark:group-hover:text-violet-300',
    hoverShadow: 'hover:shadow-violet-500/20', spotlight: 'rgba(121, 55, 195, 0.16)',
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