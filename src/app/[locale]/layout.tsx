import { notFound } from 'next/navigation';
import { getMessages, getTimeZone, getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { isAppLocale, routing } from '@/i18n/routing';
import { Providers } from '@/components/providers/Providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MathBackground } from '@/components/math/MathBackground';


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};

  const t = await getTranslations({ locale });
  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isAppLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const timeZone = await getTimeZone();

  const isRTL = locale === 'ar';

  return (
    <div
      lang={locale}
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`relative flex min-h-screen flex-col ${
        isRTL ? 'font-arabic' : 'font-sans'
      }`}
    >
      <MathBackground />
      <Providers locale={locale} messages={messages} timeZone={timeZone}>
        <Navbar />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
      </Providers>
    </div>
  );
}