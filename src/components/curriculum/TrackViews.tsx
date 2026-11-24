'use client';
import {useState} from 'react';
import {useLocale} from 'next-intl';
import {Link} from '@/i18n/routing';
import {useGetPublishedTracksQuery,useGetPublishedTrackQuery,useGetTrackProgressQuery,useGetTrackPracticeQuery} from '@/store/api/stagesApi';
import {useResetPracticeMutation} from '@/store/api/usersApi';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogFooter} from '@/components/ui/Dialog';
const btn='rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50';
function PublicTrackDetails({id,ar}:{id:number;ar:boolean}){
  const {currentData:data,isFetching,isError,refetch}=useGetPublishedTrackQuery(id,{refetchOnMountOrArgChange:true});
  const [expanded,setExpanded]=useState<number|null>(null);
  return <div className="space-y-3 rounded-xl border p-4">
    {isFetching&&!data&&<p role="status">{ar?'جارٍ التحميل…':'Loading…'}</p>}
    {isError&&<button onClick={()=>void refetch()} className={btn}>{ar?'إعادة المحاولة':'Retry'}</button>}
    {data&&!isError&&<><p className="text-sm text-muted-foreground">{ar?data.Track.DescriptionAr:data.Track.DescriptionEn}</p>
      <div className="grid gap-2 sm:grid-cols-2">{data.Categories.map(c=><article key={c.Id} className="rounded-xl border p-3"><div className="flex justify-between gap-2"><h4 className="font-semibold">{ar?c.NameAr:c.NameEn}</h4><span className="text-xs">{c.ProblemsCount} {ar?'مسألة':'problems'}</span></div>
        <button className="mt-2 text-sm text-primary underline" aria-expanded={expanded===c.Id} onClick={()=>setExpanded(expanded===c.Id?null:c.Id)}>{ar?'عرض المهارات':'View skills'}</button>
        {expanded===c.Id&&<ul className="mt-2 list-inside list-disc text-sm">{data.Skills.filter(s=>s.CategoryId===c.Id).map(s=><li key={s.Id}>{ar?s.NameAr:s.NameEn}</li>)}</ul>}</article>)}</div>
      {data.Examples.length>0&&<><h4 className="font-semibold">{ar?'أمثلة من عناوين المسائل':'Example problem titles'}</h4><ul className="list-inside list-disc text-sm">{data.Examples.map(p=><li key={p.Id}>{ar?p.TitleAr:p.TitleEn}</li>)}</ul></>}
    </>}
  </div>;
}
export function PublicTrackCatalog({stageId}:{stageId:number}){
  const ar=useLocale()==='ar';const {currentData:data}=useGetPublishedTracksQuery(stageId,{refetchOnMountOrArgChange:true});
  const [selected,setSelected]=useState<number|null>(null);
  if(!data?.Enabled||data.Items.length===0)return null;
  const effective=data.Items.some(x=>x.Id===selected)?selected:null;
  return <section className="mb-8 space-y-3"><h2 className="text-xl font-bold">{ar?'الصفوف والمساقات':'Grades and courses'}</h2>
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{data.Items.map(t=><button key={t.Id} type="button" aria-pressed={effective===t.Id} className={btn+' text-start '+(effective===t.Id?'border-primary bg-primary/10':'')} onClick={()=>setSelected(t.Id)}><span className="block">{ar?t.NameAr:t.NameEn}</span><span className="text-xs text-muted-foreground">{t.ProblemsCount} {ar?'مسألة':'problems'} · {t.SkillsCount} {ar?'مهارة':'skills'}</span></button>)}</div>
    <div className="flex flex-wrap gap-3">{data.Items.map(t=><Link key={t.Id} href={'/stages/'+stageId+'/tracks/'+t.Id} className="text-sm text-primary underline">{ar?t.NameAr:t.NameEn}</Link>)}</div>
    {effective!==null&&<><PublicTrackDetails key={effective} id={effective} ar={ar}/><Link className="inline-flex text-primary underline" href={'/stages/'+stageId+'/tracks/'+effective}>{ar?'صفحة الصف أو المساق الكاملة':'Full grade or course page'}</Link></>}
  </section>;
}
function Practice({id,categoryId,ar}:{id:number;categoryId:number;ar:boolean}){
  const [page,setPage]=useState(1);
  const {currentData:data,isFetching,isError,refetch}=useGetTrackPracticeQuery({id,categoryId,page},{refetchOnMountOrArgChange:true});
  return <div className="space-y-2">
    {isFetching&&!data&&<p role="status">{ar?'جارٍ تحميل المسائل…':'Loading problems…'}</p>}
    {isError&&<p role="alert">{ar?'تعذّر تحميل المسائل.':'Could not load problems.'} <button className={btn} onClick={()=>void refetch()}>{ar?'إعادة المحاولة':'Retry'}</button></p>}
    {data&&!isError&&<><div className="flex justify-end"><button className={btn} onClick={()=>void refetch()}>{ar?'تحديث':'Refresh'}</button></div>
      {data.Items.map(p=><Link key={p.Id} href={'/dashboard/problems/'+p.Id+'?trackId='+id} className="flex items-center justify-between gap-2 rounded-xl border p-3 text-sm"><span>{ar?p.TitleAr:p.TitleEn}</span><span className={p.IsSolved?'text-emerald-600':'text-amber-600'}>{p.IsSolved?(ar?'محلولة':'Solved'):(ar?'غير محلولة':'Unsolved')}</span></Link>)}
      {data.Total>data.PageSize&&<div className="flex items-center gap-2"><button className={btn} disabled={page<=1} onClick={()=>setPage(p=>p-1)}>{ar?'السابق':'Previous'}</button><span>{page}</span><button className={btn} disabled={page*data.PageSize>=data.Total} onClick={()=>setPage(p=>p+1)}>{ar?'التالي':'Next'}</button></div>}
    </>}
  </div>;
}
export function StudentTrackWorkspace({trackId}:{trackId:number}){
  const ar=useLocale()==='ar';const detail=useGetPublishedTrackQuery(trackId,{refetchOnMountOrArgChange:true});
  const progress=useGetTrackProgressQuery(trackId,{refetchOnMountOrArgChange:true});
  const [category,setCategory]=useState<number|null>(null);const [skills,setSkills]=useState<number|null>(null);
  const data=detail.currentData;const stats=progress.currentData;
  const [target,setTarget]=useState<{categoryId?:number;name:string}|null>(null);
  const [reset,resetState]=useResetPracticeMutation();
  const [notice,setNotice]=useState('');const [error,setError]=useState('');
  async function confirm(){if(!target||!stats||!stats.TrackPracticeIsolationEnabled||resetState.isLoading||stats.TrackId!==trackId)return;
    setError('');try{await reset({StageId:stats.StageId,TrackId:trackId,CategoryId:target.categoryId}).unwrap();setTarget(null);setNotice(ar?'بدأ تدريب جديد ضمن النطاق المحدد.':'A new practice cycle has started in the selected scope.');}
    catch{setError(ar?'تعذّرت إعادة التدريب. حدّث المسار وحاول مجدداً.':'Restart failed. Refresh the track and retry.');}}

  if(detail.isError||progress.isError)return <main className="p-6"><p role="alert">{ar?'تعذّر تحميل المسار أو تقدمه.':'Could not load track or progress.'}</p><button className={btn} onClick={()=>{void detail.refetch();void progress.refetch();}}>{ar?'إعادة المحاولة':'Retry'}</button> <Link href="/learning-stage">{ar?'تغيير المسار':'Change track'}</Link></main>;
  if(!data||!stats)return <p className="p-6" role="status">{ar?'جارٍ تحميل مسارك…':'Loading your track…'}</p>;
  const byId=new Map(stats.Categories.map(c=>[c.CategoryId,c]));
  return <main className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6">
    <header className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-2xl font-bold">{ar?data.Track.NameAr:data.Track.NameEn}</h1><Link className={btn} href="/learning-stage">{ar?'تغيير الصف أو المساق':'Change grade or course'}</Link></header>
    <Dialog open={!!target} onOpenChange={open=>{if(!open&&!resetState.isLoading)setTarget(null)}}><DialogContent><DialogHeader><DialogTitle>{ar?'تأكيد إعادة التدريب':'Confirm practice restart'}</DialogTitle><DialogDescription>{target?.name}</DialogDescription></DialogHeader><p>{ar?'يعود تقدم التدريب ودفتر الأخطاء في هذا النطاق فقط إلى البداية. النقاط الدائمة والمفضلة والشهادات وتقدم الصفوف الأخرى محفوظة.':'Only practice progress and review errors in this scope reset. Lifetime points, favorites, certificates and other tracks remain.'}</p>{error&&<p role="alert" className="text-destructive">{error}</p>}<DialogFooter><button className={btn} disabled={resetState.isLoading} onClick={()=>setTarget(null)}>{ar?'إلغاء':'Cancel'}</button><button className={btn+' bg-primary text-primary-foreground'} disabled={resetState.isLoading} onClick={()=>void confirm()}>{ar?'تأكيد':'Confirm'}</button></DialogFooter></DialogContent></Dialog>
    {notice&&<p role="status" className="text-primary">{notice}</p>}
    <section className="rounded-xl border bg-card p-4"><p>{ar?'التقدم':'Progress'}: {stats.Solved} / {stats.ProblemsCount} · {stats.CompletionPercent}%</p><progress className="mt-2 w-full" max={100} value={stats.CompletionPercent}/><button className={btn} onClick={()=>void progress.refetch()}>{ar?'تحديث التقدم':'Refresh progress'}</button>{stats.TrackPracticeIsolationEnabled&&stats.Categories.some(c=>c.Attempted>0)&&<button className={btn} disabled={resetState.isLoading} onClick={()=>{setError('');setNotice('');setTarget({name:ar?data.Track.NameAr:data.Track.NameEn})}}>{ar?'إعادة تدريب الصف أو المساق':'Restart grade or course'}</button>}</section>
    <div className="grid gap-3 sm:grid-cols-2">{data.Categories.map(c=>{const p=byId.get(c.Id);const locked=!p||p.IsLocked;return <article key={c.Id} className="space-y-3 rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between gap-2"><h2 className="font-bold">{ar?c.NameAr:c.NameEn}</h2><span className="text-sm">{c.ProblemsCount} {ar?'مسألة':'problems'}</span></div>
      <p className="text-sm text-muted-foreground">{ar?c.DescriptionAr:c.DescriptionEn}</p>
      <p className="text-sm">{ar?'محلولة':'Solved'}: {p?.Solved??0}/{c.ProblemsCount}</p>
      <div className="flex flex-wrap gap-2"><button className={btn} aria-expanded={skills===c.Id} onClick={()=>setSkills(skills===c.Id?null:c.Id)}>{ar?'عرض المهارات':'View skills'}</button>
      {locked?<Link className={btn} href="/dashboard/upgrade">{ar?'ترقية الحساب':'Upgrade account'}</Link>:<button className={btn} aria-expanded={category===c.Id} onClick={()=>setCategory(category===c.Id?null:c.Id)}>{ar?'عرض المسائل':'View problems'}</button>}{!locked&&stats.TrackPracticeIsolationEnabled&&(p?.Attempted??0)>0&&<button className={btn} disabled={resetState.isLoading} onClick={()=>{setError('');setNotice('');setTarget({categoryId:c.Id,name:ar?c.NameAr:c.NameEn})}}>{ar?'إعادة تدريب الفئة':'Restart topic'}</button>}</div>
      {skills===c.Id&&<ul className="list-inside list-disc text-sm">{data.Skills.filter(s=>s.CategoryId===c.Id).map(s=><li key={s.Id}>{ar?s.NameAr:s.NameEn}</li>)}</ul>}
      {!locked&&category===c.Id&&<Practice key={c.Id} id={trackId} categoryId={c.Id} ar={ar}/>}
    </article>;})}</div>
  </main>;
}
