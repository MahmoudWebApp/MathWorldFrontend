// File: app/[locale]/stages/page.tsx

import { getTranslations } from 'next-intl/server';
import { SITE_URL } from '@/lib/publicCurriculum';
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
    alternates: {
      canonical: `${SITE_URL}/${locale}/stages`,
      languages: { ar: `${SITE_URL}/ar/stages`, en: `${SITE_URL}/en/stages` },
    },
    openGraph: {
      title: t('stagesTitle'),
      description: t('stagesDescription'),
      siteName: 'MathWorld', type: 'website',
      url: `${SITE_URL}/${locale}/stages`,
      images: [{ url: `${SITE_URL}/mathworld-logo.png`, alt: 'MathWorld' }],
    },
  };
}

export default function StagesPage() {
  return <StagesPageClient />;
}