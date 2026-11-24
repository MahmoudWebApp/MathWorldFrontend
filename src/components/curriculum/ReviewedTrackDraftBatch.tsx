'use client';
import {useState} from 'react';
import {useReviewedTrackDraftBatchMutation,type ReviewedTrackDraftBatch} from '@/store/api/stagesApi';
export default function ReviewedTrackDraftBatchPanel({ar,disabled}:{ar:boolean;disabled:boolean}){
  const [run,{isLoading}]=useReviewedTrackDraftBatchMutation();
  const [preview,setPreview]=useState<ReviewedTrackDraftBatch|null>(null);
  const [notice,setNotice]=useState('');
  const [error,setError]=useState('');
  const ready=preview?.Items.filter(i=>i.Status==='Ready').length??0;
  async function execute(confirm:boolean){
    if(disabled||isLoading||confirm&&!preview)return;
    setNotice('');setError('');
    try{
      const result=await run(confirm?{Confirm:true,Revisions:preview!.Items.map(({Id,Revision})=>({Id,Revision}))}:{Confirm:false}).unwrap();
      if(confirm){setPreview(null);setNotice(ar?'تم حفظ روابط المسارات كمسودات: '+result.AppliedTracks:'Draft track mappings saved: '+result.AppliedTracks);}
      else setPreview(result);
    }catch(e){
      const detail=(e as {data?:{Message?:string;Code?:string;ProblemIds?:number[]}})?.data;
      const messages:Record<string,string[]>={
        TrackBatchSourceChanged:['تغيّر مصدر بعض المسائل. لم تُحفظ أي روابط.','Some source questions changed. No mappings were saved.'],
        TrackBatchExistingMapping:['يوجد ربط سابق مختلف. لن تتم الكتابة فوقه.','Existing mappings differ. Nothing will be overwritten.'],
        TrackChanged:['تغيرت البيانات. أعد المعاينة.','Data changed. Preview again.'],
        TrackBatchRevisionRequired:['بيانات التأكيد غير صالحة. أعد المعاينة.','Invalid confirmation. Preview again.'],
        TrackBatchIdentityMissing:['مسار مطلوب غير موجود.','A required track is missing.'],
        UnpublishOrRefreshTrack:['توجد مسارات منشورة. لن يتم تعديلها.','Published tracks will not be modified.']
      };
      setError(messages[detail?.Message??'']?.[ar?0:1]??(ar?'تعذّر استكمال الدفعة. لم يتم تأكيد الحفظ.':'Batch request failed; saving was not confirmed.'));
      setPreview(null);
    }
  }
  return <section className="space-y-3 rounded-2xl border bg-card p-4">
    <h2 className="font-bold">{ar?'دفعة ربط الصفوف والمساقات المراجعة':'Reviewed grade and course mapping batch'}</h2>
    <p className="text-sm text-muted-foreground">{ar?'يعرض الخادم العدد الفعلي للمسائل والمسارات المرشحة عند المعاينة، ويتحقق من المصدر الحالي، ويستثني المسائل المعلقة والمساقات الجديدة. لا نشر تلقائي ولا تغيير لصلاحيات Free.':'Preview shows the actual number of candidate questions and tracks. The server rechecks the current source, excluding held items and proposed new courses. No automatic publication or Free-access changes.'}</p>
    {disabled&&<p className="text-sm text-muted-foreground">{ar?'أغلق محرر المسار قبل تشغيل الدفعة.':'Close the track editor before running the batch.'}</p>}
    <button type="button" className="rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50" disabled={isLoading||disabled} onClick={()=>void execute(false)}>{isLoading?(ar?'جارٍ التحقق…':'Checking…'):(ar?'معاينة الدفعة':'Preview batch')}</button>
    {preview&&<div className="space-y-3">
      <p className="text-sm">{ar?'مسارات جاهزة للحفظ':'Tracks ready to save'}: {ready} · {ar?'مسائل مرشحة':'Candidate questions'}: {preview.Items.reduce((total,x)=>total+x.Problems,0)} · {ar?'مسائل مستثناة':'Excluded questions'}: {preview.ExcludedCount}</p>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-start"><th className="p-2 text-start">{ar?'المسار':'Track'}</th><th className="p-2">{ar?'المسائل':'Questions'}</th><th className="p-2">Free</th><th className="p-2">{ar?'الحالة':'Status'}</th></tr></thead><tbody>{preview.Items.map(x=><tr className="border-b" key={x.Id}><td className="p-2" dir="ltr">{x.Code}</td><td className="p-2 text-center">{x.Problems}</td><td className="p-2 text-center">{x.FreeProblems}</td><td className="p-2 text-center">{x.FreeProblems===0?(ar?'لا تغطية مجانية':'No Free coverage'):x.Status==='AlreadyMapped'?(ar?'مرتبط':'Mapped'):(ar?'جاهز كمسودة':'Draft ready')}</td></tr>)}</tbody></table></div>
      <p className="text-sm text-muted-foreground">{ar?'الحفظ لا ينشر المسارات. المسارات ذات تغطية Free صفر تحتاج معالجة قبل النشر.':'Saving does not publish tracks. Zero-Free-coverage tracks need resolution before publication.'}</p>
      <div className="flex gap-2"><button type="button" disabled={disabled||isLoading||ready===0} className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50" onClick={()=>void execute(true)}>{ar?'تأكيد حفظ المسودات':'Confirm draft mappings'}</button><button type="button" className="rounded-xl border px-3 py-2 text-sm" disabled={isLoading} onClick={()=>setPreview(null)}>{ar?'إلغاء':'Cancel'}</button></div>
    </div>}
    {notice&&<p role="status" className="text-sm">{notice}</p>}
    {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
  </section>;
}
