import type { Metadata } from 'next';
import { getPublicCategories, getPublicStages, SITE_URL } from '@/lib/publicCurriculum';
import { getStageAccent } from '@/lib/stageVisuals';
import StageCategoriesClient from './StageCategoriesClient';

interface Props { params: Promise<{ locale: string; stageId: string }> }

export const revalidate = 120;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, stageId: raw } = await params;
  const stageId = Number(raw);
  const stage = (await getPublicStages()).find(s => s.Id === stageId);
  const ar = locale === 'ar';
  const name = (ar ? stage?.NameAr : stage?.NameEn) || (ar ? 'مرحلة تعليمية' : 'Learning stage');
  const description = (ar ? stage?.DescriptionAr : stage?.DescriptionEn)?.trim()
    || (ar ? 'استكشف فئات الرياضيات والمهارات المرتبطة بهذه المرحلة.' : 'Explore this stage’s coherent mathematics topics and learning skills.');
  const path = `/stages/${stageId}`;
  return {
    title: `${name} | MathWorld`, description,
    alternates: {
      canonical: `${SITE_URL}/${locale}${path}`,
      languages: { ar: `${SITE_URL}/ar${path}`, en: `${SITE_URL}/en${path}` },
    },
    openGraph: {
      title: `${name} | MathWorld`, description, siteName: 'MathWorld',
      type: 'website', url: `${SITE_URL}/${locale}${path}`,
    },
    robots: !stage || !Number.isSafeInteger(stageId) ? { index: false, follow: true } : undefined,
  };
}

export default async function StagePage({ params }: Props) {
  const { locale, stageId: raw } = await params;
  const stageId = Number(raw);
  const [stages, categories] = await Promise.all([getPublicStages(), getPublicCategories()]);
  const stage = stages.find(s => s.Id === stageId);
  const ar = locale === 'ar';
  const name = (ar ? stage?.NameAr : stage?.NameEn) || (ar ? 'المرحلة التعليمية' : 'Learning stage');
  const description = (ar ? stage?.DescriptionAr : stage?.DescriptionEn)?.trim()
    || (ar ? 'تعرّف إلى موضوعات الرياضيات والمهارات التي تنمّيها في هذه المرحلة.' : 'Explore mathematics topics and learning objectives for this stage.');
  const topics = categories
    .filter(topic => topic.StageId === stageId)
    .sort((a,b) => a.Order - b.Order);

  const schema = stage && {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name, description, inLanguage: locale, educationalLevel: name,
    url: `${SITE_URL}/${locale}/stages/${stageId}`,
    provider: { '@type': 'EducationalOrganization', name: 'MathWorld', url: SITE_URL },
    hasPart: topics.map(topic => ({
      '@type': 'LearningResource',
      name: ar ? topic.NameAr : topic.NameEn,
      description: ar ? topic.DescriptionAr : topic.DescriptionEn,
    })),
  };

  return (
    <div className="relative bg-background">
      <header className="container mx-auto px-4 pb-5 pt-12 sm:px-6 sm:pt-16 lg:px-12">
        <div className="max-w-4xl">
          <h1
            className="brand-display-title text-3xl font-black tracking-tight sm:text-5xl"
            style={{ color: getStageAccent(stage || { Id: stageId }) }}
          >
            {name}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
            {description}
          </p>
        </div>
      </header>
      <StageCategoriesClient stageId={stageId} />
      {schema && (
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
        />
      )}
    </div>
  );
}
