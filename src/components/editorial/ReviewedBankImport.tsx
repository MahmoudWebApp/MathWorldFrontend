'use client';

import {useRef,useState} from 'react';
import {useLocale} from 'next-intl';
import {HeldWordingImport} from './HeldWordingImport';
import {LatexPreview} from '@/components/ui/LatexPreview';
import {useLazyGetReviewedBankInfoQuery,useLazyGetReviewedBankBatchQuery,useImportReviewedHintsMutation,useImportEditorialBatchMutation,useImportEditorialAmendmentsMutation,useEditorialActionMutation,type ReviewedBankInfo,type ReviewedBankBatch,type ReviewedBankKind,type ReviewedHintRow,type ReviewedDraftState,type AmendmentImportRow,type EditorialImportRow,type Bilingual} from '@/store/api/platformBrandApi';

const button='rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50';
const labels:Record<ReviewedBankKind,[string,string]>={amendments:['تحسين الحلول','Structured improvements'],hints:['التلميحات فقط','Hints only'],'new-existing':['مسائل جديدة','New questions'],'new-missing':['مسائل المساقات الجديدة','New-course questions']};
type Row=ReviewedBankBatch['Items'][number];
type Preview={ready:number;token?:string};
function keyOf(row:Row){return 'ContentKey' in row?row.ContentKey:'g1-amend-'+row.ProblemId;}
function Pair({value}:{value?:Bilingual|null}){
  return value?<div className="space-y-1 break-words"><p dir="rtl" lang="ar">{value.Ar}</p><p dir="ltr" lang="en">{value.En}</p></div>:null;
}
function Candidate({row,ar,draft}:{row:Row;ar:boolean;draft?:ReviewedDraftState}){
  const c='Content' in row?row.Content:undefined;
  const question='Question' in row?row.Question:c?.Question;
  const hints='Hints' in row?row.Hints:c?.Hints;
  return <details className="rounded-lg border p-2"><summary className="cursor-pointer break-words text-sm">
    {keyOf(row)} · {ar?question?.Ar:question?.En}{draft&&<span className="block text-xs">{draft.Status} · #{draft.Id}{!draft.MatchesCandidate&&draft.Status!=='Published'?(ar?' · يحتاج مراجعة الربط أو المحتوى':' · Mapping/content review required'):''}</span>}
  </summary><div className="mt-2 space-y-2 text-sm"><Pair value={question}/>
    {c?.Options?.map((o,i)=><div key={i} className="rounded border p-2"><LatexPreview latex={o.LatexCode}/>{o.IsCorrect?<strong className="ms-2">{ar?'صحيح':'Correct'}</strong>:<Pair value={o.Reason}/>}</div>)}
    <strong>{ar?'التلميحات':'Hints'}</strong>{hints?.map((h,i)=><Pair key={i} value={h}/>)}
    {c?.Solution&&<><strong>{ar?'الحل المنظم':'Structured solution'}</strong><Pair value={c.Solution.Idea}/><LatexPreview latex={c.Solution.FormulaLatex} block/>
      {c.Solution.Steps.map((p,i)=><Pair key={i} value={p}/>)}
      {[c.Solution.Substitution,c.Solution.Result,c.Solution.Unit,c.Solution.Verification,c.Solution.CommonError].map((p,i)=><Pair key={i} value={p}/>)}</>}
    {'ExpectedLegacySolution' in row&&<details><summary>{ar?'الحل السابق':'Previous solution'}</summary><Pair value={row.ExpectedLegacySolution}/></details>}
  </div></details>;
}
export function ReviewedBankImport({onChanged}:{onChanged:()=>void}){
  const ar=useLocale()==='ar';const lang=ar?0:1;
  const [loadInfo]=useLazyGetReviewedBankInfoQuery();const [loadBatch]=useLazyGetReviewedBankBatchQuery();
  const [importAmendments]=useImportEditorialAmendmentsMutation();const [importNew]=useImportEditorialBatchMutation();
  const [importHints]=useImportReviewedHintsMutation();const [action]=useEditorialActionMutation();
  const [info,setInfo]=useState<ReviewedBankInfo>();const [batch,setBatch]=useState<ReviewedBankBatch>();
  const [preview,setPreview]=useState<Preview>();const [note,setNote]=useState('');
  const [busy,setBusy]=useState(false);const [status,setStatus]=useState('');const [error,setError]=useState('');
  const running=useRef(false);const stop=useRef(false);
  async function run(task:()=>Promise<void>){
    if(running.current)return;running.current=true;stop.current=false;setBusy(true);setError('');setStatus('');
    try{await task();}catch(e){const x=e as {data?:{message?:string;errors?:{validation?:string[]}};message?:string;status?:number};
      setError([x.data?.message??x.message??(ar?'تعذّر إتمام العملية':'Operation failed'),...(x.data?.errors?.validation??[])].join(' · '));
      setPreview(undefined);
    }finally{running.current=false;setBusy(false);}
  }
  function load(){void run(async()=>{setBatch(undefined);setPreview(undefined);setNote('');setInfo(await loadInfo(undefined,false).unwrap());});}
  async function refresh(current:ReviewedBankBatch){const latest=await loadBatch({kind:current.Kind,number:current.Number},false).unwrap();setBatch(latest);return latest;}
  function select(kind:ReviewedBankKind,number:number){void run(async()=>{setBatch(undefined);setPreview(undefined);setNote('');setBatch(await loadBatch({kind,number},false).unwrap());});}
  function pendingRows(current:ReviewedBankBatch){return current.Items.filter(r=>!current.Drafts.some(d=>d.ContentKey===keyOf(r)));}
  async function execute(current:ReviewedBankBatch,confirm:boolean,p?:Preview){
    if(current.MissingMappings>0)throw Error(ar?'استكمل ربط المسارات أولاً.':'Complete the track mappings first.');
    const rows=pendingRows(current);
    if(!rows.length)return {ready:0,count:0};
    if(current.Kind==='hints'){
      const result=await importHints({Items:rows as ReviewedHintRow[],Confirm:confirm,...(confirm?{PreviewToken:p?.token,ReviewNote:note.trim()}:{})}).unwrap();
      return {ready:result.Ready,token:result.PreviewToken,count:result.Applied};
    }
    const result=current.Kind==='amendments'?await importAmendments({Items:rows as AmendmentImportRow[],Confirm:confirm}).unwrap():
      await importNew({Items:rows as EditorialImportRow[],Confirm:confirm}).unwrap();
    return {ready:result.Ready??0,count:result.Created};
  }
  function validate(){if(!batch)return;const current=batch;void run(async()=>{
    setPreview(undefined);const latest=await refresh(current);const result=await execute(latest,false);setPreview(result);
    setStatus(ar?'تمت المعاينة. جاهزة: '+result.ready:'Preview complete. Ready: '+result.ready);
  });}
  function apply(){
    if(!batch||!preview?.ready||!note.trim())return;
    const current=batch,p=preview;
    if(!window.confirm(current.Kind==='hints'?(ar?'تأكيد نشر التلميحات المراجعة فقط؟':'Publish the reviewed hints only?'):(ar?'تأكيد إنشاء المسودات دون نشر؟':'Create drafts without publishing?')))return;
    void run(async()=>{setPreview(undefined);
      const result=await execute(current,true,p);await refresh(current);onChanged();
      setStatus((current.Kind==='hints'?(ar?'تلميحات مطبقة: ':'Hints applied: '):(ar?'مسودات منشأة: ':'Drafts created: '))+result.count);
    });
  }
  function eligible(d:ReviewedDraftState){return d.MatchesCandidate&&['Draft','PendingReview','Approved'].includes(d.Status);}
  function publish(){
    if(!batch||!info?.PublicationEnabled||!note.trim())return;
    const current=batch;const selected=current.Drafts.filter(eligible);
    if(!selected.length||!window.confirm(ar?'اعتماد ونشر '+selected.length+' مسودة مطابقة بعد مراجعة محتواها؟':'Approve and publish '+selected.length+' matching drafts after reviewing their content?'))return;
    void run(async()=>{
      setPreview(undefined);
      const latest=await refresh(current);
      // Refuse a changed selection rather than approving a different revision from the one shown.
      if(selected.some(d=>!latest.Drafts.some(x=>x.Id===d.Id&&x.Revision===d.Revision&&x.Status===d.Status&&eligible(x))))throw Error(ar?'تغيّرت المسودات. راجعها مجدداً.':'Drafts changed; review again.');
      let done=0;
      try{
        for(const d of selected){
          if(stop.current)break;
          let revision=d.Revision;let state=d.Status;
          setStatus((ar?'نشر الدفعة: ':'Publishing batch: ')+done+'/'+selected.length+' · #'+d.Id);
          if(state==='Draft'){const next=await action({id:d.Id,action:'submit',Revision:revision}).unwrap();revision=next.Revision;state=next.Status;}
          if(state==='PendingReview'){const next=await action({id:d.Id,action:'review',Revision:revision,Confirm:true,Note:note.trim()}).unwrap();revision=next.Revision;state=next.Status;}
          if(state!=='Approved')throw Error('UnexpectedDraftStatus');
          const published=await action({id:d.Id,action:'publish',Revision:revision,Confirm:true}).unwrap();
          if(published.Status!=='Published')throw Error('PublicationNotConfirmed');
          done++;
        }
      }finally{await refresh(current);onChanged();}
      setStatus((ar?'مسودات نُشرت فعلياً: ':'Drafts published: ')+done+'/'+selected.length);
    });
  }
  const count=batch?.Drafts.filter(eligible).length??0;
  return <section className="space-y-3 rounded-xl border p-4">
    <h3 className="font-bold">{ar?'استيراد واعتماد بنك المسائل':'Import and approve reviewed question bank'}</h3>
    <p className="text-sm text-muted-foreground">{ar?'دفعات خاصة بالأدمن فقط، لا تحتاج ملفات. راجع كل دفعة ثم عاينها قبل التأكيد. الحالات المعلقة مستثناة.':'Private admin batches, no files required. Review each batch, then validate before confirmation. Held items are excluded.'}</p>
    <button type="button" className={button} disabled={busy} onClick={load}>{ar?'تحميل الدفعات المجهزة':'Load prepared batches'}</button>
    {info&&<><p className="text-sm">{ar?'مستثناة للمراجعة':'Held for review'}: {info.HeldCount}</p>
      {!info.PublicationEnabled&&<p className="text-sm text-muted-foreground">{ar?'نشر المسودات غير مفعّل على الخادم. يمكن المعاينة والاستيراد فقط.':'Draft publication is disabled on the server. Preview and import only.'}</p>}
      <label className="block text-sm font-semibold">{ar?'الدفعة':'Batch'}<select className="mt-1 w-full rounded-xl border bg-background p-2" disabled={busy} value={batch?batch.Kind+':'+batch.Number:''} onChange={e=>{const [kind,num]=e.target.value.split(':');if(kind&&num)select(kind as ReviewedBankKind,Number(num));}}>
        <option value="">{ar?'اختر دفعة':'Choose a batch'}</option>{info.Batches.map(b=><option key={b.Kind+':'+b.Number} value={b.Kind+':'+b.Number}>{labels[b.Kind][lang]} {b.Number} · {b.Count}</option>)}
      </select></label></>}
    {batch&&<><p className="text-sm">{ar?'عناصر':'Items'}: {batch.Items.length} · {ar?'مسودات':'Drafts'}: {batch.Drafts.length} · {ar?'منشورة':'Published'}: {batch.Drafts.filter(d=>d.Status==='Published').length}</p>
      <div className="max-h-[55vh] space-y-2 overflow-y-auto">{batch.Items.map(row=><Candidate key={keyOf(row)} row={row} ar={ar} draft={batch.Drafts.find(d=>d.ContentKey===keyOf(row))}/>)}</div>
      {batch.Kind==='new-missing'&&<p className="text-sm">{ar?'أنشئ مساقي التحليل العددي والتحسين الرياضي أولاً؛ الخادم يتحقق من الارتباط.':'Create numerical analysis and mathematical optimization first; the server validates track links.'}</p>}
      {batch.Kind==='amendments'&&<p className="text-sm">{ar?'ربط المسائل بالمسارات المراجعة شرط اعتماد الحلول. المسودات المعدلة أو غير المطابقة لا تُعتمد تلقائياً.':'Reviewed track mapping is required. Changed or unmatched drafts are never automatically approved.'}</p>}
      {batch.MissingMappings>0&&<p role="alert" className="text-sm text-destructive">{ar?'مسائل تحتاج ربطاً أو مساقاً قبل الاستيراد: ':'Questions missing a required mapping or course: '}{batch.MissingMappings}</p>}
      <label className="block text-sm">{ar?'ملاحظة المراجعة (مطلوبة للتأكيد)':'Review note (required for confirmation)'}<textarea className="mt-1 w-full rounded-lg border bg-background p-2" maxLength={2000} value={note} disabled={busy} onChange={e=>setNote(e.target.value)}/></label>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={button} disabled={busy||batch.MissingMappings>0||!pendingRows(batch).length} onClick={validate}>{ar?'معاينة والتحقق':'Validate and preview'}</button>
        <button type="button" className={button} disabled={busy||batch.MissingMappings>0||!preview?.ready||!note.trim()||(batch.Kind==='hints'&&!preview.token)} onClick={apply}>{batch.Kind==='hints'?(ar?'نشر التلميحات':'Publish hints'):(ar?'استيراد المسودات':'Import drafts')}</button>
        <button type="button" className={button} disabled={busy||batch.MissingMappings>0||!info?.PublicationEnabled||!count||!note.trim()} onClick={publish}>{ar?'اعتماد ونشر المطابق ('+count+')':'Approve and publish matching ('+count+')'}</button>
        <button type="button" className={button} disabled={busy} onClick={()=>select(batch.Kind,batch.Number)}>{ar?'تحديث الحالة':'Refresh status'}</button>
        {busy&&<button type="button" className={button} onClick={()=>{stop.current=true;}}>{ar?'إيقاف بعد العملية الحالية':'Stop after current operation'}</button>}
      </div>
    </>}
    <HeldWordingImport onChanged={onChanged}/>
    {busy&&!status&&<p role="status">{ar?'جارٍ التحقق…':'Working…'}</p>}
    {status&&<p role="status" className="text-sm">{status}</p>}{error&&<p role="alert" className="break-words text-sm text-destructive">{error}</p>}
  </section>;
}
