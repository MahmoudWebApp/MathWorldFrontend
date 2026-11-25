import { getTranslations } from 'next-intl/server';
import { SITE_URL } from '@/lib/publicCurriculum';
import { AboutHero } from '@/components/about/AboutHero';
import { MissionSection } from '@/components/about/MissionSection';
import { ValuesSection } from '@/components/about/ValuesSection';
import { FeaturesSection } from '@/components/about/FeaturesSection';
import { CTASection } from '@/components/about/CTASection';
import { StatsSection } from '@/components/about/StatsSection';
import { CurriculumSourcesSection } from '@/components/curriculum/CurriculumSourcesSection';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about.metadata' });
  
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${SITE_URL}/${locale}/about`,
      languages: { ar: `${SITE_URL}/ar/about`, en: `${SITE_URL}/en/about` },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      siteName: 'MathWorld', type: 'website',
      url: `${SITE_URL}/${locale}/about`,
      images: [{ url: `${SITE_URL}/mathworld-logo.png`, alt: 'MathWorld' }],
    },
  };
}

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <AboutHero />
      <MissionSection />
      <ValuesSection />
      <CurriculumSourcesSection />
      <StatsSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
}