import { getTranslations } from 'next-intl/server';
import { AboutHero } from '@/components/about/AboutHero';
import { MissionSection } from '@/components/about/MissionSection';
import { ValuesSection } from '@/components/about/ValuesSection';
import { FeaturesSection } from '@/components/about/FeaturesSection';
import { CTASection } from '@/components/about/CTASection';
import { StatsSection } from '@/components/about/StatsSection';

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
  };
}

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <AboutHero />
      <MissionSection />
      <ValuesSection />
      <StatsSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
}