'use client';
import { MathWorldLoading } from '@/components/ui/MathWorldLoading';
import {useEffect,useState} from 'react';
import {motion} from 'framer-motion';
import {BookOpenText, Calculator, ListChecks, LockKeyhole, RotateCcw, GraduationCap} from 'lucide-react';
import Image from 'next/image';
import type {CSSProperties} from 'react';
import {getStageAccent} from '@/lib/stageVisuals';
import {LockedPremiumDialog} from '@/components/premium/LockedPremiumDialog';
import {LatexPreview} from '@/components/ui/LatexPreview';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/Tabs';
import {useLocale} from 'next-intl';
import {Link} from '@/i18n/routing';
import {useGetPublishedTracksQuery,useGetPublishedTrackQuery,useGetTrackProgressQuery,useGetTrackPracticeQuery} from '@/store/api/stagesApi';
import {useResetPracticeMutation} from '@/store/api/usersApi';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogFooter} from '@/components/ui/Dialog';
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
 return <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl" style={{backgroundColor:accent+'12',color:accent}}>{safe?<Image src={path} width={42} height={42} alt="" unoptimized className="h-10 w-10 object-contain"/>:<BookOpenText size={25} aria-hidden="true"/>}</span>;
}
function TopicCount({count,ar,accent}:{count:number;ar:boolean;accent:string}){
 return <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold" style={{color:accent,backgroundColor:accent+'16'}}><Calculator size={15} aria-hidden="true"/><span className="tabular-nums">{count}</span>{ar?'مسألة':'problems'}</span>;
}
function TopicHeading({name,icon,count,accent,ar}:{name:string;icon:string;count:number;accent:string;ar:boolean}){
 return <div className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><TopicIcon icon={icon} accent={accent}/><h3 className="min-w-0 break-words text-base font-extrabold sm:text-lg" style={{color:accent}}>{name}</h3></div><TopicCount count={count} accent={accent} ar={ar}/></div>;
}
function PublicTrackDetails({id,ar}:{id:number;ar:boolean}){
 const {currentData:data,isFetching,isError,refetch}=useGetPublishedTrackQuery(id,{refetchOnMountOrArgChange:true});
 const [expanded,setExpanded]=useState<number|null>(null);
 if(isFetching&&!data)return <MathWorldLoading compact mode="tab"/>;
 if(isError)return <p role="alert">{ar?'تعذّر تحميل المسار.':'Could not load track.'} <button onClick={()=>void refetch()} className={btn}>{ar?'إعادة المحاولة':'Retry'}</button></p>;
 if(!data)return null;
 const accent=getStageAccent({Id:data.Track.StageId});
 return <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.22}} className="space-y-5">
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.Categories.map(c=><article key={c.Id} className="relative flex min-h-44 flex-col gap-3 overflow-hidden rounded-2xl border bg-card/90 p-5 shadow-sm transition-shadow hover:shadow-md" style={{borderColor:accent+'40'}}>
 <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{backgroundColor:accent}}/>
 <TopicHeading name={ar?c.NameAr:c.NameEn} icon={c.Icon} count={c.ProblemsCount} accent={accent} ar={ar}/>
 <p className="text-sm leading-7 text-muted-foreground">{ar?c.DescriptionAr:c.DescriptionEn}</p>
 <div className="mt-auto border-t border-border/60 pt-3"><button className="inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold hover:bg-muted" onClick={()=>setExpanded(c.Id)}><ListChecks size={16} style={{color:accent}}/>{ar?'عرض المهارات':'View skills'}</button></div>
 </article>)}</div>
 <Dialog open={expanded!==null} onOpenChange={v=>{if(!v)setExpanded(null)}}><DialogContent><DialogHeader><DialogTitle>{ar?'المهارات التعليمية':'Learning skills'}</DialogTitle><DialogDescription>{data.Categories.find(c=>c.Id===expanded)?.[ar?'NameAr':'NameEn']}</DialogDescription></DialogHeader><ul className="max-h-[55vh] space-y-3 overflow-y-auto ps-4">{data.Skills.filter(s=>s.CategoryId===expanded).map(s=><li key={s.Id}><strong>{ar?s.NameAr:s.NameEn}</strong><p className="text-sm text-muted-foreground">{ar?s.DescriptionAr:s.DescriptionEn}</p></li>)}</ul></DialogContent></Dialog>
 {data.Examples.length>0&&<section className="rounded-2xl border bg-card/80 p-5"><h3 className="mb-3 font-bold">{ar?'أمثلة من عناوين المسائل':'Example problem titles'}</h3><ul className="list-disc space-y-2 ps-5 text-sm leading-7">{data.Examples.map(p=><li key={p.Id}>{(ar?p.TitleAr:p.TitleEn).split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g).map((part,i)=>part.startsWith('$$')&&part.endsWith('$$')?<LatexPreview key={i} latex={part.slice(2,-2)}/>:part.startsWith('$')&&part.endsWith('$')?<LatexPreview key={i} latex={part.slice(1,-1)}/>:<span key={i}>{part}</span>)}</li>)}</ul></section>}
 </motion.div>;
}
export function PublicTrackCatalog({stageId}:{stageId:number}){
 const ar=useLocale()==='ar';const {currentData:data}=useGetPublishedTracksQuery(stageId,{refetchOnMountOrArgChange:120});
 const [selected,setSelected]=useState<number|null>(null);
 useEffect(()=>{const m=/^#track-(\d+)$/.exec(window.location.hash);if(m)setSelected(Number(m[1]));},[stageId]);
 if(!data?.Enabled||!data.Items.length)return null;
 const effective=data.Items.find(x=>x.Id===selected)?.Id??data.Items[0].Id;
 return <section className="mb-8 space-y-5"><h2 className="text-xl font-bold">{stageId===4?(ar?'المساقات الجامعية':'University courses'):(ar?'الصفوف الدراسية':'School grades')}</h2>
 <Tabs dir={ar?'rtl':'ltr'} value={String(effective)} onValueChange={v=>setSelected(Number(v))}>
 <TabsList className="grid h-auto grid-cols-2 gap-1.5 p-2 sm:grid-cols-3 lg:grid-cols-6">{data.Items.map(t=><TabsTrigger key={t.Id} value={String(t.Id)} className="min-h-11 w-full whitespace-normal px-3 py-3 text-center font-bold">{ar?t.NameAr:t.NameEn}</TabsTrigger>)}</TabsList>
 {data.Items.filter(t=>t.Id===effective).map(t=><div key={t.Id} className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border bg-card/70 px-4 py-3 text-sm text-muted-foreground"><span className="flex items-center gap-2"><GraduationCap size={17} style={{color:getStageAccent({Id:stageId})}}/><GradeAge code={t.Code} ar={ar}/></span><span className="flex items-center gap-1.5"><Calculator size={16} style={{color:getStageAccent({Id:stageId})}}/>{t.ProblemsCount} {ar?'مسألة':'problems'}</span><span className="flex items-center gap-1.5"><ListChecks size={16} style={{color:getStageAccent({Id:stageId})}}/>{t.SkillsCount} {ar?'مهارة':'skills'}</span></div>)}
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
  if(!data||!stats)return <MathWorldLoading compact mode="tab"/>;
  const byId=new Map(stats.Categories.map(c=>[c.CategoryId,c]));
  const accent=getStageAccent({Id:data.Track.StageId});
  return <main className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:p-6" style={{'--stage-accent':accent} as CSSProperties}>
    <header className="flex flex-wrap items-center justify-between gap-2"><h1 className="flex items-center gap-3 text-2xl font-extrabold sm:text-3xl" style={{color:accent}}><GraduationCap size={27} aria-hidden="true"/>{ar?data.Track.NameAr:data.Track.NameEn}</h1><Link className={btn} href="/learning-stage">{ar?'تغيير الصف أو المساق':'Change grade or course'}</Link></header>
    <Dialog open={!!target} onOpenChange={open=>{if(!open&&!resetState.isLoading)setTarget(null)}}><DialogContent><DialogHeader><DialogTitle>{ar?'تأكيد إعادة التدريب':'Confirm practice restart'}</DialogTitle><DialogDescription>{target?.name}</DialogDescription></DialogHeader><p>{ar?'يعود تقدم التدريب ودفتر الأخطاء في هذا النطاق فقط إلى البداية. النقاط الدائمة والمفضلة والشهادات وتقدم الصفوف الأخرى محفوظة.':'Only practice progress and review errors in this scope reset. Lifetime points, favorites, certificates and other tracks remain.'}</p>{error&&<p role="alert" className="text-destructive">{error}</p>}<DialogFooter><button className={btn} disabled={resetState.isLoading} onClick={()=>setTarget(null)}>{ar?'إلغاء':'Cancel'}</button><button className={btn+' bg-primary text-primary-foreground'} disabled={resetState.isLoading} onClick={()=>void confirm()}>{ar?'تأكيد':'Confirm'}</button></DialogFooter></DialogContent></Dialog>
    {notice&&<p role="status" className="text-primary">{notice}</p>}
    <section className="rounded-xl border bg-card p-4"><p className="flex flex-wrap items-center justify-between gap-2 font-semibold"><span>{ar?'التقدم':'Progress'}</span><span dir="ltr" className="tabular-nums" style={{color:accent}}>{stats.Solved} / {stats.ProblemsCount} · {stats.CompletionPercent}%</span></p><progress aria-label={ar?'تقدم المسار':'Track progress'} className="mw-stage-progress mt-3 w-full" max={100} value={stats.CompletionPercent}/>{stats.TrackPracticeIsolationEnabled&&stats.Categories.some(c=>c.Attempted>0)&&<button className={btn} disabled={resetState.isLoading} onClick={()=>{setError('');setNotice('');setTarget({name:ar?data.Track.NameAr:data.Track.NameEn})}}>{ar?'إعادة تدريب الصف أو المساق':'Restart grade or course'}</button>}</section>
    <div className="grid gap-3 sm:grid-cols-2">{data.Categories.map(c=>{const p=byId.get(c.Id);const locked=!p||p.IsLocked;return <article key={c.Id} className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-card p-5 shadow-sm" style={{borderColor:accent+'40'}}>
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{backgroundColor:accent}}/><TopicHeading name={ar?c.NameAr:c.NameEn} icon={c.Icon} count={c.ProblemsCount} accent={accent} ar={ar}/>
      <p className="text-sm text-muted-foreground">{ar?c.DescriptionAr:c.DescriptionEn}</p>
      <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground"><span>{ar?'محلولة':'Solved'}: <b dir="ltr">{p?.Solved??0}/{c.ProblemsCount}</b></span><progress aria-label={ar?'تقدم الفئة':'Topic progress'} className="mw-stage-progress min-w-0 flex-1" max={Math.max(1,c.ProblemsCount)} value={p?.Solved??0}/></div>
      <div className="flex flex-wrap gap-2 border-t border-border/60 pt-3"><button className={btn+' inline-flex items-center gap-2'} onClick={()=>setSkills(c.Id)}><ListChecks size={16} style={{color:accent}}/>{ar?'عرض المهارات':'View skills'}</button>
      {locked?<LockedPremiumDialog topicName={ar?c.NameAr:c.NameEn}><button className={btn+' inline-flex items-center gap-2'}><LockKeyhole size={16}/>{ar?'ترقية الحساب':'Upgrade account'}</button></LockedPremiumDialog>:<button className={btn+' inline-flex items-center gap-2'} aria-expanded={category===c.Id} onClick={()=>setCategory(category===c.Id?null:c.Id)}><BookOpenText size={16} style={{color:accent}}/>{ar?'عرض المسائل':'View problems'}</button>}{!locked&&stats.TrackPracticeIsolationEnabled&&(p?.Attempted??0)>0&&<button className={btn} disabled={resetState.isLoading} onClick={()=>{setError('');setNotice('');setTarget({categoryId:c.Id,name:ar?c.NameAr:c.NameEn})}}><RotateCcw size={15} className="me-1 inline"/>{ar?'إعادة تدريب الفئة':'Restart topic'}</button>}</div>
      {!locked&&category===c.Id&&<Practice key={c.Id} id={trackId} categoryId={c.Id} ar={ar}/>}
    </article>;})}</div>
    <Dialog open={skills!==null} onOpenChange={open=>{if(!open)setSkills(null)}}><DialogContent><DialogHeader><DialogTitle>{ar?'المهارات التعليمية':'Learning skills'}</DialogTitle><DialogDescription>{data.Categories.find(c=>c.Id===skills)?.[ar?'NameAr':'NameEn']}</DialogDescription></DialogHeader><ul className="max-h-[55vh] space-y-3 overflow-y-auto">{data.Skills.filter(s=>s.CategoryId===skills).map(s=><li key={s.Id} className="flex gap-2"><ListChecks size={17} className="mt-1 shrink-0" style={{color:accent}}/><div><strong>{ar?s.NameAr:s.NameEn}</strong><p className="text-sm text-muted-foreground">{ar?s.DescriptionAr:s.DescriptionEn}</p></div></li>)}</ul></DialogContent></Dialog>
  </main>;
}
