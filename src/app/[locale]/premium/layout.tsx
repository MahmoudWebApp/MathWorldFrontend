import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/publicCurriculum';

export async function generateMetadata({ params }: { params: Promise<{locale: string}> }): Promise<Metadata> {
  const { locale } = await params;
  const ar = locale === 'ar';
  const title = ar ? 'مقارنة Free وPremium | MathWorld' : 'Free vs Premium | MathWorld';
  const description = ar
    ? 'قارن مميزات الحساب المجاني وPremium في MathWorld دون أسعار. تعرّف على الفئات المتاحة والحلول والتقارير وكيفية ترقية حسابك.'
    : 'Compare MathWorld Free and Premium benefits without prices: learning topics, solutions, reports and account upgrades.';
  return {
    title, description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/premium`,
      languages: { ar: `${SITE_URL}/ar/premium`, en: `${SITE_URL}/en/premium` },
    },
    openGraph: { title, description, url: `${SITE_URL}/${locale}/premium`, type: 'website', siteName: 'MathWorld' },
  };
}

export default function PremiumLayout({ children }: { children: React.ReactNode }) {
  return children;
}
