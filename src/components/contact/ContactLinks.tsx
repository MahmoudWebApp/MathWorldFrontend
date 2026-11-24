'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Mail, ExternalLink } from 'lucide-react';
import { useGetPublicBrandQuery, publishedSocialLinks } from '@/store/api/platformBrandApi';
import { socialLinks as icons } from '@/components/layout/socialLinks';

export function ContactLinks() {
  const ar = useLocale() === 'ar';
  const t = useTranslations('contact');
  const { data, isLoading, isError, refetch } = useGetPublicBrandQuery(undefined, { refetchOnMountOrArgChange: 60 });
  const profile = data?.Profile;
  const published = publishedSocialLinks(profile);
  const address = ar ? profile?.ContactAddressAr : profile?.ContactAddressEn;
  return <section className="math-section-bg px-4 py-16">
    <div className="mx-auto max-w-4xl space-y-6">
      {isLoading && <p role="status" className="text-center">{ar?'جارٍ التحميل…':'Loading…'}</p>}
      {isError && <p role="alert" className="text-center">{ar?'تعذّر تحميل بيانات التواصل.':'Could not load contact details.'} <button type="button" className="text-primary underline" onClick={()=>void refetch()}>{ar?'إعادة المحاولة':'Retry'}</button></p>}
      {!isLoading && !isError && !profile?.SupportEmail && !profile?.Phone && !address && published.length===0 && <p className="text-center text-muted-foreground">{ar?'لا توجد بيانات تواصل منشورة حالياً.':'No contact details are published yet.'}</p>}
      {profile?.SupportEmail && <div className="brand-surface math-card rounded-2xl p-6"><Mail className="mb-2 text-primary" /><h2 className="font-bold">{t('email.title')}</h2><a className="break-all text-primary underline" href={`mailto:${profile.SupportEmail}`}>{profile.SupportEmail}</a></div>}
      {(profile?.Phone || address) && <div className="rounded-2xl border bg-card p-5 space-y-2">{profile?.Phone && <p dir="ltr">{profile.Phone}</p>}{address && <p>{address}</p>}</div>}
      {published.length>0 && <div className="space-y-4"><h2 className="text-lg font-bold">{t('social.title')}</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{published.map(link=><a key={link.Platform} href={link.Url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 hover:text-primary">{icons.find(icon=>icon.name.toLowerCase()===link.Platform.toLowerCase())?.icon ?? <ExternalLink className="h-5 w-5" />}{ar?link.LabelAr:link.LabelEn}</a>)}</div></div>}
    </div>
  </section>;
}
