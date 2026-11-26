'use client';
import {useConfirmDialog} from '@/components/ui/useConfirmDialog';
import {useRef,useState} from 'react';
import {useLocale} from 'next-intl';
import {useLazyGetHeldWordingQuery,useImportHeldWordingMutation,type HeldWordingPackage,type AmendmentImportResult} from '@/store/api/platformBrandApi';

const button='rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50';
type Result=AmendmentImportResult['Items'][number];
const errors:Record<string,[string,string]>={
 StudentHistoryRequiresVersioning:['يوجد تاريخ طالب؛ يلزم إصدار مستقل','Learner history exists; versioning is required'],
 HeldWordingSourceChanged:['تغيّر المصدر؛ راجع المسألة','Source changed; review the question'],
 HeldWordingClassificationChanged:['تغيّر الربط أو التصنيف أو المسار منشور','Mapping/classification changed or a track is published'],
 DraftTrackRequired:['المسار المطلوب غير موجود كمسودة','Required draft track is missing'],
 AmendmentAlreadyOpen:['توجد مسودة مراجعة مفتوحة','An amendment is already open'],
};
export function HeldWordingImport({onChanged}:{onChanged:()=>void}){
 const ar=useLocale()==='ar',lang=ar?0:1;
 const {ask,dialog}=useConfirmDialog();
 const [get]=useLazyGetHeldWordingQuery();const [importRows]=useImportHeldWordingMutation();
 const [pack,setPack]=useState<HeldWordingPackage>();const [ids,setIds]=useState<number[]>([]);
 const [review,setReview]=useState<Result[]>([]);const [preview,setPreview]=useState<number[]>();
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [status,setStatus]=useState('');
 const running=useRef(false);
 function existing(p:HeldWordingPackage,id:number){return p.Drafts.find(d=>d.ContentKey==='g1-wording-'+id);}
 async function run(fn:()=>Promise<void>){
   if(running.current)return;running.current=true;setBusy(true);setError('');setStatus('');
   try{await fn();}catch(e){const x=e as {data?:{Message?:string;message?:string;Items?:Result[]};message?:string};
     setError(x.data?.Message??x.data?.message??x.message??(ar?'تعذّر تنفيذ العملية':'Operation failed'));
     setReview(x.data?.Items??[]);setPreview(undefined);
   }finally{running.current=false;setBusy(false);}
 }
 function load(){void run(async()=>{setPreview(undefined);setReview([]);const p=await get(undefined,false).unwrap();setPack(p);setIds(p.Items.filter(r=>!existing(p,r.ProblemId)).map(r=>r.ProblemId));});}
 function toggle(id:number){setPreview(undefined);setReview([]);setIds(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id].sort((a,b)=>a-b));}
 function validate(){if(!ids.length)return;const chosen=[...ids];void run(async()=>{
   setPreview(undefined);setReview([]);const result=await importRows({ProblemIds:chosen,Confirm:false}).unwrap();
   setReview(result.Items);setPreview(chosen);setStatus((ar?'مسودات جاهزة: ':'Drafts ready: ')+(result.Ready??0));
 });}
 async function create(){
   if(!preview?.length||!review.some(r=>r.Status==='Ready'))return;
   if(!await ask(ar?'إنشاء مسودات التصحيح فقط دون نشر؟':'Create correction drafts without publication?'))return;
   const selected=preview;void run(async()=>{
      setPreview(undefined);const result=await importRows({ProblemIds:selected,Confirm:true}).unwrap();
      const p=await get(undefined,false).unwrap();setPack(p);setIds(p.Items.filter(r=>!existing(p,r.ProblemId)).map(r=>r.ProblemId));
      setReview(result.Items);onChanged();setStatus((ar?'مسودات أُنشئت: ':'Drafts created: ')+result.Created);
   });
 }
 return <section className="space-y-3 rounded-xl border p-3">{dialog}
   <h4 className="font-semibold">{ar?'تصحيح صياغة المسائل المعلّقة':'Held question wording corrections'}</h4>
   <p className="text-sm text-muted-foreground">{ar?'النصوص المقترحة محفوظة. لا تتغير الإجابات أو الخيارات أو الفئات؛ وجود تاريخ طالب يمنع التصحيح. يتم إنشاء مسودات فقط، ثم اعتمادها من المحرر المعتاد.':'Fixed wording proposals preserve answers, options and categories. Learner history blocks correction. This creates drafts only; use the existing editor to review and publish.'}</p>
   <button type="button" className={button} onClick={load} disabled={busy}>{ar?'تحميل مقترحات التصحيح':'Load wording proposals'}</button>
   {pack&&<>
     <p className="text-sm">{ar?'المقترحات':'Proposals'}: {pack.Items.length} · {ar?'المختارة':'Selected'}: {ids.length} · {ar?'المسودات':'Drafts'}: {pack.Drafts.length}</p>
     <div className="max-h-[50vh] space-y-2 overflow-y-auto">
       {pack.Items.map(r=>{const d=existing(pack,r.ProblemId),result=review.find(x=>x.ProblemId===r.ProblemId);return <div key={r.ProblemId} className="rounded-lg border p-2 text-sm">
         <label className="flex items-start gap-2"><input type="checkbox" checked={ids.includes(r.ProblemId)} disabled={busy||!!d} onChange={()=>toggle(r.ProblemId)}/><span>#{r.ProblemId} · {ar?r.ProposedQuestion.Ar:r.ProposedQuestion.En}</span></label>
         <details className="mt-1"><summary className="cursor-pointer">{ar?'النص الأصلي والتصحيح':'Original and proposed wording'}</summary>
           <p dir="rtl" lang="ar">{r.Content.Question?.Ar}</p><p dir="ltr" lang="en">{r.Content.Question?.En}</p>
           <div className="mt-2 border-t pt-2"><p dir="rtl" lang="ar">{r.ProposedQuestion.Ar}</p><p dir="ltr" lang="en">{r.ProposedQuestion.En}</p></div>
         </details>
         {d&&<p>{ar?'مسودة':'Draft'} #{d.Id} · {d.Status}</p>}
         {result?.Errors?.length? <p role="alert" className="text-destructive">{result.Errors.map(x=>errors[x]?.[lang]??x).join(' · ')}</p>:result&&<p>{result.Status}</p>}
       </div>;})}
     </div>
     <div className="flex flex-wrap gap-2">
       <button type="button" className={button} disabled={busy||!ids.length} onClick={validate}>{ar?'معاينة والتحقق من التاريخ':'Preview and check history'}</button>
       {review.some(r=>r.Status==='Invalid')&&review.some(r=>r.Status==='Ready')&&<button type="button" className={button} disabled={busy} onClick={()=>{setIds(review.filter(r=>r.Status==='Ready').map(r=>r.ProblemId));setPreview(undefined);setReview([]);}}>{ar?'اختيار الجاهزة فقط':'Select ready only'}</button>}
       <button type="button" className={button} disabled={busy||!preview?.length||!review.some(r=>r.Status==='Ready')} onClick={create}>{ar?'إنشاء المسودات':'Create drafts'}</button>
     </div>
   </>}
   {busy&&<p role="status">{ar?'جارٍ التحقق…':'Checking…'}</p>}{status&&<p role="status">{status}</p>}{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
 </section>;
}
