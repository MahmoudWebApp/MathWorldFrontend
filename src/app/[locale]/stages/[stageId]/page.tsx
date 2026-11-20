import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StageCategoriesClient from './StageCategoriesClient';
import { getPublicStages, getPublicTopics } from '@/lib/publicCurriculum';

type Props = { params: Promise<{locale: string; stageId: string}> };
function selectedText(locale: string, ar?: string, en?: string) {
  return (locale === 'ar' ? ar : en)?.trim() || '';
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, stageId} = await params;
  const id = Number(stageId);
  const stages = await getPublicStages();
  const stage = stages.find(item => item.Id === id);
  const title = stage ? selectedText(locale, stage.NameAr, stage.NameEn) : 'MathWorld';
  const description = stage ? selectedText(locale, stage.DescriptionAr, stage.DescriptionEn) : '';
  const slug = `/stages/${id}`;
  return {
    title,
    description,
    alternates: {canonical: `/${locale}${slug}`, languages: {
      ar: `/ar${slug}`, en: `/en${slug}`,
    }},
    openGraph: { title: `${title} | MathWorld`, description,
      locale: locale === 'ar' ? 'ar_AR' : 'en_US', images: ['/mathworld-logo.png'] },
  };
}

export default async function StagePage({params}: Props) {
  const {stageId, locale} = await params;
  const id = Number(stageId);
  if (!Number.isSafeInteger(id) || id < 1) notFound();
  const [stages, categories] = await Promise.all([getPublicStages(), getPublicTopics()]);
  const stage = stages.find(item => item.Id === id);
  const stageTopics = categories.filter(item => item.StageId === id);
  const pageUrl = `https://math-world-frontend.vercel.app/${locale}/stages/${id}`;
  const desc = selectedText(locale, stage?.DescriptionAr, stage?.DescriptionEn);
  const stageName = selectedText(locale, stage?.NameAr, stage?.NameEn);

  const structured = stage ? {
    '@context': 'https://schema.org', '@type': 'WebPage',
    name: stageName, description: desc, inLanguage: locale, url: pageUrl,
    isPartOf: {'@type': 'WebSite', name: 'MathWorld', url: 'https://math-world-frontend.vercel.app'},
  } : null;

  return <>
    {structured && <script type="application/ld+json"
      dangerouslySetInnerHTML={{__html: JSON.stringify(structured).replace(/</g, '\\u003c')}} />}
    <StageCategoriesClient stageId={id} />
    {stage && <section className="container relative z-10 mx-auto max-w-6xl px-5 pb-16" aria-label={locale === 'ar' ? 'دليل المرحلة' : 'Stage guide'}>
      <div className="rounded-3xl border border-primary/15 bg-card/90 p-5 sm:p-8">
        <h2 className="text-xl font-extrabold">{locale === 'ar' ? 'ماذا ستتعلم في هذه المرحلة؟' : 'What will you learn in this stage?'}</h2>
        {desc && <p className="mt-3 max-w-3xl leading-8 text-muted-foreground">{desc}</p>}
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {stageTopics.map(topic => (
            <li key={topic.Id} className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <h3 className="font-extrabold">{selectedText(locale, topic.NameAr, topic.NameEn)}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {selectedText(locale, topic.DescriptionAr, topic.DescriptionEn)}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={`/${locale}/register`} className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
            {locale === 'ar' ? 'إنشاء حساب مجاني' : 'Create a free account'}
          </a>
          <a href={`/${locale}/premium`} className="rounded-xl border border-primary/25 px-5 py-3 text-sm font-bold text-primary">
            {locale === 'ar' ? 'مقارنة Free وPremium' : 'Free vs Premium'}
          </a>
          <a href={`/${locale}/stages`} className="rounded-xl border border-border px-5 py-3 text-sm font-bold">
            {locale === 'ar' ? 'جميع المراحل' : 'All stages'}
          </a>
        </div>
      </div>
    </section>}
  </>;
}
