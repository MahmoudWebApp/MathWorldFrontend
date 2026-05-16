import { getTranslations } from 'next-intl/server';
import { ContactHero } from '@/components/contact/ContactHero';
import { ContactLinks } from '@/components/contact/ContactLinks';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact.metadata' });
  
  return {
    title: t('title'),
    description: t('description'), 
  };
}

export default function ContactPage() {
  return (
    <div className="flex flex-col">
      <ContactHero />
      <ContactLinks />
    </div>
  );
}