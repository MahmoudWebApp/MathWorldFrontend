import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/publicCurriculum';

export async function generateMetadata({ params }: { params: Promise<{locale: string}> }): Promise<Metadata> {
  const { locale } = await params;
  const ar = locale === 'ar';
  const title = ar ? 'الباقات | MathWorld' : 'Plans | MathWorld';
  const description = ar
    ? 'تعرّف إلى باقتي MathWorld Free وPremium ومميزات التعلم والفئات والحلول والتقارير، بدون عرض أسعار.'
    : 'Explore MathWorld Free and Premium plans, learning topics, solutions, and reports, with no prices displayed.';
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
