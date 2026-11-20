import Image from 'next/image';

const KNOWN = new Set([
 'arithmetic','algebra','geometry','statistics',
 'exponents','functions','proportions','proofs',
 'equations','trigonometry','calculus','probability',
 'multivariable','matrices','differential','analysis',
]);

export function categoryIconSrc(value?: string | null): string | null {
  if (!value) return null;
  if (value.startsWith('mw:')) {
    const key = value.slice(3);
    return KNOWN.has(key) ? `/category-icons/mathworld-${key}.svg` : null;
  }
  // Administrators can continue replacing the standard mark with an uploaded image.
  if (value.startsWith('https://') || value.startsWith('/')) return value;
  return null;
}

export function CategoryBrandIcon({ value, alt, size = 44 }:
 { value?: string | null; alt: string; size?: number }) {
  const src = categoryIconSrc(value);
  if (src) {
    return <Image src={src} alt={alt} width={size} height={size}
      unoptimized={src.startsWith('/category-icons/')}
      className="shrink-0 rounded-xl object-contain" />;
  }
  return <span aria-label={alt} className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary">
    {value && Array.from(value).length < 5 ? value : '∑'}
  </span>;
}
