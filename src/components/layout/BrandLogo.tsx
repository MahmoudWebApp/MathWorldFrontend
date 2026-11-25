'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useGetPublicBrandQuery, isSafeBrandLogo } from '@/store/api/platformBrandApi';
import { cn } from '@/lib/utils';
import { BrandMark } from '@/components/layout/BrandMark';

interface BrandLogoProps {
  compact?: boolean;
  className?: string;
}

export function BrandLogo({ compact = false, className }: BrandLogoProps) {
  const ar = useLocale() === 'ar';
  const { data } = useGetPublicBrandQuery(undefined, { refetchOnMountOrArgChange: 60 });
  const [failedLogo, setFailedLogo] = useState('');
  const logo = data?.Profile.LogoUrl;
  const customLogo = logo && data && !(/\/mathworld-mark-(?:transparent-v3\.png|balanced-v4\.(?:svg|png))(?:[?#].*)?$/i.test(logo)) && logo !== failedLogo && isSafeBrandLogo(logo, data.WebsiteUrl) ? logo : null;
  const name = (ar ? data?.Profile.NameAr : data?.Profile.NameEn) || 'MathWorld';
  return (
    <div className={cn(compact ? 'brand-logo-lockup' : 'brand-logo-lockup brand-logo-lockup-large', className)}>
      <span className={cn('brand-mark-shell', !compact && 'brand-mark-shell-large')}>
        {customLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={customLogo} alt={name} onError={() => setFailedLogo(customLogo)} className={cn('object-contain', compact ? 'h-11 w-11' : 'h-16 w-16')} />
        ) : <BrandMark className={compact ? 'h-11 w-11' : 'h-16 w-16'} />}
      </span>
      <span className={cn('brand-wordmark font-extrabold tracking-tight', compact ? 'hidden text-[1.2rem] min-[430px]:inline' : 'text-2xl')} dir="auto">
        {name.toLowerCase()==='mathworld'?<span dir="ltr" aria-label="MathWorld" className="mw-brand-flow">MathWorld</span>:<span className="mw-brand-flow">{name}</span>}
      </span>
    </div>
  );
}
