import type { Metadata } from 'next';
import { getPublicCategories, getPublicStages, getPublicStageExamples, SITE_URL } from '@/lib/publicCurriculum';
import { Link } from '@/i18n/routing';
import StageCategoriesClient from './StageCategoriesClient';

interface Props { params: Promise<{ locale: string; stageId: string }> }

export const revalidate = 120;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, stageId: raw } = await params;
  const stageId = Number(raw);
  const stages = await getPublicStages();
  const stage = stages.find(s => s.Id === stageId);
  const ar = locale === 'ar';
  const name = (ar ? stage?.NameAr : stage?.NameEn) || (ar ? 'مرحلة تعليمية' : 'Learning stage');
  const description = (ar ? stage?.DescriptionAr : stage?.DescriptionEn)?.trim()
    || (ar ? 'استكشف مراحل MathWorld وفئات الرياضيات والمسائل التعليمية.' : 'Explore MathWorld mathematics learning stages and topics.');
  const path = `/stages/${stageId}`;
  const title = `${name} | MathWorld`;
  return {
    title, description,
    alternates: {
      canonical: `${SITE_URL}/${locale}${path}`,
      languages: { ar: `${SITE_URL}/ar${path}`, en: `${SITE_URL}/en${path}` },
    },
    openGraph: {
      title, description, siteName: 'MathWorld', type: 'website',
      url: `${SITE_URL}/${locale}${path}`,
    },
    robots: !stage || !Number.isSafeInteger(stageId) ? { index: false, follow: true } : undefined,
  };
}

export default async function StagePage({ params }: Props) {
  const { locale, stageId: raw } = await params;
  const stageId = Number(raw);
  const [stages, categories, examples] = await Promise.all([getPublicStages(), getPublicCategories(), getPublicStageExamples(stageId)]);
  const stage = stages.find(s => s.Id === stageId);
  const topics = categories
    .filter(c => c.StageId === stageId)
    .sort((a, b) => a.Order - b.Order);
  const ar = locale === 'ar';
  const name = ar ? stage?.NameAr : stage?.NameEn;
  const description = (ar ? stage?.DescriptionAr : stage?.DescriptionEn)?.trim();

  const schema = stage && {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name,
    description: description || undefined,
    inLanguage: ar ? 'ar' : 'en',
    educationalLevel: name,
    url: `${SITE_URL}/${locale}/stages/${stageId}`,
    provider: { '@type': 'EducationalOrganization', name: 'MathWorld', url: SITE_URL },
    hasPart: topics.map(topic => ({
      '@type': 'LearningResource',
      name: ar ? topic.NameAr : topic.NameEn,
      description: ar ? topic.DescriptionAr : topic.DescriptionEn,
    })),
  };

  return (
    <>
      {stage && (
        <section className="container mx-auto px-6 pt-10 lg:px-12" aria-label={ar ? 'دليل المرحلة التعليمية' : 'Learning stage guide'}>
          <nav className="mb-5 flex flex-wrap gap-3 text-sm font-semibold text-primary" aria-label={ar ? 'روابط الموقع' : 'Site links'}>
            <Link href="/">{ar ? 'الرئيسية' : 'Home'}</Link>
            <span aria-hidden="true">/</span>
            <Link href="/stages">{ar ? 'المراحل' : 'Stages'}</Link>
          </nav>
          <h1 className="brand-display-title text-3xl font-black tracking-tight md:text-5xl">
            {name}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
            {description || (ar ? 'تعرّف إلى فئات هذه المرحلة ومسائلها.' : 'Explore the topics and sample questions in this stage.')}
          </p>
          {topics.length > 0 && (
            <details className="mt-6 max-w-4xl rounded-2xl border border-border/70 bg-card/70 p-4">
              <summary className="cursor-pointer font-bold text-primary">
                {ar ? 'ما الفئات التي ستتعلمها في هذه المرحلة؟' : 'What topics are covered in this stage?'}
              </summary>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {topics.map(topic => (
                  <li key={topic.Id} className="rounded-xl bg-muted/30 p-3">
                    <strong>{ar ? topic.NameAr : topic.NameEn}</strong>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {ar ? topic.DescriptionAr : topic.DescriptionEn}
                    </p>
                  </li>
                ))}
              </ul>
            </details>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/register" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
              {ar ? 'ابدأ مجاناً' : 'Start for free'}
            </Link>
            <Link href="/login" className="inline-flex min-h-11 items-center rounded-xl border border-border px-5 py-3 text-sm font-bold">
              {ar ? 'تسجيل الدخول' : 'Sign in'}
            </Link>
            <Link href="/premium" className="inline-flex min-h-11 items-center rounded-xl border border-primary/30 px-5 py-3 text-sm font-bold text-primary">
              {ar ? 'الباقات' : 'Plans'}
            </Link>
          </div>
        </section>
      )}
      <StageCategoriesClient stageId={stageId} serverIntroProvided={Boolean(stage)} examples={examples} />
      {schema && (
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      )}
    </>
  );
}
