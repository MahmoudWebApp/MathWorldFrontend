'use client';
import {useEffect,useRef,useState} from 'react';
import {useParams} from 'next/navigation';
import {useLocale} from 'next-intl';
import {Link} from '@/i18n/routing';
import {LatexPreview} from '@/components/ui/LatexPreview';
import {RichText} from '@/components/ui/RichText';
import {useGetLearningJourneyQuery,useGetCurrentLearningSessionQuery,useLazyGetLearningSessionByIdQuery,useLazyPreviewSessionRestartQuery,useConfirmSessionRestartMutation,useStartLearningSessionMutation,useAnswerLearningSessionMutation,useRevealLearningSessionHintMutation,type SessionKind,type SessionScope,type LearningSessionState,type SessionAnswerBody,type SessionAnswerResult,type SessionHints,type SessionRestartPreview} from '@/store/api/usersApi';

const button='rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-50';
const secondary='rounded-xl border px-4 py-2 font-semibold disabled:opacity-50';
function status(e:unknown){return typeof e==='object'&&e&&'status' in e?e.status:undefined}
export default function SessionPage(){
  const ar=useLocale()==='ar';const {kind}=useParams<{kind:string}>();
  const journey=useGetLearningJourneyQuery(undefined,{refetchOnMountOrArgChange:true});
  const [category,setCategory]=useState<number|undefined>(undefined);
  if(journey.isLoading)return <main className="p-6" role="status">{ar?'جارٍ التحميل…':'Loading…'}</main>;
  const data=journey.currentData;
  if(journey.isError||!data)return <main className="p-6"><button className={secondary} onClick={()=>void journey.refetch()}>{ar?'إعادة المحاولة':'Retry'}</button></main>;
  if(!data.LearningSessionsEnabled||(kind!=='practice'&&kind!=='daily'))return <main className="p-6"><p>{ar?'الجلسات غير متاحة حالياً':'Sessions are not available'}</p><Link href="/dashboard">{ar?'الرئيسية':'Dashboard'}</Link></main>;
  const allowed=data.Categories.filter(c=>c.IsLocked===false&&c.TotalProblems>=5);
  const selected=kind==='practice'&&allowed.some(c=>c.CategoryId===category)?category:undefined;
  const scope:SessionScope={Kind:kind,StageId:data.StageId,TrackId:data.TrackId,CategoryId:selected};
  return <>{kind==='practice'&&<div className="mx-auto max-w-3xl px-4 pt-4"><label className="flex flex-wrap items-center gap-3 text-sm font-semibold">{ar?'نطاق التدريب':'Practice scope'}<select className="min-h-10 rounded-xl border bg-background px-3" value={selected??''} onChange={e=>setCategory(e.target.value?Number(e.target.value):undefined)}><option value="">{ar?'كل الفئات المتاحة':'All available topics'}</option>{allowed.map(c=><option key={c.CategoryId} value={c.CategoryId}>{ar?c.NameAr:c.NameEn}</option>)}</select></label></div>}<SessionFlow key={kind+':'+data.StageId+':'+(data.TrackId??0)+':'+(selected??0)} scope={scope}/></>;
}
function SessionFlow({scope}:{scope:SessionScope}){
  const ar=useLocale()==='ar'; const kind:SessionKind=scope.Kind;
  const current=useGetCurrentLearningSessionQuery(scope,{refetchOnMountOrArgChange:true});
  const [getById,byIdState]=useLazyGetLearningSessionByIdQuery();
  const [start,startState]=useStartLearningSessionMutation();
  const [previewRestart,previewState]=useLazyPreviewSessionRestartQuery();
  const [confirmRestart,confirmState]=useConfirmSessionRestartMutation();
  const [preview,setPreview]=useState<SessionRestartPreview|null>(null);
  const [resetNote,setResetNote]=useState('');
  const [resetDone,setResetDone]=useState(false);
  const [answer,answerState]=useAnswerLearningSessionMutation();
  const [reveal,hintState]=useRevealLearningSessionHintMutation();
  const [session,setSession]=useState<LearningSessionState|null>(null);
  const [result,setResult]=useState<SessionAnswerResult|null>(null);
  const [selected,setSelected]=useState<number|null>(null);
  const [hints,setHints]=useState<SessionHints|null>(null);
  const [count,setCount]=useState(5);
  const [error,setError]=useState('');
  const pending=useRef<SessionAnswerBody|null>(null);
  const starting=useRef<{RequestId:string;Count:number}|null>(null);
  const lock=useRef(false);
  const busy=startState.isLoading||answerState.isLoading||hintState.isLoading||current.isFetching||byIdState.isFetching||previewState.isFetching||confirmState.isLoading;
  const view=session??(resetDone?null:current.currentData)??null;
  const q=view?.CurrentQuestion;
  const unavailable=current.isError&&status(current.error)!==404&&!session;
  const message=(e:unknown)=>status(e)===403?(ar?'لا تملك صلاحية هذه الجلسة.':'This session is not available for your account.'):status(e)===409?(ar?'تغيّرت الجلسة أو لم تعد المسائل متاحة. أعد تحميل الجلسة.':'Session or content changed. Reload the session.'):(ar?'تعذّر الاتصال. أعد المحاولة.':'Could not connect. Retry.');
  function clear(){setResult(null);setSelected(null);setHints(null);setError('');pending.current=null;}
  async function reload(){
    if(lock.current)return;lock.current=true;
    try{
      let fresh:LearningSessionState|null;
      try{fresh=view?await getById(view.Id,false).unwrap():await current.refetch().unwrap();}
      catch(e){
        if(view&&(status(e)===404||status(e)===409)){
          try{fresh=await current.refetch().unwrap();}
          catch(currentError){if(status(currentError)!==404)throw currentError;fresh=null;}
        }else if(!view&&status(e)===404){fresh=null;}
        else throw e;
      }
      setSession(fresh);setResetDone(fresh===null);starting.current=null;clear();
    }
    catch(e){setError(message(e));}
    finally{lock.current=false;}
  }
  async function begin(){
    if(lock.current)return;lock.current=true;setError('');
    try{const req=starting.current??{RequestId:crypto.randomUUID(),Count:count};starting.current=req;
      const next=await start({...req,Kind:kind,CategoryId:scope.CategoryId}).unwrap();setSession(next);setResetDone(false);starting.current=null;clear();}
    catch(e){setError(message(e));if(status(e)===400||status(e)===403||status(e)===409)starting.current=null;}
    finally{lock.current=false;}
  }
  async function submit(){
    if(lock.current||preview||!view||!q||selected===null)return;lock.current=true;setError('');
    try{const body=pending.current??{RequestId:crypto.randomUUID(),Position:view.Completed,ProblemId:q.Id,SelectedOptionId:selected};pending.current=body;
      const value=await answer({Id:view.Id,Body:body}).unwrap();setResult(value);pending.current=null;}
    catch(e){setError(message(e));if(status(e)===400||status(e)===403||status(e)===409)pending.current=null;}
    finally{lock.current=false;}
  }
  async function hint(level:number){
    if(lock.current||preview||pending.current||!view||!q)return;lock.current=true;setError('');
    try{setHints(await reveal({Id:view.Id,Position:view.Completed,ProblemId:q.Id,Level:level}).unwrap());}
    catch(e){setError(message(e));}
    finally{lock.current=false;}
  }
  async function loadRestart(){
    if(lock.current||pending.current||starting.current)return;lock.current=true;setResetNote('');
    try{const p=await previewRestart(scope,false).unwrap();
      if(p.StageId!==scope.StageId||(p.TrackId??null)!==(scope.TrackId??null)||(p.CategoryId??null)!==(scope.CategoryId??null))throw Error('scope');
      setPreview(p);}
    catch(e){setError(message(e));}
    finally{lock.current=false;}
  }
  async function restart(){
    if(!preview||lock.current)return;lock.current=true;
    try{await confirmRestart(preview).unwrap();setPreview(null);setSession(null);setResetDone(true);clear();
      setResetNote(ar?'تم إنهاء الجلسات المفتوحة. إنجازاتك ونقاطك محفوظة.':'Open sessions ended. Your achievements and points are preserved.');}
    catch(e){setError(message(e));}
    finally{lock.current=false;}
  }
  useEffect(()=>{setHints(null);},[q?.Id,view?.Completed]);
  return <main className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
    <header className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">{kind==='daily'?(ar?'تحدي اليوم':'Daily challenge'):(ar?'جلسة تدريب':'Practice session')}</h1><Link href="/dashboard" className={secondary}>{ar?'الرئيسية':'Dashboard'}</Link></header>
    {kind==='practice'&&<div className="rounded-xl border bg-card p-3 space-y-2">
      <button className={secondary} disabled={busy||!!preview||!!pending.current||!!starting.current} onClick={()=>void loadRestart()}>{ar?'إعادة بدء الجلسات المفتوحة':'Restart open sessions'}</button>
      {preview&&<div role="group" className="space-y-2"><p>{ar?'سيتم إنهاء الجلسات المفتوحة في النطاق المحدد فقط؛ لا تُحذف النقاط أو الإنجازات أو المحاولات السابقة.':'Only open sessions in this scope end. Points, achievements and previous attempts remain.'}</p><p>{ar?'عدد الجلسات':'Sessions'}: {preview.SessionIds.length}</p><div className="flex flex-wrap gap-2"><button className={button} disabled={busy||!preview.SessionIds.length} onClick={()=>void restart()}>{ar?'تأكيد':'Confirm'}</button><button className={secondary} disabled={busy} onClick={()=>setPreview(null)}>{ar?'إلغاء':'Cancel'}</button></div></div>}
      {resetNote&&<p role="status" className="text-sm">{resetNote}</p>}
    </div>}
    {error&&<div role="alert" className="rounded-xl border p-3 text-sm text-destructive">{error}<button className="ms-3 underline" onClick={()=>void reload()} disabled={busy}>{ar?'تحديث الجلسة':'Reload session'}</button></div>}
    {current.isLoading&&!session?<p role="status">{ar?'جارٍ تحميل الجلسة…':'Loading session…'}</p>:unavailable?<div className="rounded-xl border p-4"><p>{message(current.error)}</p><button className={secondary} onClick={()=>void reload()} disabled={busy}>{ar?'إعادة المحاولة':'Retry'}</button></div>:!view?<section className="space-y-4 rounded-2xl border bg-card p-5">
      <p>{ar?'أجب عن كل مسألة بشكل صحيح لتنتقل إلى التالية. يمكنك المتابعة من جهاز آخر.':'Answer correctly to advance. Resume on another device.'}</p>
      {kind==='practice'&&<label className="flex items-center gap-3">{ar?'عدد المسائل':'Questions'}<select value={count} onChange={e=>setCount(Number(e.target.value))} disabled={busy||!!starting.current} className="rounded-lg border bg-background p-2">{[5,6,7,8,9,10].map(n=><option key={n}>{n}</option>)}</select></label>}
      <button className={button} disabled={busy||!!preview} onClick={()=>void begin()}>{ar?'ابدأ':'Start'}</button></section>:<>
      <div className="rounded-xl border bg-card p-4"><p className="font-semibold">{ar?'التقدم':'Progress'}: {result?.Completed??view.Completed} / {view.Total}</p><progress className="mt-2 w-full" max={view.Total} value={result?.Completed??view.Completed}/></div>
      {view.IsComplete&&!result?<section className="space-y-3 rounded-2xl border bg-card p-6 text-center"><h2 className="text-xl font-bold">{ar?'أحسنت! اكتملت الجلسة':'Well done! Session complete'}</h2><Link href="/dashboard" className={button}>{ar?'العودة للرئيسية':'Back to dashboard'}</Link>{kind==='practice'&&<button className={secondary} onClick={()=>void begin()} disabled={busy}>{ar?'جلسة جديدة':'New session'}</button>}</section>:q&&<section className="space-y-4 rounded-2xl border bg-card p-5">
        <RichText text={ar?q.QuestionTextAr:q.QuestionTextEn} isArabic={ar}/>
        <div className="grid gap-2">{q.Options.map(o=><button key={o.Id} type="button" aria-pressed={selected===o.Id} disabled={busy||!!preview||!!result||!!pending.current} onClick={()=>setSelected(o.Id)} className={'min-h-12 rounded-xl border p-3 text-start '+(selected===o.Id?'border-primary bg-primary/10':'')}><LatexPreview latex={o.LatexCode}/></button>)}</div>
        {!result&&<><button className={button} disabled={busy||!!preview||selected===null} onClick={()=>void submit()}>{ar?'تحقق من الإجابة':'Check answer'}</button>
          {view.CanUseHints&&<div className="space-y-2">{(hints?.Hints??[]).map(h=><div className="rounded-lg bg-muted p-3" key={h.Level}><RichText text={h.Text} isArabic={ar}/></div>)}
          {hints?.Available===false?<p className="text-sm text-muted-foreground">{ar?'لا تتوفر تلميحات مراجعة لهذه المسألة.':'Reviewed hints are not available for this problem.'}</p>:<div className="flex flex-wrap gap-2">{!hints&&view.HintsRevealed>0&&<button className={secondary} disabled={busy||!!preview||!!pending.current} onClick={()=>void hint(0)}>{ar?'عرض التلميحات السابقة':'Restore hints'}</button>}{(hints?.RevealedCount??view.HintsRevealed)<(hints?.HintCount??2)&&<button className={secondary} disabled={busy||!!preview||!!pending.current} onClick={()=>void hint((hints?.RevealedCount??view.HintsRevealed)+1)}>{ar?'عرض التلميح':'Reveal hint'} {(hints?.RevealedCount??view.HintsRevealed)+1}</button>}</div>}</div>}</>}
        {result&&!result.IsCorrect&&<div role="status" className="space-y-3"><p className="font-semibold">{ar?'حاول مرة أخرى، يمكنك الوصول للحل.':'Try again. You can solve this.'}</p><button className={button} onClick={()=>{setResult(null);setSelected(null)}}>{ar?'حاول مرة أخرى':'Try again'}</button></div>}
        {result?.IsCorrect&&<div role="status" className="space-y-3 rounded-xl border p-4"><p className="font-bold text-emerald-600">{ar?'إجابة صحيحة':'Correct answer'} · +{result.PointsEarned}</p>
          {result.SolutionStructure?<div className="space-y-3"><RichText text={result.SolutionStructure.Idea} isArabic={ar}/><LatexPreview latex={result.SolutionStructure.FormulaLatex} block/><ol className="list-decimal space-y-2 ps-5">{result.SolutionStructure.Steps.map((s,i)=><li key={i}><RichText text={s} isArabic={ar}/></li>)}</ol>{[result.SolutionStructure.Substitution,result.SolutionStructure.Result+' '+result.SolutionStructure.Unit,result.SolutionStructure.Verification,result.SolutionStructure.CommonError].map((s,i)=><RichText key={i} text={s} isArabic={ar}/>)}</div>:<RichText text={(ar?result.DetailedSolutionAr:result.DetailedSolutionEn)??''} isArabic={ar}/>}
          <button className={button} onClick={()=>void reload()} disabled={busy}>{result.IsComplete?(ar?'عرض النتيجة':'View result'):(ar?'المسألة التالية':'Next question')}</button></div>}
      </section>}
    </>}
  </main>;
}
