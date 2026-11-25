'use client';
import {useRef,useState} from 'react';
import {useReviewedTrackDraftBatchMutation,useGetAdminTracksQuery,useCreateTrackMutation,type CreateTrackInput,type ReviewedTrackDraftBatch} from '@/store/api/stagesApi';
const proposed:CreateTrackInput[]=[
  {StageId:4,Code:'numerical-analysis',Kind:'course',NameAr:'التحليل العددي',NameEn:'Numerical Analysis',DescriptionAr:'تقريب الجذور والتكاملات وحل الأنظمة الخطية وتحليل الخطأ.',DescriptionEn:'Approximate roots, integrals and linear systems, and analyze numerical error.',SortOrder:6},
  {StageId:4,Code:'mathematical-optimization',Kind:'course',NameAr:'التحسين الرياضي',NameEn:'Mathematical Optimization',DescriptionAr:'دراسة التحدب والقيم المثلى المقيدة وغير المقيدة.',DescriptionEn:'Study convexity and constrained and unconstrained optima.',SortOrder:7}
];
export default function ReviewedTrackDraftBatchPanel({ar,disabled}:{ar:boolean;disabled:boolean}){
  const [run,{isLoading}]=useReviewedTrackDraftBatchMutation();
  const tracks=useGetAdminTracksQuery();
  const [create]=useCreateTrackMutation();
  const [creating,setCreating]=useState(false);const locked=useRef(false);
  const missing=tracks.currentData?proposed.filter(p=>!tracks.currentData!.Items.some(x=>x.Track.StageId===p.StageId&&x.Track.Code===p.Code)):[];
  async function createMissing(){
    if(disabled||isLoading||locked.current||!missing.length||!window.confirm(ar?'إنشاء المساقات الناقصة كمسودات غير منشورة؟':'Create missing courses as unpublished drafts?'))return;
    locked.current=true;setCreating(true);setPreview(null);setError('');setNotice('');
    try{
      const latest=await tracks.refetch().unwrap();
      let count=0;
      for(const p of proposed){
        if(latest.Items.some(x=>x.Track.StageId===p.StageId&&x.Track.Code===p.Code))continue;
        await create(p).unwrap();count++;
      }
      setNotice(ar?'مساقات مسودة أُنشئت: '+count:'Draft courses created: '+count);
    }catch(e){setError((e as {data?:{message?:string}}).data?.message??(ar?'لم يكتمل الإنشاء؛ حدّث الحالة وأعد المحاولة.':'Creation incomplete; refresh and retry.'));}
    finally{await tracks.refetch();locked.current=false;setCreating(false);}
  }
  const [preview,setPreview]=useState<ReviewedTrackDraftBatch|null>(null);
  const [notice,setNotice]=useState('');
  const [error,setError]=useState('');
  const ready=preview?.Items.filter(i=>i.Status==='Ready').length??0;
  async function execute(confirm:boolean){
    if(disabled||isLoading||creating||locked.current||missing.length||!tracks.currentData||confirm&&!preview)return;
    locked.current=true;
    setNotice('');setError('');
    try{
      const result=await run(confirm?{Confirm:true,Revisions:preview!.Items.map(({Id,Revision})=>({Id,Revision}))}:{Confirm:false}).unwrap();
      if(confirm){setPreview(null);setNotice(ar?'تم حفظ روابط المسارات كمسودات: '+result.AppliedTracks:'Draft track mappings saved: '+result.AppliedTracks);}
      else setPreview(result);
    }catch(e){
      const detail=(e as {data?:{message?:string;Message?:string;Code?:string;ProblemIds?:number[]}})?.data;
      const messages:Record<string,string[]>={
        TrackBatchSourceChanged:['تغيّر مصدر بعض المسائل. لم تُحفظ أي روابط.','Some source questions changed. No mappings were saved.'],
        TrackBatchExistingMapping:['يوجد ربط سابق مختلف. لن تتم الكتابة فوقه.','Existing mappings differ. Nothing will be overwritten.'],
        TrackChanged:['تغيرت البيانات. أعد المعاينة.','Data changed. Preview again.'],
        TrackBatchRevisionRequired:['بيانات التأكيد غير صالحة. أعد المعاينة.','Invalid confirmation. Preview again.'],
        TrackBatchIdentityMissing:['مسار مطلوب غير موجود.','A required track is missing.'],
        UnpublishOrRefreshTrack:['توجد مسارات منشورة. لن يتم تعديلها.','Published tracks will not be modified.']
      };
      setError(messages[detail?.message??detail?.Message??'']?.[ar?0:1]??(ar?'تعذّر استكمال الدفعة. لم يتم تأكيد الحفظ.':'Batch request failed; saving was not confirmed.'));
      setPreview(null);
    }finally{locked.current=false;}
  }
  return <section className="space-y-3 rounded-2xl border bg-card p-4">
    <h2 className="font-bold">{ar?'دفعة ربط الصفوف والمساقات المراجعة':'Reviewed grade and course mapping batch'}</h2>
    <p className="text-sm text-muted-foreground">{ar?'يعرض الخادم العدد الفعلي للمسائل والمسارات المرشحة عند المعاينة، ويتحقق من المصدر الحالي، ويستثني المسائل المعلقة فقط. لا نشر تلقائي ولا تغيير لصلاحيات Free.':'Preview shows the actual number of candidate questions and tracks. The server rechecks the current source, excluding held items only. No automatic publication or Free-access changes.'}</p>
    {disabled&&<p className="text-sm text-muted-foreground">{ar?'أغلق محرر المسار قبل تشغيل الدفعة.':'Close the track editor before running the batch.'}</p>}
    {tracks.isError&&<button type="button" disabled={creating||isLoading} onClick={()=>void tracks.refetch()}>{ar?'إعادة تحميل المسارات':'Reload tracks'}</button>}
    {!!missing.length&&<div className="space-y-2 rounded-xl border p-3"><p className="text-sm">{ar?'المساقات الناقصة قبل الربط':'Missing courses before mapping'}: {missing.map(p=>ar?p.NameAr:p.NameEn).join(' · ')}</p><button type="button" className="rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50" disabled={disabled||creating||isLoading} onClick={()=>void createMissing()}>{ar?'إنشاء المساقات الناقصة كمسودات':'Create missing draft courses'}</button></div>}
    <button type="button" className="rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50" disabled={isLoading||disabled||creating||!tracks.currentData||!!missing.length} onClick={()=>void execute(false)}>{isLoading?(ar?'جارٍ التحقق…':'Checking…'):(ar?'معاينة الدفعة':'Preview batch')}</button>
    {preview&&<div className="space-y-3">
      <p className="text-sm">{ar?'مسارات جاهزة للحفظ':'Tracks ready to save'}: {ready} · {ar?'مسائل مرشحة':'Candidate questions'}: {preview.Items.reduce((total,x)=>total+x.Problems,0)} · {ar?'مسائل مستثناة':'Excluded questions'}: {preview.ExcludedCount}</p>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-start"><th className="p-2 text-start">{ar?'المسار':'Track'}</th><th className="p-2">{ar?'المسائل':'Questions'}</th><th className="p-2">Free</th><th className="p-2">{ar?'الحالة':'Status'}</th></tr></thead><tbody>{preview.Items.map(x=><tr className="border-b" key={x.Id}><td className="p-2" dir="ltr">{x.Code}</td><td className="p-2 text-center">{x.Problems}</td><td className="p-2 text-center">{x.FreeProblems}</td><td className="p-2 text-center">{x.FreeProblems===0?(ar?'لا تغطية مجانية':'No Free coverage'):x.Status==='AlreadyMapped'?(ar?'مرتبط':'Mapped'):(ar?'جاهز كمسودة':'Draft ready')}</td></tr>)}</tbody></table></div>
      <p className="text-sm text-muted-foreground">{ar?'الحفظ لا ينشر المسارات. المسارات الجامعة دون تغطية Free تتطلب تأكيد Premium صريحاً قبل النشر.':'Saving does not publish tracks. University courses without Free coverage require explicit Premium-only confirmation before publication.'}</p>
      <div className="flex gap-2"><button type="button" disabled={disabled||isLoading||ready===0} className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50" onClick={()=>void execute(true)}>{ar?'تأكيد حفظ المسودات':'Confirm draft mappings'}</button><button type="button" className="rounded-xl border px-3 py-2 text-sm" disabled={isLoading} onClick={()=>setPreview(null)}>{ar?'إلغاء':'Cancel'}</button></div>
    </div>}
    {notice&&<p role="status" className="text-sm">{notice}</p>}
    {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
  </section>;
}
