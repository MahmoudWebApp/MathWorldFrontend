'use client';
import {useRef,useState} from 'react';
import {useLocale} from 'next-intl';
import {useImportEditorialAmendmentsMutation,type AmendmentImportRow,type AmendmentImportResult} from '@/store/api/platformBrandApi';
import {MAX_BATCH_BYTES,readAmendmentFile} from './editorialBatchFiles';
const btn='rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50';
export function AmendmentBatchImport(){
  const ar=useLocale()==='ar';
  const [rows,setRows]=useState<AmendmentImportRow[]>();
  const [result,setResult]=useState<AmendmentImportResult>();
  const [error,setError]=useState('');
  const [reading,setReading]=useState(false);
  const [run,{isLoading}]=useImportEditorialAmendmentsMutation();
  const latest=useRef(0);
  const busy=reading||isLoading;
  async function load(file?:File){
    const id=++latest.current;setRows(undefined);setResult(undefined);setError('');setReading(false);
    if(!file)return;
    setReading(true);
    try{
      if(file.size>MAX_BATCH_BYTES)throw Error('BatchLimit');
      const data=readAmendmentFile(await file.text());
      if(id===latest.current)setRows(data);
    }catch{if(id===latest.current)setError(ar?'ملف تعديل غير صالح أو محجوز للمراجعة. الحد 50 مسألة.':'Invalid or held amendment file. Limit: 50 problems.');}
    finally{if(id===latest.current)setReading(false);}
  }
  async function submit(confirm:boolean){
    if(!rows||busy||(confirm&&!(result?.Ready&&result.Ready>0)))return;
    setResult(undefined);setError('');
    try{
      const value=await run({Items:rows,Confirm:confirm}).unwrap();
      setResult(value);if(confirm)setRows(undefined);
    }catch{
      setError(ar?'رفض الخادم الدفعة أو تعذّر الاتصال. تحقق من تطابق المصدر وعدم وجود مسودات مفتوحة ثم أعد المعاينة.':'The server rejected the batch or could not be reached. Check unchanged sources and open drafts, then preview again.');
    }
  }
  return <details className="rounded-xl border p-4"><summary className="cursor-pointer font-bold">{ar?'استيراد تحسينات المسائل الموجودة':'Import existing problem improvements'}</summary><div className="mt-3 space-y-3">
    <p className="text-sm text-muted-foreground">{ar?'اختر ملف تحسينات معتمداً للمراجعة (حتى 50 مسألة). يتحقق الخادم من السؤال والحل السابق ومعرفات الخيارات. التأكيد ينشئ مسودات فقط، ولا يغيّر التصنيف أو ينشر الحلول.':'Choose an eligible review file (up to 50 problems). The server checks the question, legacy solution and option IDs. Confirmation creates drafts only; classification and publication are unchanged.'}</p>
    <input type="file" accept=".json,application/json" disabled={busy} aria-label={ar?'ملف تحسين المسائل':'Problem amendment file'} onChange={e=>void load(e.target.files?.[0])}/>
    {rows&&<p>{rows.length} {ar?'مسألة':'problems'}</p>}
    <div className="flex flex-wrap gap-2"><button type="button" className={btn} disabled={!rows||busy} onClick={()=>void submit(false)}>{ar?'تحقق ومعاينة':'Validate and preview'}</button><button type="button" className={btn} disabled={!rows||busy||!(result?.Ready&&result.Ready>0)} onClick={()=>{if(window.confirm(ar?'إنشاء مسودات تحسين دون نشر؟':'Create amendment drafts without publishing?'))void submit(true);}}>{ar?'إنشاء المسودات':'Create drafts'}</button></div>
    {result&&<div role="status" className="space-y-1 text-sm"><p>{ar?'جاهزة':'Ready'}: {result.Ready??0} · {ar?'مُنشأة':'Created'}: {result.Created}</p>{result.Items.map(row=><p key={row.ProblemId}>#{row.ProblemId} · {row.Status==='AlreadyExists'?(ar?'موجودة مسبقاً':'Already exists'):(ar?'صالحة':'Validated')}</p>)}</div>}
    {error&&<p role="alert" className="text-destructive">{error}</p>}
  </div></details>;
}
