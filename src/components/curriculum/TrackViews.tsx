'use client';
import {ProblemCard} from '@/components/problems/ProblemCard';
import {Pagination} from '@/components/ui/Pagination';
import {ProblemTitle} from '@/components/problems/ProblemTitle';
import { MathWorldLoading } from '@/components/ui/MathWorldLoading';
import {useEffect,useState} from 'react';
import {motion} from 'framer-motion';
import {BookOpenText, Calculator, ListChecks, LockKeyhole, RotateCcw, GraduationCap} from 'lucide-react';
import {StageTopicArtwork} from '@/components/stages/StageTopicArtwork';
import type {CSSProperties} from 'react';
import {getStageAccent} from '@/lib/stageVisuals';
import {LockedCategoryOverlay} from '@/components/premium/LockedCategoryOverlay';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/Tabs';
import {useLocale} from 'next-intl';
import {Link} from '@/i18n/routing';
import {useGetPublishedTracksQuery,useGetPublishedTrackQuery,useGetTrackProgressQuery,useGetTrackPracticeQuery} from '@/store/api/stagesApi';
import {useResetPracticeMutation} from '@/store/api/usersApi';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogFooter} from '@/components/ui/Dialog';
import {SkillsPopover} from '@/components/curriculum/CategorySkillsDialog';
const btn='rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50';
export function GradeAge({code,ar}:{code:string;ar:boolean}){
 const match=/^grade-(\d+)$/.exec(code);
 if(!match)return null;
 const grade=Number(match[1]);
 if(grade<1||grade>12)return null;
 return <span className="block text-xs opacity-80">{ar?`العمر التقريبي: ${grade+5}–${grade+6} سنة`:`Typical age: ${grade+5}–${grade+6} years`}</span>;
}
function TopicIcon({icon,accent}:{icon:string;accent:string}){
 const path=icon?.trim().replace(/^https:\/\/math-world-frontend\.vercel\.app(?=\/)/,'');
 // The SVG artwork already has its stage-coloured background and white
 // mathematical glyph. A CSS mask destroys the internal glyph.
 const safe=path&&(/^\/category-icons\/[a-zA-Z0-9_-]+\.svg$/.test(path)||/^https:\/\/[^\s]+\.(?:svg|png|webp|jpg|jpeg)(?:\?[^\s]*)?$/i.test(path));
 return <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl" style={{backgroundColor:accent+'12',color:accent}}>{safe?<StageTopicArtwork src={path} size={40} accent={accent}/>:<BookOpenText size={25} aria-hidden="true"/>}</span>;
}
function TopicCount({count,ar,accent}:{count:number;ar:boolean;accent:string}){
 return <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold" style={{color:accent,backgroundColor:accent+'16'}}><Calculator size={15} aria-hidden="true"/><span className="tabular-nums">{count}</span>{ar?'مسألة':'problems'}</span>;
}
function TopicHeading({name,icon,count,accent,ar}:{name:string;icon:string;count:number;accent:string;ar:boolean}){
 return <div className="flex flex-wrap items-start justify-between gap-2"><div className="flex min-w-0 flex-1 items-start gap-3"><TopicIcon icon={icon} accent={accent}/><h3 className="min-w-0 break-words pt-1 text-base font-extrabold sm:text-lg" style={{color:accent}}>{name}</h3></div><TopicCount count={count} accent={accent} ar={ar}/></div>;
}
function PublicTrackDetails({id,ar}:{id:number;ar:boolean}){
 const {currentData:data,isFetching,isError,refetch}=useGetPublishedTrackQuery(id,{refetchOnMountOrArgChange:true});
 if(isFetching&&!data)return <MathWorldLoading compact mode="tab"/>;
 if(isError)return <p role="alert">{ar?'تعذّر تحميل المسار.':'Could not load track.'} <button onClick={()=>void refetch()} className={btn}>{ar?'إعادة المحاولة':'Retry'}</button></p>;
 if(!data)return null;
 const accent=getStageAccent({Id:data.Track.StageId});
 return <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.22}} className="space-y-5">
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[...data.Categories].sort((a,b)=>Number(b.IsFree)-Number(a.IsFree)).map(c=><article key={c.Id} className="relative flex min-h-44 flex-col gap-3 overflow-hidden rounded-2xl border mw-topic-surface p-5 shadow-sm hover:shadow-md" style={{"--stage-accent":accent} as CSSProperties}>
 <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{backgroundColor:accent}}/>
 <TopicHeading name={ar?c.NameAr:c.NameEn} icon={c.Icon} count={c.ProblemsCount} accent={accent} ar={ar}/>
 <p className="text-sm leading-7 text-muted-foreground">{ar?c.DescriptionAr:c.DescriptionEn}</p>
 <div className="mt-auto border-t border-border/60 pt-3"><SkillsPopover title={ar?c.NameAr:c.NameEn} trigger={<button className="inline-flex min-h-10 items-center gap-2 rounded-xl border mw-topic-action px-3 py-2 text-xs font-bold"><ListChecks size={16} style={{color:accent}}/>{ar?'عرض المهارات':'View skills'}</button>}><ul className="max-h-[55vh] space-y-3 overflow-y-auto ps-4">{data.Skills.filter(s=>s.CategoryId===c.Id).map(s=><li key={s.Id}><strong>{ar?s.NameAr:s.NameEn}</strong><p className="text-sm text-muted-foreground">{ar?s.DescriptionAr:s.DescriptionEn}</p></li>)}</ul></SkillsPopover></div>
 </article>)}</div>
 {data.Examples.length>0&&<section className="rounded-2xl border bg-card/80 p-5"><h3 className="mb-3 font-bold">{ar?'أمثلة من عناوين المسائل':'Example problem titles'}</h3><ul className="list-disc space-y-2 ps-5 text-sm leading-7">{data.Examples.map(p=><li key={p.Id}><ProblemTitle text={ar?p.TitleAr:p.TitleEn}/></li>)}</ul></section>}
 </motion.div>;
}
export function PublicTrackCatalog({stageId}:{stageId:number}){
 const ar=useLocale()==='ar';const {currentData:data}=useGetPublishedTracksQuery(stageId,{refetchOnMountOrArgChange:120});
 const [selected,setSelected]=useState<number|null>(null);
 useEffect(()=>{const m=/^#track-(\d+)$/.exec(window.location.hash);if(m)setSelected(Number(m[1]));},[stageId]);
 if(!data?.Enabled||!data.Items.length)return null;
 const effective=data.Items.find(x=>x.Id===selected)?.Id??data.Items[0].Id;
 return <section className="mb-8 space-y-5 mw-topic-tabs" style={{"--stage-accent":getStageAccent({Id:stageId})} as CSSProperties}><h2 className="text-xl font-bold">{stageId===4?(ar?'المستويات الجامعية':'University levels'):(ar?'الصفوف الدراسية':'School grades')}</h2>
 <Tabs dir={ar?'rtl':'ltr'} value={String(effective)} onValueChange={v=>setSelected(Number(v))}>
 <TabsList className="grid h-auto grid-cols-2 gap-1.5 p-2 sm:grid-cols-3 lg:grid-cols-6">{data.Items.map(t=><TabsTrigger key={t.Id} value={String(t.Id)} className="min-h-11 w-full whitespace-normal px-3 py-3 text-center font-bold">{ar?t.NameAr:t.NameEn}</TabsTrigger>)}</TabsList>
 {data.Items.filter(t=>t.Id===effective).map(t=><div key={t.Id} className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border mw-topic-surface px-4 py-3 text-sm text-muted-foreground"><span className="flex items-center gap-2"><GraduationCap size={17} style={{color:getStageAccent({Id:stageId})}}/><GradeAge code={t.Code} ar={ar}/></span><span className="flex items-center gap-1.5"><Calculator size={16} style={{color:getStageAccent({Id:stageId})}}/>{t.ProblemsCount} {ar?'مسألة':'problems'}</span><span className="flex items-center gap-1.5"><ListChecks size={16} style={{color:getStageAccent({Id:stageId})}}/>{t.SkillsCount} {ar?'مهارة':'skills'}</span></div>)}
 <TabsContent value={String(effective)} className="mt-6"><PublicTrackDetails key={effective} id={effective} ar={ar}/></TabsContent></Tabs>
 </section>;
}
function Practice({id,categoryId,ar}:{id:number;categoryId:number;ar:boolean}){
  const [page,setPage]=useState(1);
  const {currentData:data,isFetching,isError,refetch}=useGetTrackPracticeQuery({id,categoryId,page},{refetchOnMountOrArgChange:true});
  return <div className="space-y-2">
    {isFetching&&!data&&<MathWorldLoading compact mode="filter"/>}
    {isError&&<p role="alert">{ar?'تعذّر تحميل المسائل.':'Could not load problems.'} <button className={btn} onClick={()=>void refetch()}>{ar?'إعادة المحاولة':'Retry'}</button></p>}
    {data&&!isError&&<>
      {data.Items.map(p=><ProblemCard key={p.Id} href={'/dashboard/problems/'+p.Id+'?trackId='+id+'&categoryId='+categoryId+'&page='+page}
        problem={{Id:p.Id,Title:ar?p.TitleAr:p.TitleEn,StageId:p.StageId,StageName:ar?p.StageNameAr:p.StageNameEn,CategoryId:p.CategoryId,CategoryName:(ar?p.CategoryNameAr:p.CategoryNameEn)??'',Points:p.Points,ViewsCount:0,RequiresLogin:true,IsSolved:p.IsSolved,HasAttempted:p.HasAttempted,IsFavorite:p.IsFavorite}}/>)}
      {data.Total>data.PageSize&&<Pagination page={page} pageSize={data.PageSize} total={data.Total} onPageChange={setPage} disabled={isFetching}/>}

    </>}
  </div>;
}
export function StudentTrackWorkspace({trackId,categoryId}:{trackId:number;categoryId?:number}){
  const ar=useLocale()==='ar';const detail=useGetPublishedTrackQuery(trackId,{refetchOnMountOrArgChange:true});
  const progress=useGetTrackProgressQuery(trackId,{refetchOnMountOrArgChange:true});
  const data=detail.currentData;const stats=progress.currentData;
  const [target,setTarget]=useState<{categoryId?:number;name:string}|null>(null);
  const [reset,resetState]=useResetPracticeMutation();
  const [notice,setNotice]=useState('');const [error,setError]=useState('');
  async function confirm(){if(!target||!stats||!stats.TrackPracticeIsolationEnabled||resetState.isLoading||stats.TrackId!==trackId)return;
    setError('');try{await reset({StageId:stats.StageId,TrackId:trackId,CategoryId:target.categoryId}).unwrap();setTarget(null);setNotice(ar?'بدأ تدريب جديد ضمن النطاق المحدد.':'A new practice cycle has started in the selected scope.');}
    catch{setError(ar?'تعذّرت إعادة التدريب. حدّث المسار وحاول مجدداً.':'Restart failed. Refresh the track and retry.');}}

  if(detail.isError||progress.isError)return <main className="p-6"><p role="alert">{ar?'تعذّر تحميل المسار أو تقدمه.':'Could not load track or progress.'}</p><button className={btn} onClick={()=>{void detail.refetch();void progress.refetch();}}>{ar?'إعادة المحاولة':'Retry'}</button> <Link href="/learning-stage">{ar?'تغيير المسار':'Change track'}</Link></main>;
  if(!data||!stats)return <MathWorldLoading compact mode="tab"/>;
  const byId=new Map(stats.Categories.map(c=>[c.CategoryId,c]));
  const accent=getStageAccent({Id:data.Track.StageId});
  if(categoryId!==undefined){
    const topic=data.Categories.find(c=>c.Id===categoryId);
    const access=byId.get(categoryId);
    return <main className="mx-auto w-full max-w-4xl space-y-4 p-4 sm:p-6" style={{'--stage-accent':accent} as CSSProperties}>
      {topic&&access&&!access.IsLocked?<><TopicHeading name={ar?topic.NameAr:topic.NameEn} icon={topic.Icon} count={topic.ProblemsCount} accent={accent} ar={ar}/><Practice key={categoryId} id={trackId} categoryId={categoryId} ar={ar}/></>:<p role="alert">{ar?'هذه الفئة غير متاحة لحسابك.':'This topic is unavailable for your account.'}</p>}
    </main>;
  }
  return <main className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:p-6" style={{'--stage-accent':accent} as CSSProperties}>
    <header className="flex flex-wrap items-center justify-between gap-2"><h1 className="flex items-center gap-3 text-2xl font-extrabold sm:text-3xl" style={{color:accent}}><GraduationCap size={27} aria-hidden="true"/>{ar?data.Track.NameAr:data.Track.NameEn}</h1><Link className={btn} href="/learning-stage">{ar?'تغيير الصف أو المستوى':'Change grade or level'}</Link></header>
    <Dialog open={!!target} onOpenChange={open=>{if(!open&&!resetState.isLoading)setTarget(null)}}><DialogContent><DialogHeader><DialogTitle>{ar?'تأكيد إعادة التدريب':'Confirm practice restart'}</DialogTitle><DialogDescription>{target?.name}</DialogDescription></DialogHeader><p>{ar?'يعود تقدم التدريب ودفتر الأخطاء في هذا النطاق فقط إلى البداية. النقاط الدائمة والمفضلة والشهادات وتقدم الصفوف الأخرى محفوظة.':'Only practice progress and review errors in this scope reset. Lifetime points, favorites, certificates and other tracks remain.'}</p>{error&&<p role="alert" className="text-destructive">{error}</p>}<DialogFooter><button className={btn} disabled={resetState.isLoading} onClick={()=>setTarget(null)}>{ar?'إلغاء':'Cancel'}</button><button className={btn+' bg-primary text-primary-foreground'} disabled={resetState.isLoading} onClick={()=>void confirm()}>{ar?'تأكيد':'Confirm'}</button></DialogFooter></DialogContent></Dialog>
    {notice&&<p role="status" className="text-primary">{notice}</p>}
    <section className="rounded-xl border bg-card p-4"><p className="flex flex-wrap items-center justify-between gap-2 font-semibold"><span>{ar?'التقدم':'Progress'}</span><span dir="ltr" className="tabular-nums" style={{color:accent}}>{stats.Solved} / {stats.ProblemsCount} · {stats.CompletionPercent}%</span></p><progress aria-label={ar?'تقدم المسار':'Track progress'} className="mw-stage-progress mt-3 w-full" max={100} value={stats.CompletionPercent}/>{stats.TrackPracticeIsolationEnabled&&stats.Categories.some(c=>c.Attempted>0)&&<button className={btn} disabled={resetState.isLoading} onClick={()=>{setError('');setNotice('');setTarget({name:ar?data.Track.NameAr:data.Track.NameEn})}}>{ar?'إعادة تدريب الصف أو المستوى':'Restart grade or level'}</button>}</section>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">{[...data.Categories].sort((a,b)=>Number(b.IsFree)-Number(a.IsFree)).map(c=>{const p=byId.get(c.Id);const locked=p?.IsLocked===true;const available=p?.IsLocked===false;const href=`/dashboard/categories/${trackId}/${c.Id}`;return <article key={c.Id} className="relative isolate flex min-h-52 flex-col gap-3 overflow-hidden rounded-2xl border mw-topic-surface p-5 shadow-sm hover:shadow-md">
      {available&&<Link href={href} aria-label={ar?c.NameAr:c.NameEn} className="absolute inset-0 z-10 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"/>}
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{backgroundColor:accent}}/><TopicHeading name={ar?c.NameAr:c.NameEn} icon={c.Icon} count={c.ProblemsCount} accent={accent} ar={ar}/>
      <p className="text-sm text-muted-foreground">{ar?c.DescriptionAr:c.DescriptionEn}</p>
      <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground"><span>{ar?'محلولة':'Solved'}: <b dir="ltr">{p?.Solved??0}/{c.ProblemsCount}</b></span><progress aria-label={ar?'تقدم الفئة':'Topic progress'} className="mw-stage-progress min-w-0 flex-1" max={Math.max(1,c.ProblemsCount)} value={p?.Solved??0}/></div>
      <div inert={locked} className="relative z-20 flex flex-wrap gap-2 border-t border-border/60 pt-3"><SkillsPopover title={ar?c.NameAr:c.NameEn} trigger={<button className={btn+' mw-topic-action inline-flex items-center gap-2'}><ListChecks size={16} style={{color:accent}}/>{ar?'عرض المهارات':'View skills'}</button>}><ul className="max-h-[55vh] space-y-3 overflow-y-auto">{data.Skills.filter(s=>s.CategoryId===c.Id).map(s=><li key={s.Id} className="flex gap-2"><ListChecks size={17} className="mt-1 shrink-0" style={{color:accent}}/><div><strong>{ar?s.NameAr:s.NameEn}</strong><p className="text-sm text-muted-foreground">{ar?s.DescriptionAr:s.DescriptionEn}</p></div></li>)}</ul></SkillsPopover>
      {locked?<span className={btn+" mw-topic-action inline-flex items-center gap-2"}><LockKeyhole size={16}/>{ar?"مقفلة":"Locked"}</span>:available?<Link href={href} className={btn+' mw-topic-action-solid inline-flex items-center gap-2'}><BookOpenText size={16}/>{ar?'عرض المسائل':'View problems'}</Link>:<span className="text-xs text-muted-foreground">{ar?'التحقق من الصلاحيات':'Checking access'}</span>}{available&&stats.TrackPracticeIsolationEnabled&&(p?.Attempted??0)>0&&<button className={btn+' mw-topic-action'} disabled={resetState.isLoading} onClick={()=>{setError('');setNotice('');setTarget({categoryId:c.Id,name:ar?c.NameAr:c.NameEn})}}><RotateCcw size={15} className="me-1 inline"/>{ar?'إعادة تدريب الفئة':'Restart topic'}</button>}</div>
      {locked&&<LockedCategoryOverlay name={ar?c.NameAr:c.NameEn}/>}
    </article>;})}</div>
  </main>;
}
