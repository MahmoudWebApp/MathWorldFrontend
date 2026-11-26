'use client';
import {useLocale} from 'next-intl';
import {Link} from '@/i18n/routing';
import {useGetCurrentLearningSessionQuery,useGetSessionAchievementsQuery,type SessionScope} from '@/store/api/usersApi';
import {BookOpen,Trophy,Medal} from 'lucide-react';
export function LearningSessionCards({stageId,trackId,premium}:{stageId:number;trackId:number|null;premium:boolean}){
  const ar=useLocale()==='ar';
  const scope:SessionScope={Kind:'daily',StageId:stageId,TrackId:trackId};
  const daily=useGetCurrentLearningSessionQuery(scope,{skip:!premium,refetchOnMountOrArgChange:true,refetchOnFocus:true,refetchOnReconnect:true});
  const data=daily.currentData;
  const matches=data?.StageId===stageId&&(data.TrackId??null)===trackId;
  const complete=matches&&data?.IsComplete;
  const button='inline-flex min-h-10 items-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground';
  return <section className="grid gap-3 sm:grid-cols-2">
    <article className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4">
      <div><BookOpen className="mb-2 h-5 w-5 text-primary"/><h2 className="font-bold">{ar?'جلسة تدريب':'Practice session'}</h2><p className="text-sm text-muted-foreground">{ar?'من 5 إلى 10 مسائل':'5 to 10 questions'}</p></div>
      <Link href="/dashboard/sessions/practice" className={button}>{ar?'ابدأ أو تابع':'Start or continue'}</Link>
    </article>
    {premium&&!complete&&<article className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4">
      <div><Trophy className="mb-2 h-5 w-5 text-amber-500"/><h2 className="font-bold">{ar?'تحدي اليوم':'Daily challenge'}</h2>
        <p className="text-sm text-muted-foreground">{daily.isFetching?(ar?'جارٍ التحقق…':'Checking…'):matches?data?.Completed+' / 5':ar?'5 مسائل':'5 questions'}</p></div>
      <Link href="/dashboard/sessions/daily" className={button}>{matches?(ar?'تابع':'Continue'):(ar?'ابدأ':'Start')}</Link>
    </article>}
  </section>;
}
export function SessionBadges(){
  const ar=useLocale()==='ar';
  const {currentData:data,isLoading,isError,refetch}=useGetSessionAchievementsQuery(undefined,{refetchOnMountOrArgChange:true});
  return <section className="rounded-2xl border bg-card p-4 space-y-3"><h2 className="flex items-center gap-2 font-bold"><Medal className="h-5 w-5 text-amber-500"/>{ar?'إنجازات التدريب والتحديات':'Practice and challenge achievements'}</h2>
    {isLoading?<p role="status">{ar?'جارٍ التحميل…':'Loading…'}</p>:isError||!data?<button className="text-primary" onClick={()=>void refetch()}>{ar?'إعادة تحميل الإنجازات':'Reload achievements'}</button>:<>
      <p className="text-sm text-muted-foreground">{ar?'جلسات مكتملة':'Completed sessions'}: {data.CompletedPracticeSessions} · {ar?'تحديات':'Challenges'}: {data.CompletedDailyChallenges}</p>
      {data.Badges.length?<div className="grid grid-cols-2 gap-2">{data.Badges.map(b=><div key={b.Key} className="rounded-xl border p-3 text-sm font-semibold"><Medal className="mb-1 h-5 w-5 text-amber-500"/>{ar?b.TitleAr:b.TitleEn}</div>)}</div>:<p className="text-sm text-muted-foreground">{ar?'أكمل تدريبك لتحصل على أول شارة.':'Complete your practice to earn your first badge.'}</p>}
    </>}
  </section>;
}
