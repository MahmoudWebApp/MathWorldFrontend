// File: app/[locale]/stages/page.tsx

import { getTranslations } from 'next-intl/server';
import StagesPageClient from './StagesPageClient';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  
  return {
    title: t('stagesTitle'),
    description: t('stagesDescription'),
    alternates: { canonical: `/${locale}/stages`, languages: { ar: '/ar/stages', en: '/en/stages' } },
    openGraph: { title: t('stagesTitle'), description: t('stagesDescription'), images: ['/mathworld-logo.png'] },
  };
}

export default function StagesPage() {
  return <StagesPageClient />;
}