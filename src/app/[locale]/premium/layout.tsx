import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/publicCurriculum';

export async function generateMetadata({
  params,
}: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const ar = locale === 'ar';
  const title = ar ? 'مقارنة حساب Free وPremium | MathWorld' : 'Free vs Premium features | MathWorld';
  const description = ar
    ? 'قارن بين حساب MathWorld المجاني والمدفوع، والفئات المفتوحة، والتحديات اليومية، والتقارير. لا توجد أسعار معروضة حالياً.'
    : 'Compare MathWorld Free and Premium accounts, learning topics, daily challenges and reports. No prices are published yet.';
  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/premium`,
      languages: { ar: `${SITE_URL}/ar/premium`, en: `${SITE_URL}/en/premium` },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'MathWorld',
      url: `${SITE_URL}/${locale}/premium`,
      images: [{ url: `${SITE_URL}/mathworld-logo.png`, alt: 'MathWorld' }],
    },
  };
}

export default function PremiumPublicLayout({ children }: { children: React.ReactNode }) {
  return children;
}
