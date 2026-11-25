'use client';

import { useLocale } from 'next-intl';
import { BrandMark } from '@/components/layout/BrandMark';

type Props = {
  message?: string;
  mode?: 'load' | 'search' | 'filter' | 'tab';
  inline?: boolean;
  compact?: boolean;
  skeleton?: boolean;
  className?: string;
};

/**
 * One accessible loading identity across public, student and admin routes.
 * Uses the exact MathWorld mark, not a replacement or a generic spinner.
 * Never inserts placeholder values, progress metrics or account details.
 */
export function MathWorldLoading({
  message,
  compact = false,
  mode = 'load',
  inline = false,
  skeleton = false,
  className = '',
}: Props) {
  const locale = useLocale();
  const ar = locale === 'ar';

  const copy = message ?? ({load: ar?'جارٍ تحميل البيانات…':'Loading data…',search:ar?'جارٍ البحث…':'Searching…',filter:ar?'جارٍ تصفية النتائج…':'Filtering results…',tab:ar?'جارٍ تحميل القسم…':'Loading section…'}[mode]);
  if(inline)return <span role="status" aria-live="polite" aria-busy="true" className="inline-flex items-center gap-2 text-xs font-medium text-primary"><span className="relative grid h-6 w-6 shrink-0 place-items-center"><span aria-hidden="true" className="absolute inset-0 animate-spin rounded-full border-2 border-primary/15 border-t-primary border-r-fuchsia-400 motion-reduce:animate-none"/><BrandMark className="h-4 w-4" priority={false}/></span>{copy}</span>;
  return (
    <div role="status" aria-live="polite" aria-busy="true"
      aria-label={copy}
      className={`flex w-full flex-col items-center justify-center gap-4 px-5 text-center ${compact ? 'min-h-36 py-5' : 'min-h-[240px] py-9'} ${className}`}>
      <div className={`relative flex items-center justify-center ${compact ? 'h-[74px] w-[74px]' : 'h-[98px] w-[98px]'}`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/15 via-fuchsia-500/10 to-transparent blur-lg" />
        <div className="absolute inset-[3px] animate-spin rounded-full border-2 border-primary/15 border-t-primary border-r-fuchsia-400 motion-reduce:animate-none" style={{ animationDuration: '1.7s' }} />
        <div className="relative rounded-full bg-card/85 p-3 shadow-[0_0_30px_-13px_rgba(168,85,247,0.6)]">
          <BrandMark className={compact ? 'h-10 w-10' : 'h-14 w-14'} priority={false} />
        </div>
      </div>
      <div className="space-y-1">
        <p className="brand-wordmark font-extrabold tracking-tight" dir="ltr"><span className="mw-brand-flow">MathWorld</span></p>
        <p className="text-sm text-muted-foreground">
          {copy}
        </p>
      </div>
      {skeleton && (
        <div aria-hidden="true" className="mt-3 grid w-full max-w-5xl animate-pulse grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-24 rounded-2xl border border-border/60 bg-card/65 p-4">
              <div className="h-3 w-3/5 rounded bg-primary/10" />
              <div className="mt-5 h-7 w-2/5 rounded bg-primary/15" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Layout-preserving skeletons for the first load of known content. */
export function MathWorldSkeleton({kind='cards',count=6}:{kind?:'cards'|'table'|'dashboard';count?:number}) {
  const ar=useLocale()==='ar';
  const shape='rounded bg-muted/80';
  return <div role="status" aria-busy="true" aria-label={ar?'جارٍ تحميل المحتوى':'Loading content'} className="w-full space-y-4 motion-safe:animate-pulse">
    {kind==='dashboard'&&<div aria-hidden="true" className="space-y-3 rounded-3xl border bg-card p-6"><div className={shape+' h-8 w-1/2'}/><div className={shape+' h-4 w-2/3'}/><div className={shape+' h-3 w-full'}/></div>}
    <div aria-hidden="true" className={kind==='table'?'divide-y overflow-hidden rounded-xl border bg-card':'grid grid-cols-2 gap-3 sm:grid-cols-3'}>
    {Array.from({length:count},(_,i)=>kind==='table'?<div key={i} className="grid grid-cols-[1fr_4fr_2fr_1fr] items-center gap-3 p-4"><div className={shape+' h-4 w-10'}/><div className={shape+' h-4 w-4/5'}/><div className={shape+' h-6 w-20 max-w-full'}/><div className={shape+' h-7 w-full'}/></div>:<div key={i} className="space-y-3 rounded-2xl border bg-card p-4"><div className={shape+' h-10 w-10'}/><div className={shape+' h-5 w-3/4'}/><div className={shape+' h-3 w-full'}/><div className={shape+' h-3 w-2/3'}/></div>)}
    </div>
  </div>;
}
