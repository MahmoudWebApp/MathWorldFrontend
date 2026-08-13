'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('common');

  useEffect(() => {
    console.error('Route error', error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="math-equation-chip mb-5 rounded-full px-4 py-2 text-sm font-bold text-primary">Σ · x² · π</div>
      <h1 className="brand-display-title sr-title-accent mb-3 text-3xl font-extrabold">{t('error')}</h1>
      <p className="mb-7 text-muted-foreground">{t('errorLoadingData')}</p>
      <Button onClick={reset} className="sr-cta-ring rounded-full px-7">{t('retry')}</Button>
    </div>
  );
}
