'use client';
import { useEffect,useRef,useState } from 'react';
import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { Link } from '@/i18n/routing';
import { GraduationCap, FileDown, Printer } from 'lucide-react';
import { WorkspacePageHeader } from '@/components/ui/WorkspacePageHeader';
import { MathWorldLoading } from '@/components/ui/MathWorldLoading';
import { PopoverConfirm } from '@/components/ui/PopoverConfirm';
import { Dialog,DialogContent,DialogHeader,DialogTitle } from '@/components/ui/Dialog';
import { LatexPreview } from '@/components/ui/LatexPreview';
import { useGetStudentEntitlementQuery,useGetCustomExamSetupQuery,useGetCustomExamsQuery,useLazyGetCustomExamQuery,useStartCustomExamMutation,useAnswerCustomExamMutation,useFinishCustomExamMutation,useAbandonCustomExamMutation,useDownloadExamCertificateMutation,type CustomExam } from '@/store/api/usersApi';

function MathText({value}:{value:string}) {
  return <span className="whitespace-pre-wrap break-words">{value.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g).map((p,i)=>p.startsWith('$$')&&p.endsWith('$$')?<LatexPreview key={i} latex={p.slice(2,-2)} block/>:p.startsWith('$')&&p.endsWith('$')?<LatexPreview key={i} latex={p.slice(1,-1)}/>:<span key={i}>{p}</span>)}</span>;
}
const btn='rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50';
export default function ExamsPage(){
  const owner=useSelector((s:RootState)=>s.auth.user?.Id);
  return owner?<ExamWorkspace key={owner}/>:null;
}
function ExamWorkspace(){
  const ar=useLocale()==='ar';
  const tr=(a:string,e:string)=>ar?a:e;
  const entitlement=useGetStudentEntitlementQuery();
  const premium=entitlement.currentData?.IsPremium===true;
  const setup=useGetCustomExamSetupQuery(undefined,{skip:!premium,refetchOnMountOrArgChange:true});
  const history=useGetCustomExamsQuery(undefined,{refetchOnMountOrArgChange:true});
  const [load]=useLazyGetCustomExamQuery();
  const [start]=useStartCustomExamMutation();
  const [answer]=useAnswerCustomExamMutation();
  const [finish]=useFinishCustomExamMutation();
  const [abandon]=useAbandonCustomExamMutation();
  const [pdf]=useDownloadExamCertificateMutation();
  const [certificate,setCertificate]=useState<{url:string;filename:string}|null>(null);
  const mounted=useRef(true);
  useEffect(()=>{mounted.current=true;return ()=>{mounted.current=false;};},[]);
  useEffect(()=>()=>{if(certificate)URL.revokeObjectURL(certificate.url);},[certificate]);
  const [exam,setExam]=useState<CustomExam|null>(null);
  const [category,setCategory]=useState<number|null>(null);
  const [count,setCount]=useState(10);
  const [difficulty,setDifficulty]=useState<number|null>(null);
  const [chosen,setChosen]=useState<number|null>(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const lock=useRef(false),request=useRef<string|null>(null);
  async function run(action:()=>Promise<void>){if(lock.current)return;lock.current=true;setBusy(true);setError('');try{await action();}catch(e){
    const code=(e as {data?:{message?:string}})?.data?.message;
    setError(code==='InsufficientExamProblems'?tr('لا توجد مسائل كافية لهذا العدد.','Not enough questions for this count.'):code==='ActiveExamExists'?tr('استأنف أو ألغِ الامتحان المفتوح أولاً.','Resume or abandon the active exam first.'):code==='ExamScopeChanged'?tr('تغيّر الصف؛ يمكنك إلغاء الامتحان القديم.','Your grade changed; abandon the old exam.'):tr('تعذر إكمال الطلب. حاول مجدداً.','Request failed. Please retry.'));
  }finally{lock.current=false;setBusy(false);}}
  function selectExam(e:CustomExam){setExam(e);setChosen(null);}
  const active=history.currentData?.Items.find(e=>!e.FinishedAtUtc&&!e.AbandonedAtUtc);
  const q=exam?.CurrentQuestion;
  const scoped=setup.currentData?.Categories.filter(c=>category===null||c.Id===category)??[];
  const max=scoped.reduce((sum,c)=>sum+(difficulty===null?c.Count:(c.DifficultyCounts?.find(d=>d.Level===difficulty)?.Count??0)),0);
  const download=(id:string)=>void run(async()=>{
    const blob=await pdf({id,lang:ar?'ar':'en'}).unwrap();
    if(blob.type!=='application/pdf'||(await blob.slice(0,5).text())!=='%PDF-')throw Error('Invalid PDF');
    if(mounted.current)setCertificate({url:URL.createObjectURL(blob),filename:'mathworld-exam-'+id+'.pdf'});
  });
  const cancel=(id:string)=>run(async()=>{await abandon(id).unwrap();setExam(null);setChosen(null);request.current=null;await history.refetch();});
  return <main className="container mx-auto max-w-4xl space-y-4 px-4 py-6">
    <WorkspacePageHeader title={tr('الامتحانات المخصصة','Custom exams')} icon={GraduationCap}/>
    <Dialog open={!!certificate} onOpenChange={open=>{if(!open)setCertificate(null);}}><DialogContent className="max-w-4xl max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>{tr('معاينة شهادة الامتحان','Exam certificate preview')}</DialogTitle></DialogHeader>{certificate&&<><iframe title={tr('معاينة الشهادة PDF','PDF certificate preview')} src={certificate.url} className="h-[55dvh] w-full rounded-xl border bg-muted"/><div className="flex flex-wrap gap-2"><a className={btn+' inline-flex items-center gap-2'} href={certificate.url} download={certificate.filename}><FileDown className="h-4 w-4"/>{tr('تحميل PDF','Download PDF')}</a><a className={btn+' inline-flex items-center gap-2'} href={certificate.url} target="_blank" rel="noopener noreferrer"><Printer className="h-4 w-4"/>{tr('فتح للطباعة','Open for printing')}</a></div><p className="text-xs text-muted-foreground">{tr('استخدم زر الطباعة في قارئ PDF. إذا لم تظهر المعاينة، افتح الملف أو نزّله.','Use the print control in your PDF viewer. If preview is unavailable, open or download the file.')}</p></>}</DialogContent></Dialog>
    {error&&<p role="alert" className="rounded-xl border border-destructive/30 p-3 text-destructive">{error}</p>}
    {entitlement.isLoading?<MathWorldLoading compact/>:!premium?<div className="rounded-2xl border bg-card p-5"><p>{tr('الامتحانات الجديدة متاحة لحساب Premium. تبقى شهاداتك السابقة متاحة.','New exams require Premium. Your previous certificates remain available.')}</p><Link href="/dashboard/upgrade" className="mt-3 inline-block font-bold text-primary">{tr('ترقية الحساب','Upgrade account')}</Link></div>:null}
    {exam&&!exam.AbandonedAtUtc?<section className="space-y-4 rounded-2xl border bg-card p-4 sm:p-6">
      <h2 className="text-lg font-bold">{ar?exam.TitleAr:exam.TitleEn}</h2>
      {exam.FinishedAtUtc?<><p className="text-xl font-bold">{exam.Score}/{exam.Total} — {exam.Passed?tr('ناجح','Passed'):tr('لم تجتز','Not passed')}</p>
        {exam.CertificateIssued&&<button disabled={busy} className={btn+' mw-reward flex items-center gap-2'} onClick={()=>download(exam.Id)}><FileDown className="h-4 w-4"/>{tr('معاينة الشهادة','Preview certificate')}</button>}
        <h3 className="font-bold">{tr('مراجعة الإجابات','Review answers')}</h3>
        {exam.Review?.map((r,i)=><div key={r.Question.Id} className="rounded-xl border p-3"><p>{i+1}. <MathText value={ar?r.Question.QuestionTextAr:r.Question.QuestionTextEn}/></p>{r.Question.Options.map(o=><div key={o.Id} className={'my-1 rounded-lg p-2 '+(o.Id===r.CorrectOptionId?'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300':o.Id===r.SelectedOptionId?'bg-destructive/10 text-destructive':'')}><LatexPreview latex={o.LatexCode}/>{o.Id===r.SelectedOptionId&&<span className="ms-2 text-xs">{tr('إجابتك','Your answer')}</span>}</div>)}</div>)}
        <button className={btn} onClick={()=>setExam(null)}>{tr('العودة للامتحانات','Back to exams')}</button>
      </>:<><p className="text-sm text-muted-foreground">{exam.Answered}/{exam.Total} {tr('إجابة','answered')}</p>
        <progress className="w-full" value={exam.Answered} max={exam.Total}/>
        {q&&<><MathText value={ar?q.QuestionTextAr:q.QuestionTextEn}/><div className="grid gap-2 sm:grid-cols-2">{q.Options.map(o=><button key={o.Id} disabled={busy} aria-pressed={chosen===o.Id} className={btn+(chosen===o.Id?' border-primary bg-primary/10':'')} onClick={()=>setChosen(o.Id)}><LatexPreview latex={o.LatexCode}/></button>)}</div><button className={btn+' bg-primary text-primary-foreground'} disabled={busy||chosen===null} onClick={()=>void run(async()=>selectExam(await answer({id:exam.Id,Position:exam.Answered,OptionId:chosen!}).unwrap()))}>{tr('إرسال الإجابة','Submit answer')}</button></>}
        {exam.Answered===exam.Total&&<button className={btn+' bg-primary text-primary-foreground'} disabled={busy} onClick={()=>void run(async()=>{selectExam(await finish(exam.Id).unwrap());await history.refetch();})}>{tr('إنهاء وتصحيح الامتحان','Finish and grade exam')}</button>}
        <PopoverConfirm onConfirm={()=>cancel(exam.Id)} title={tr('إلغاء الامتحان','Abandon exam')} description={tr('لن تتمكن من استئناف هذا الامتحان.','This exam cannot be resumed.')} trigger={<button className={btn+' text-destructive'} disabled={busy}>{tr('إلغاء الامتحان','Abandon exam')}</button>}/>
      </>}
    </section>:premium&&(setup.isLoading?<MathWorldLoading compact/>:setup.isError?<p className="rounded-xl border p-4">{tr('الامتحانات غير متاحة حالياً أو لم يتم اختيار صف صالح.','Exams are currently unavailable or no eligible grade is selected.')}</p>:setup.currentData&&<section className="space-y-3 rounded-2xl border bg-card p-5">
      <h2 className="font-bold">{ar?setup.currentData.Track.NameAr:setup.currentData.Track.NameEn}</h2>
      <label className="block">{tr('نطاق الامتحان','Exam scope')}<select className="mt-1 block w-full rounded-xl border bg-background p-2" value={category??''} disabled={busy} onChange={e=>{setCategory(e.target.value?Number(e.target.value):null);request.current=null;}}><option value="">{tr('الصف الكامل','Entire grade')}</option>{setup.currentData.Categories.map(c=><option key={c.Id} value={c.Id}>{ar?c.NameAr:c.NameEn} ({c.Count})</option>)}</select></label>
      <label className="block">{tr('مستوى الصعوبة (اختياري)','Difficulty (optional)')}<select className="mt-1 block w-full rounded-xl border bg-background p-2" value={difficulty??''} disabled={busy} onChange={e=>{setDifficulty(e.target.value?Number(e.target.value):null);request.current=null;}}><option value="">{tr('جميع المستويات','All levels')}</option>{[1,2,3,4,5].map(level=><option key={level} value={level} disabled={!scoped.some(c=>c.DifficultyCounts?.some(d=>d.Level===level&&d.Count>0))}>{tr('المستوى','Level')} {level}</option>)}</select></label>
      <p className="text-xs text-muted-foreground">{tr('التصفية تعتمد مستويات الصعوبة المراجعة فقط.','Difficulty filters use reviewed difficulty levels only.')}</p>
      <label className="block">{tr('عدد الأسئلة','Questions')}<select className="mt-1 block w-full rounded-xl border bg-background p-2" value={count} disabled={busy} onChange={e=>{setCount(Number(e.target.value));request.current=null;}}>{setup.currentData.Counts.map(c=><option key={c} value={c} disabled={c>max}>{c}</option>)}</select></label>
      <p className="text-sm text-muted-foreground">{tr('حد النجاح','Pass threshold')}: {setup.currentData.PassPercent}%</p>
      <button className={btn+' bg-primary text-primary-foreground'} disabled={busy||!!active||count>max} onClick={()=>void run(async()=>{request.current??=crypto.randomUUID();selectExam(await start({RequestId:request.current,CategoryId:category,Count:count,DifficultyLevel:difficulty}).unwrap());request.current=null;await history.refetch();})}>{tr('ابدأ الامتحان','Start exam')}</button>
    </section>)}
    <section className="space-y-3 rounded-2xl border bg-card p-4"><h2 className="font-bold">{tr('امتحاناتي وشهاداتي','My exams and certificates')}</h2>
      {history.isLoading?<MathWorldLoading compact/>:history.isError?<p>{tr('السجل غير متاح حالياً.','History is currently unavailable.')}</p>:history.currentData?.Items.map(e=><div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3" key={e.Id}><div><p className="font-semibold">{ar?e.TitleAr:e.TitleEn}</p><p className="text-sm text-muted-foreground">{e.FinishedAtUtc?e.Score+'/'+e.Total:e.AbandonedAtUtc?tr('ملغى','Abandoned'):tr('قيد التنفيذ','In progress')}</p></div><div className="flex flex-wrap gap-2">
      {!e.AbandonedAtUtc&&(premium||!!e.FinishedAtUtc)&&<button className={btn} disabled={busy} onClick={()=>void run(async()=>selectExam(await load(e.Id,false).unwrap()))}>{e.FinishedAtUtc?tr('النتيجة','Result'):tr('استئناف','Resume')}</button>}
      {!e.FinishedAtUtc&&!e.AbandonedAtUtc&&<PopoverConfirm onConfirm={()=>cancel(e.Id)} trigger={<button disabled={busy} className={btn+' text-destructive'}>{tr('إلغاء','Abandon')}</button>}/>}
      {e.CertificateIssued&&<button className={btn+' mw-reward'} disabled={busy} onClick={()=>download(e.Id)}>{tr('الشهادة','Certificate')}</button>}
      </div></div>)}
      {history.currentData?.Items.length===0&&<p className="text-muted-foreground">{tr('لا توجد امتحانات سابقة.','No previous exams.')}</p>}
    </section>
  </main>;
}
