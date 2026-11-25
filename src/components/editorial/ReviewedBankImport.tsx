'use client';

import {useRef,useState} from 'react';
import {useDispatch} from 'react-redux';
import {platformBrandApi} from '@/store/api/platformBrandApi';
import {useLocale} from 'next-intl';
import {HeldWordingImport} from './HeldWordingImport';
import {LatexPreview} from '@/components/ui/LatexPreview';
import {useLazyGetReviewedBankInfoQuery,useLazyGetReviewedBankBatchQuery,useImportReviewedHintsMutation,useImportEditorialBatchMutation,useImportEditorialAmendmentsMutation,useEditorialActionMutation,type ReviewedBankInfo,type ReviewedBankBatch,type ReviewedBankKind,type ReviewedHintRow,type ReviewedDraftState,type AmendmentImportRow,type EditorialImportRow,type Bilingual} from '@/store/api/platformBrandApi';

const button='rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50';
const labels:Record<ReviewedBankKind,[string,string]>={amendments:['تحسين الحلول','Structured improvements'],hints:['التلميحات فقط','Hints only'],'new-existing':['مسائل جديدة','New questions'],'new-missing':['مسائل المساقات الجديدة','New-course questions']};
type Row=ReviewedBankBatch['Items'][number];
type Preview={ready:number;token?:string};
type BulkPlan={batch:ReviewedBankBatch;ready:number;issue?:string};
function sameDraft(a:ReviewedDraftState,b:ReviewedDraftState){return a.Id===b.Id&&a.Revision===b.Revision&&a.Status===b.Status&&a.MatchesCandidate===b.MatchesCandidate;}
function messageOf(e:unknown,ar:boolean){
  const x=e as {data?:{Message?:string;message?:string;Errors?:string[];errors?:{validation?:string[]};Items?:{ProblemId?:number;ContentKey?:string;Errors?:string[]}[]};message?:string};
  const rows=x.data?.Items?.filter(r=>r.Errors?.length).slice(0,3).map(r=>(r.ProblemId??r.ContentKey??'')+': '+r.Errors!.join(', '))??[];
  return [x.data?.Message??x.data?.message??x.message??(ar?'تعذّر إتمام العملية':'Operation failed'),...(x.data?.Errors??[]),...(x.data?.errors?.validation??[]),...rows].join(' · ');
}
function shouldStop(e:unknown){const status=(e as {status?:number|string})?.status;return status===401||status===403||status===429||typeof status==='string'||(typeof status==='number'&&status>=500);}

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
  const dispatch=useDispatch();
  const refreshAfterPublication=()=>{dispatch(platformBrandApi.util.invalidateTags(['EditorialDraft']));};
  const [loadInfo]=useLazyGetReviewedBankInfoQuery();const [loadBatch]=useLazyGetReviewedBankBatchQuery();
  const [importAmendments]=useImportEditorialAmendmentsMutation();const [importNew]=useImportEditorialBatchMutation();
  const [importHints]=useImportReviewedHintsMutation();const [action]=useEditorialActionMutation();
  const [info,setInfo]=useState<ReviewedBankInfo>();const [batch,setBatch]=useState<ReviewedBankBatch>();
  const [preview,setPreview]=useState<Preview>();const [note,setNote]=useState('');
  const [busy,setBusy]=useState(false);const [status,setStatus]=useState('');const [error,setError]=useState('');
  const [bulk,setBulk]=useState<BulkPlan[]>([]);
  const [scanComplete,setScanComplete]=useState(false);
  const [advanced,setAdvanced]=useState(false);
  const running=useRef(false);const stop=useRef(false);
  async function run(task:()=>Promise<void>){
    if(running.current)return;running.current=true;stop.current=false;setBusy(true);setError('');setStatus('');
    try{await task();}catch(e){
      setError(messageOf(e,ar));
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
  // Reconcile a transient failure with persisted state before attempting another write.
  async function publishMatching(current:ReviewedBankBatch,d:ReviewedDraftState){
    const increments=d.Status==='Draft'?3:d.Status==='PendingReview'?2:d.Status==='Approved'?1:0;
    if(!increments)throw Error('UnexpectedDraftStatus');
    for(let attempt=0;attempt<3;attempt++){
      try{
        const result=await action({id:d.Id,action:'publish',Revision:d.Revision,Confirm:true,DirectApproval:true,DeferRefresh:true,Note:note.trim()}).unwrap();
        if(result.Status!=='Published'||result.Revision!==d.Revision+increments)throw Error('UnexpectedEditorialTransition');
        return;
      }catch(e){
        const code=(e as {status?:number|string})?.status;
        if(!(code==='FETCH_ERROR'||code==='TIMEOUT_ERROR'||code===500||code===502||code===503||code===504)||attempt===2||stop.current)throw e;
        setStatus(ar?'انقطع الاتصال مؤقتاً، جارٍ التحقق من حالة المسألة #'+d.Id:'Temporary connection issue; checking question #'+d.Id);
        await new Promise<void>(resolve=>window.setTimeout(resolve,1500*(attempt+1)));
        if(stop.current)throw e;
        const fresh=await loadCurrent(current);
        const actual=fresh.Drafts.find(x=>x.Id===d.Id&&x.ContentKey===d.ContentKey);
        if(fresh.MissingMappings!==0||!actual||!actual.MatchesCandidate)throw e;
        if(actual.Status==='Published'&&actual.Revision===d.Revision+increments&&actual.PublishedProblemId)return;
        if(!sameDraft(d,actual))throw e;
      }
    }
  }
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
          setStatus((ar?'نشر الدفعة: ':'Publishing batch: ')+done+'/'+selected.length+' · #'+d.Id);
          await publishMatching(current,d);
          done++;
        }
      }finally{try{await refresh(current);}finally{refreshAfterPublication();}}
      setStatus((ar?'مسودات نُشرت فعلياً: ':'Drafts published: ')+done+'/'+selected.length);
    });
  }
  // Bulk operations use the existing bounded, authenticated admin APIs.
  // Preview is read-only; import and publication require separate confirmation.
  const bulkReady=bulk.reduce((n,p)=>n+(p.issue?0:p.ready),0);
  const bulkDrafts=bulk.reduce((n,p)=>n+(p.issue?0:p.batch.Drafts.filter(eligible).length),0);
  const bulkPublished=bulk.reduce((n,p)=>n+p.batch.Drafts.filter(d=>d.Status==='Published').length,0);
  const bulkBlocked=bulk.filter(p=>!!p.issue).length;
  function planKey(b:ReviewedBankBatch){return b.Kind+':'+b.Number;}
  function replacePlan(p:BulkPlan){setBulk(prev=>prev.map(x=>planKey(x.batch)===planKey(p.batch)?p:x));}
  async function loadCurrent(b:{Kind:ReviewedBankKind;Number:number}){
    return loadBatch({kind:b.Kind,number:b.Number},false).unwrap();
  }
  async function inspect(current:ReviewedBankBatch):Promise<BulkPlan>{
    if(current.MissingMappings>0)throw Error(ar?'ربط المسارات غير مكتمل':'Track mapping is incomplete');
    const remaining=pendingRows(current);
    const ready=remaining.length?(await execute(current,false)).ready:0;
    if(ready!==remaining.length)throw Error(ar?'المعاينة لا تشمل كل العناصر المتبقية':'Preview does not cover all remaining items');
    return {batch:current,ready};
  }
  async function scan(){
    setScanComplete(false);setBulk([]);setBatch(undefined);setPreview(undefined);
    const catalog=await loadInfo(undefined,false).unwrap();setInfo(catalog);
    const groups=catalog.Batches.filter(b=>b.Kind!=='hints');
    let i=0;
    for(const group of groups){
      if(stop.current)break;
      setStatus((ar?'معاينة الدفعات: ':'Checking batches: ')+(i+1)+'/'+groups.length);
      const current=await loadCurrent(group);
      let plan:BulkPlan;
      try{plan=await inspect(current);}
      catch(e){plan={batch:current,ready:0,issue:messageOf(e,ar)};if(shouldStop(e)){setBulk(prev=>[...prev,plan]);throw e;}}
      setBulk(prev=>[...prev,plan]);i++;
    }
    setScanComplete(i===groups.length);
    setStatus((stop.current?(ar?'أوقفت المعاينة عند ':'Preview stopped at '):(ar?'اكتملت المعاينة: ':'Preview complete: '))+i+'/'+groups.length);
  }
  function scanAll(){void run(scan);}
  function importAll(){
    if(!scanComplete||!bulkReady)return;
    const selected=bulk.filter(p=>!p.issue&&p.ready>0);
    if(!window.confirm(ar?'إنشاء '+bulkReady+' مسودة جاهزة دون نشر؟ سيتم تجاوز الدفعات المعلقة.':'Create '+bulkReady+' ready drafts without publishing? Blocked batches will be skipped.'))return;
    void run(async()=>{
      setScanComplete(false);let created=0,processed=0;
      try{
        for(const plan of selected){
          if(stop.current)break;
          setStatus((ar?'استيراد المسودات: ':'Importing drafts: ')+(processed+1)+'/'+selected.length+' · '+created);
          let latest=plan.batch;
          try{
            latest=await loadCurrent(plan.batch);
            if(latest.MissingMappings>0||JSON.stringify(pendingRows(latest))!==JSON.stringify(pendingRows(plan.batch)))
              throw Error(ar?'تغيّرت الدفعة؛ أعد المعاينة':'Batch changed; preview again');
            const result=await execute(latest,true);
            created+=result.count;
            latest=await loadCurrent(plan.batch);
            replacePlan(await inspect(latest));
          }catch(e){replacePlan({batch:latest,ready:0,issue:messageOf(e,ar)});if(shouldStop(e))throw e;}
          processed++;
        }
      }finally{onChanged();}
      setScanComplete(processed===selected.length&&!stop.current);
      setStatus((ar?'المسودات المنشأة فعلياً: ':'Drafts created: ')+created+' · '+processed+'/'+selected.length+(ar?' دفعة':' batches'));
    });
  }
  function publishAll(){
    if(!scanComplete||!info?.PublicationEnabled||!note.trim()||!bulkDrafts)return;
    const selected=bulk.filter(p=>!p.issue&&p.batch.MissingMappings===0).map(p=>({plan:p,drafts:p.batch.Drafts.filter(eligible)})).filter(x=>x.drafts.length);
    const total=selected.reduce((n,x)=>n+x.drafts.length,0);
    if(!total||!window.confirm(ar?'هل راجعت محتوى المسودات المطابقة وتؤكد اعتماد ونشر '+total+' مسألة؟ لن تُنشر المسائل المعلقة أو المعدلة.':'Have you reviewed the matching content and confirm approval and publication of '+total+' questions? Held and changed items are excluded.'))return;
    void run(async()=>{
      setScanComplete(false);let done=0;
      try{
        for(const {plan,drafts} of selected){
          if(stop.current)break;
          let latest=await loadCurrent(plan.batch);
          if(latest.MissingMappings>0||drafts.some(d=>!latest.Drafts.some(x=>sameDraft(d,x)&&eligible(x)))){
            replacePlan({batch:latest,ready:0,issue:ar?'تغيّرت المسودات؛ راجعها مجدداً':'Drafts changed; review again'});
            continue;
          }
          let issue:string|undefined;
          try{
            for(const d of drafts){
              if(stop.current)break;
              setStatus((ar?'نشر المسائل: ':'Publishing questions: ')+done+'/'+total+' · #'+d.Id);
          await publishMatching(plan.batch,d);
          done++;
            }
          }catch(e){issue=messageOf(e,ar);if(shouldStop(e))throw e;}
          finally{latest=await loadCurrent(plan.batch);replacePlan({batch:latest,ready:0,issue});}
        }
      }finally{refreshAfterPublication();}
      setStatus((ar?'مسائل نُشرت فعلياً: ':'Questions actually published: ')+done+'/'+total+(ar?' · أعد المعاينة لتحديث الحالة':' · Preview again to refresh status'));
    });
  }
  const count=batch?.Drafts.filter(eligible).length??0;
  return <section className="space-y-3 rounded-xl border p-4">
    <h3 className="font-bold">{ar?'استيراد واعتماد بنك المسائل':'Import and approve reviewed question bank'}</h3>
    <p className="text-sm text-muted-foreground">{ar?'معاينة واحدة لكل الدفعات، ثم استيراد المسودات الجاهزة، ثم اعتماد النشر بعد مراجعة المحتوى. المسائل المعلقة مستثناة دائماً.':'One preview for every batch, then import ready drafts and approve publication after review. Held questions always stay excluded.'}</p>
    <div className="space-y-3 rounded-xl border p-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-sm">
        {[{label:ar?'جاهزة للاستيراد':'Ready to import',n:bulkReady},{label:ar?'مسودات مطابقة':'Matching drafts',n:bulkDrafts},{label:ar?'منشورة':'Published',n:bulkPublished},{label:ar?'دفعات تحتاج مراجعة':'Blocked batches',n:bulkBlocked}].map(x=><div key={x.label} className="rounded-lg border p-2"><strong className="block text-lg tabular-nums">{bulk.length?x.n:'—'}</strong>{x.label}</div>)}
      </div>
      {info&&<p className="text-sm">{ar?'مسائل مستثناة للمراجعة: ':'Held questions: '}{info.HeldCount}{!info.PublicationEnabled&&(ar?' · النشر معطّل على الخادم':' · Publication disabled on server')}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={button} disabled={busy} onClick={scanAll}>{ar?'1. معاينة جميع الدفعات':'1. Preview all batches'}</button>
        <button type="button" className={button} disabled={busy||!scanComplete||!bulkReady} onClick={importAll}>{ar?'2. إنشاء كل المسودات الجاهزة':'2. Import all ready drafts'}</button>
        {busy&&<button type="button" className={button} onClick={()=>{stop.current=true;}}>{ar?'إيقاف بعد العملية الحالية':'Stop after current operation'}</button>}
      </div>
      {bulk.length>0&&<details><summary className="cursor-pointer text-sm">{ar?'مراجعة تفاصيل الدفعات':'Review batch details'}</summary>
        <div className="mt-2 max-h-[55vh] space-y-2 overflow-y-auto">
          {bulk.map(p=><details key={planKey(p.batch)} className="rounded-lg border p-2 text-sm"><summary className="cursor-pointer">{labels[p.batch.Kind][lang]} {p.batch.Number} · {p.batch.Items.length} · {p.issue?(ar?'تحتاج مراجعة':'Review required'):(ar?'تم التحقق':'Checked')}</summary>
            {p.issue&&<p role="alert" className="break-words text-destructive">{p.issue}</p>}
            {p.batch.Items.map(row=><Candidate key={keyOf(row)} row={row} ar={ar} draft={p.batch.Drafts.find(d=>d.ContentKey===keyOf(row))}/>)}
          </details>)}
        </div>
      </details>}
      {bulkDrafts>0&&<><label className="block text-sm">{ar?'ملاحظة اعتماد المحتوى (بعد مراجعته)':'Content review note'}<textarea className="mt-1 w-full rounded-lg border bg-background p-2" maxLength={2000} value={note} disabled={busy} onChange={e=>setNote(e.target.value)}/></label>
      <button type="button" className={button} disabled={busy||!scanComplete||!info?.PublicationEnabled||!note.trim()} onClick={publishAll}>{ar?'3. اعتماد ونشر المسودات المطابقة ('+bulkDrafts+')':'3. Approve and publish matching drafts ('+bulkDrafts+')'}</button></>}
    </div>
    <button type="button" className={button} disabled={busy} onClick={()=>{setAdvanced(v=>!v);setScanComplete(false);}}>{advanced?(ar?'إخفاء الخيارات المتقدمة':'Hide advanced options'):(ar?'خيارات متقدمة: دفعة واحدة أو تصحيح الحالات المعلقة':'Advanced: individual batches or held corrections')}</button>
    {advanced&&<>
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
    <HeldWordingImport onChanged={()=>{setScanComplete(false);onChanged();}}/>
    </>}
    {busy&&!status&&<p role="status">{ar?'جارٍ التحقق…':'Working…'}</p>}
    {status&&<p role="status" className="text-sm">{status}</p>}{error&&<p role="alert" className="break-words text-sm text-destructive">{error}</p>}
  </section>;
}
