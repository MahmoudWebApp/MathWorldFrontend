import type { Metadata } from 'next';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const ar = locale === 'ar';
  return {
    title: ar ? 'مقارنة الحساب المجاني وPremium' : 'Free vs Premium',
    description: ar
      ? 'قارن مميزات حساب Free وPremium في MathWorld بدون أسعار. الفئات المتاحة، مشاهدة الحل، الإحصائيات وترقية الحساب.'
      : 'Compare MathWorld Free and Premium benefits without prices: accessible topics, early solutions, learning analytics and account upgrade.',
    alternates: {
      canonical: `/${locale}/premium`,
      languages: { ar: '/ar/premium', en: '/en/premium' },
    },
    openGraph: {
      title: ar ? 'Free وPremium | MathWorld' : 'Free vs Premium | MathWorld',
      description: ar ? 'مقارنة الحسابين بدون أسعار.' : 'Compare the two accounts, with no prices listed.',
      images: ['/mathworld-logo.png'],
    },
  };
}
export default function PremiumLayout({children}: {children: React.ReactNode}) {
  return children;
}
