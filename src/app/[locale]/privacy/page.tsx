import { PrivacyContent } from '@/components/privacy/PrivacyContent';
import { PrivacyHero } from '@/components/privacy/PrivacyHero';
import { getTranslations } from 'next-intl/server';


export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy.metadata' });
  
  return {
    title: t('title'),
    description: t('description'), 
  };
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-col">
      <PrivacyHero />
      <PrivacyContent />
    </div>
  );
}