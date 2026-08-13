'use client';

import { useTranslations } from 'next-intl';
import { Home } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  const t = useTranslations();

  return (
    <div className="container mx-auto flex min-h-[55vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 text-7xl font-black leading-none sr-title-accent">404</div>
      <h1 className="brand-display-title mb-3 text-3xl font-extrabold text-foreground">{t('common.noData')}</h1>
      <p className="mb-8 max-w-lg text-muted-foreground">{t('problems.browseAll')}</p>
      <Button asChild className="sr-cta-ring rounded-full px-7">
        <Link href="/" className="gap-2">
          <Home className="h-4 w-4" />
          {t('nav.home')}
        </Link>
      </Button>
    </div>
  );
}
