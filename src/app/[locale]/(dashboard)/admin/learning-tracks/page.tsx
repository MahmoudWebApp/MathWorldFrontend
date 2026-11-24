'use client';
import {useState} from 'react';
import {useLocale} from 'next-intl';
import {useSelector} from 'react-redux';
import type {RootState} from '@/store';
import {readTrackProposal,MAX_TRACK_PROPOSAL_BYTES} from '@/components/curriculum/trackProposalImport';
import {useGetAdminTracksQuery,useGetAdminTrackQuery,useGetTrackInventoryQuery,useGetAdminStagesQuery,
  useCreateTrackMutation,useMapTrackMutation,usePublishTrackMutation,useUpdateTrackMetadataMutation,type TrackDetail,type TrackMapping,type LearningTrack} from '@/store/api/stagesApi';

const btn='rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50';
const field='w-full rounded-xl border bg-background p-2.5 text-sm';
function message(e:unknown,ar:boolean){
  const code=(e as {data?:{Message?:string}})?.data?.Message;
  const errors:Record<string,[string,string]>={TrackNotReady:['المسار غير جاهز: تحقق من المسائل والمهارات المنشورة وتغطية Free.','Track is not ready: check published skills, problems and Free coverage.'],ProblemPrimarySkillMismatch:['مسألة بلا مهارة أساسية مطابقة للتصنيف.','A problem lacks a matching primary skill.'],SkillCategoryMismatch:['مهارة لا تنتمي إلى الفئة المحددة.','Skill/category mismatch.'],CategoryStageMismatch:['فئة من مرحلة مختلفة.','Category/stage mismatch.'],TrackChanged:['تغير المسار، حدّث البيانات.','Track changed; refresh.'],UnpublishOrRefreshTrack:['ألغِ النشر أو حدّث البيانات أولاً.','Unpublish or refresh first.']};
  return code&&errors[code]?errors[code][ar?0:1]:ar?'تعذّر تنفيذ العملية. راجع البيانات.':'Request failed. Check the data.';
}
function MetadataEditor({track,ar,disabled}:{track:LearningTrack;ar:boolean;disabled:boolean}){
  const [form,setForm]=useState({NameAr:track.NameAr,NameEn:track.NameEn,DescriptionAr:track.DescriptionAr,DescriptionEn:track.DescriptionEn,SortOrder:track.SortOrder});
  const [save,{isLoading}]=useUpdateTrackMetadataMutation();
  const [error,setError]=useState('');
  async function submit(e:React.FormEvent){e.preventDefault();setError('');try{await save({id:track.Id,Revision:track.Revision,...form}).unwrap();}catch(e){setError(message(e,ar));}}
  return <details className="rounded-xl border p-3"><summary className="cursor-pointer font-semibold">{ar?'تعديل الاسم والوصف والترتيب':'Edit name, description and order'}</summary>
    <form onSubmit={submit} className="mt-3 grid gap-2 sm:grid-cols-2">
      <label className="text-sm">{ar?'الاسم بالعربية':'Arabic name'}<input required maxLength={150} className={field} value={form.NameAr} onChange={e=>setForm(f=>({...f,NameAr:e.target.value}))}/></label>
      <label className="text-sm">{ar?'الاسم بالإنجليزية':'English name'}<input required maxLength={150} className={field} value={form.NameEn} onChange={e=>setForm(f=>({...f,NameEn:e.target.value}))}/></label>
      <label className="text-sm">{ar?'الوصف بالعربية':'Arabic description'}<textarea maxLength={1500} className={field} value={form.DescriptionAr} onChange={e=>setForm(f=>({...f,DescriptionAr:e.target.value}))}/></label>
      <label className="text-sm">{ar?'الوصف بالإنجليزية':'English description'}<textarea maxLength={1500} className={field} value={form.DescriptionEn} onChange={e=>setForm(f=>({...f,DescriptionEn:e.target.value}))}/></label>
      <label className="text-sm">{ar?'الترتيب':'Order'}<input type="number" min={0} max={10000} className={field} value={form.SortOrder} onChange={e=>setForm(f=>({...f,SortOrder:Number(e.target.value)}))}/></label>
      <button type="submit" className={btn} disabled={disabled||isLoading}>{isLoading?(ar?'جارٍ الحفظ…':'Saving…'):(ar?'حفظ البيانات':'Save metadata')}</button>
      {disabled&&<p className="text-xs text-muted-foreground">{ar?'احفظ تغييرات الروابط أولاً.':'Save pending mapping changes first.'}</p>}
      {error&&<p role="alert" className="text-destructive text-sm">{error}</p>}
    </form></details>;
}
function MappingEditor({detail,ar}:{detail:TrackDetail;ar:boolean}){
  const t=detail.Track;
  const [mapping,setMapping]=useState<TrackMapping>({CategoryIds:detail.CategoryIds,SkillIds:detail.SkillIds,ProblemIds:detail.ProblemIds});
  const [category,setCategory]=useState<number|undefined>();
  const [page,setPage]=useState(1);
  const [error,setError]=useState('');
  const [confirm,setConfirm]=useState(false);
  const [readingProposal,setReadingProposal]=useState(false);
  const [proposalNotice,setProposalNotice]=useState(false);
  const {data:inventory,isFetching,isError}=useGetTrackInventoryQuery({stageId:t.StageId,page,categoryId:category});
  const [save,{isLoading:saving}]=useMapTrackMutation();
  const [publish,{isLoading:publishing}]=usePublishTrackMutation();
  const disabled=t.IsPublished||saving||publishing||readingProposal;
  const toggle=(key:keyof TrackMapping,id:number,checked:boolean)=>setMapping(m=>({...m,[key]:checked?[...new Set([...m[key],id])]:m[key].filter(x=>x!==id)}));
  const equal=(a:number[],b:number[])=>a.length===b.length&&a.every(x=>b.includes(x));
  const dirty=!equal(mapping.CategoryIds,detail.CategoryIds)||!equal(mapping.SkillIds,detail.SkillIds)||!equal(mapping.ProblemIds,detail.ProblemIds);
  async function loadProposal(file:File){
    if(disabled||dirty)return;
    setError('');setProposalNotice(false);setReadingProposal(true);
    try{
      if(file.size>MAX_TRACK_PROPOSAL_BYTES)throw new Error('InvalidTrackProposal');
      setMapping(readTrackProposal(await file.text(),t.StageId,t.Code));
      setProposalNotice(true);setConfirm(false);
    }catch{
      setError(ar?'الملف غير صالح أو لا يحتوي على اقتراح مطابق لهذا المسار.':'Invalid file or no matching proposal for this track.');
    }finally{setReadingProposal(false);}
  }
  async function saveMapping(){setError('');try{await save({id:t.Id,Revision:t.Revision,...mapping}).unwrap();}catch(e){setError(message(e,ar));}}
  async function publishTrack(){setError('');try{await publish({id:t.Id,Revision:t.Revision,Publish:!t.IsPublished}).unwrap();setConfirm(false);}catch(e){setError(message(e,ar));}}
  const name=(x:{NameAr:string;NameEn:string})=>ar?x.NameAr:x.NameEn;
  return <section className="space-y-4 rounded-2xl border bg-card p-4">
    <div className="flex flex-wrap justify-between gap-2"><h2 className="text-lg font-bold">{name(t)}</h2><span className="text-sm">{t.IsPublished?(ar?'منشور':'Published'):(ar?'مسودة':'Draft')}</span></div>
    <MetadataEditor track={t} ar={ar} disabled={dirty||saving||publishing||readingProposal}/>
    <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
      {[[ar?'فئات صالحة':'Valid categories',detail.Coverage.Categories],[ar?'مهارات أساسية':'Primary skills',detail.Coverage.Skills],[ar?'مسائل جاهزة':'Ready problems',detail.Coverage.Problems],[ar?'مسائل Free':'Free problems',detail.Coverage.FreeProblems]].map(([label,count])=><div key={label} className="rounded-xl border p-3"><p className="text-muted-foreground">{label}</p><p className="text-xl font-bold">{count}</p></div>)}
    </div>
    <p className="text-sm text-muted-foreground">{ar?'اختر التصنيف بعد مراجعة المحتوى. لا يتم نسخ المسألة أو تخمين الصف تلقائياً. يجب إلغاء نشر المسار قبل تعديل روابطه.':'Review content before assigning it. Problems are not copied or automatically classified. Unpublish a track before editing its mappings.'}</p>
    {!t.IsPublished&&<details className="rounded-xl border p-3">
      <summary className="cursor-pointer font-semibold">{ar?'تحميل اقتراح التصنيف':'Load track mapping proposal'}</summary>
      <p className="my-2 text-sm text-muted-foreground">{ar?'يعبّئ الملف روابط المسار المحدد فقط دون حفظ أو نشر. راجع المسائل والمهارات أولاً؛ قد يكون المحتوى قد تغيّر. احفظ أو ألغِ التغييرات الحالية قبل تحميل ملف آخر.':'Prefills this track only, without saving or publishing. Review the questions and skills against the current catalog; content may have changed. Save or discard pending edits before loading another file.'}</p>
      <input type="file" accept=".json,application/json" aria-label={ar?'ملف اقتراح التصنيف':'Track proposal file'} disabled={disabled||dirty} onChange={e=>{const f=e.currentTarget.files?.[0];e.currentTarget.value='';if(f)void loadProposal(f);}}/>
      {readingProposal&&<p role="status">{ar?'جارٍ قراءة الملف…':'Reading proposal…'}</p>}
      {proposalNotice&&<p role="status" className="mt-2 text-sm">{ar?'تم تحميل اقتراح غير محفوظ. راجع التصنيف ثم احفظ الروابط.':'Unsaved proposal loaded. Review the mapping before saving.'}</p>}
      {dirty&&<button type="button" className={btn+' mt-2'} disabled={disabled} onClick={()=>{setMapping({CategoryIds:detail.CategoryIds,SkillIds:detail.SkillIds,ProblemIds:detail.ProblemIds});setProposalNotice(false);setError('');}}>{ar?'إلغاء التغييرات':'Discard changes'}</button>}
    </details>}
    <div className="flex flex-wrap gap-2 text-sm"><span>{ar?'الفئات المختارة':'Selected categories'}: {mapping.CategoryIds.length}</span><span>{ar?'المهارات':'Skills'}: {mapping.SkillIds.length}</span><span>{ar?'المسائل':'Problems'}: {mapping.ProblemIds.length}</span></div>
    {isFetching&&!inventory&&<p role="status">{ar?'جارٍ تحميل المحتوى…':'Loading content…'}</p>}
    {isError&&<p role="alert">{ar?'تعذّر تحميل المحتوى.':'Could not load content.'}</p>}
    {inventory&&<>
      <h3 className="font-semibold">{ar?'الفئات':'Categories'}</h3>
      <div className="grid gap-2 sm:grid-cols-2">{inventory.Categories.map(c=><label key={c.Id} className="flex items-center gap-2 rounded-lg border p-2 text-sm"><input type="checkbox" disabled={disabled} checked={mapping.CategoryIds.includes(c.Id)} onChange={e=>toggle('CategoryIds',c.Id,e.target.checked)}/>{name(c)}</label>)}</div>
      <label className="block text-sm">{ar?'تصفية المحتوى حسب الفئة':'Filter inventory by category'}<select className={field} value={category??''} onChange={e=>{setCategory(e.target.value?Number(e.target.value):undefined);setPage(1);}}><option value="">{ar?'كل الفئات':'All categories'}</option>{inventory.Categories.map(c=><option key={c.Id} value={c.Id}>{name(c)}</option>)}</select></label>
      <h3 className="font-semibold">{ar?'المهارات':'Skills'}</h3>
      <div className="max-h-64 overflow-y-auto space-y-1">{inventory.Skills.map(s=><label key={s.Id} className="flex items-center gap-2 rounded-lg border p-2 text-sm"><input type="checkbox" disabled={disabled} checked={mapping.SkillIds.includes(s.Id)} onChange={e=>toggle('SkillIds',s.Id,e.target.checked)}/><span>{name(s)} <span className="text-muted-foreground">{!s.IsPublished?(ar?'(غير منشورة)':'(unpublished)'):''}</span></span></label>)}</div>
      <h3 className="font-semibold">{ar?'المسائل':'Problems'} ({inventory.Total})</h3>
      <div className="max-h-96 overflow-y-auto space-y-1">{inventory.Problems.map(p=><label key={p.Id} className="flex items-center gap-2 rounded-lg border p-2 text-sm"><input type="checkbox" disabled={disabled||!p.PrimarySkillId} checked={mapping.ProblemIds.includes(p.Id)} onChange={e=>toggle('ProblemIds',p.Id,e.target.checked)}/><span>#{p.Id} · {(ar?p.TitleAr:p.TitleEn)|| (ar?'بلا عنوان':'Untitled')} <span className="text-xs text-muted-foreground">{p.PrimarySkillId?(ar?'مهارة':'Skill')+' #'+p.PrimarySkillId:(ar?'بلا مهارة أساسية':'No primary skill')} · {ar?'المسارات':'Tracks'}: {p.AssignedTrackCount}</span></span></label>)}</div>
      <div className="flex items-center gap-2"><button className={btn} disabled={page===1} onClick={()=>setPage(p=>p-1)}>{ar?'السابق':'Previous'}</button><span>{page}</span><button className={btn} disabled={page*100>=inventory.Total} onClick={()=>setPage(p=>p+1)}>{ar?'التالي':'Next'}</button></div>
    </>}
    <div className="flex flex-wrap gap-2"><button className={btn} disabled={disabled||!dirty} onClick={()=>void saveMapping()}>{saving?(ar?'جارٍ الحفظ…':'Saving…'):(ar?'حفظ الروابط':'Save mappings')}</button>
    <button className={btn} disabled={dirty||saving||publishing||readingProposal} onClick={()=>setConfirm(true)}>{t.IsPublished?(ar?'إلغاء النشر':'Unpublish'):(ar?'نشر المسار':'Publish track')}</button></div>
    {confirm&&<div className="rounded-xl border p-3 space-y-2"><p>{ar?(t.IsPublished?'إلغاء إظهار هذا المسار؟':'هل راجعت التصنيف والمحتوى؟ النشر لا يضيف مسائل جديدة.'):(t.IsPublished?'Hide this track?':'Have you reviewed the mapping and content? Publishing does not add new problems.')}</p><div className="flex gap-2"><button className={btn} disabled={publishing||dirty} onClick={()=>void publishTrack()}>{ar?'تأكيد':'Confirm'}</button><button className={btn} onClick={()=>setConfirm(false)}>{ar?'إلغاء':'Cancel'}</button></div></div>}
    {error&&<p role="alert" className="text-destructive text-sm">{error}</p>}
  </section>;
}
function TrackEditor({id,ar}:{id:number;ar:boolean}){const {data,isFetching,isError,refetch}=useGetAdminTrackQuery(id,{refetchOnMountOrArgChange:true});return <>{isFetching&&!data&&<p role="status">{ar?'جارٍ التحميل…':'Loading…'}</p>}{isError&&<button className={btn} onClick={()=>void refetch()}>{ar?'إعادة المحاولة':'Retry'}</button>}{data&&!isError&&<MappingEditor key={id+'-'+data.Track.Revision} detail={data} ar={ar}/>}</>}
export default function LearningTracksPage(){
  const ar=useLocale()==='ar';const admin=useSelector((s:RootState)=>s.auth.user?.Role==='Admin');
  const {data,isFetching,isError,refetch}=useGetAdminTracksQuery(undefined,{skip:!admin});
  const {data:stages}=useGetAdminStagesQuery(undefined,{skip:!admin});
  const [selected,setSelected]=useState<number|null>(null);
  const [stageId,setStage]=useState(0);const [kind,setKind]=useState<LearningTrack['Kind']>('course');
  const [code,setCode]=useState('');const [nameAr,setAr]=useState('');const [nameEn,setEn]=useState('');
  const [descAr,setDescAr]=useState('');const [descEn,setDescEn]=useState('');
  const [sort,setSort]=useState(1);const [error,setError]=useState('');
  const [create,{isLoading}]=useCreateTrackMutation();
  async function submit(e:React.FormEvent){e.preventDefault();setError('');try{const t=await create({StageId:stageId,Kind:kind,Code:code,NameAr:nameAr,NameEn:nameEn,DescriptionAr:descAr,DescriptionEn:descEn,SortOrder:sort}).unwrap();setSelected(t.Id);setCode('');setAr('');setEn('');setDescAr('');setDescEn('');}catch(e){setError(message(e,ar));}}
  if(!admin)return null;
  return <main className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6"><h1 className="text-2xl font-bold">{ar?'الصفوف والمساقات التعليمية':'Grades and university courses'}</h1>
    {data&&<p className="text-sm text-muted-foreground">{data.Enabled?(ar?'عرض المسارات المنشورة مفعّل.':'Published track catalog is enabled.'):(ar?'عرض المسارات للطلاب معطّل حتى اكتمال التهيئة.':'Learner track catalog is disabled until rollout is ready.')}</p>}
    <details className="rounded-2xl border bg-card p-4"><summary className="cursor-pointer font-semibold">{ar?'إضافة صف أو مساق':'Add grade or course'}</summary><form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={submit}>
      <label className="text-sm">{ar?'المرحلة':'Stage'}<select className={field} required value={stageId||''} onChange={e=>setStage(Number(e.target.value))}><option value="">{ar?'اختر':'Select'}</option>{stages?.map(s=><option key={s.Id} value={s.Id}>{ar?s.NameAr:s.NameEn}</option>)}</select></label>
      <label className="text-sm">{ar?'النوع':'Kind'}<select className={field} value={kind} onChange={e=>setKind(e.target.value as LearningTrack['Kind'])}><option value="grade">{ar?'صف':'Grade'}</option><option value="course">{ar?'مساق':'Course'}</option></select></label>
      <label className="text-sm">{ar?'الرمز الثابت':'Stable code'}<input className={field} required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} value={code} onChange={e=>setCode(e.target.value)}/></label>
      <label className="text-sm">{ar?'الترتيب':'Order'}<input className={field} type="number" min={0} max={10000} value={sort} onChange={e=>setSort(Number(e.target.value))}/></label>
      <label className="text-sm">{ar?'الاسم بالعربية':'Arabic name'}<input className={field} required maxLength={150} value={nameAr} onChange={e=>setAr(e.target.value)}/></label>
      <label className="text-sm">{ar?'الاسم بالإنجليزية':'English name'}<input className={field} required maxLength={150} value={nameEn} onChange={e=>setEn(e.target.value)}/></label>
      <label className="text-sm">{ar?'الوصف بالعربية':'Arabic description'}<textarea className={field} maxLength={1500} value={descAr} onChange={e=>setDescAr(e.target.value)}/></label>
      <label className="text-sm">{ar?'الوصف بالإنجليزية':'English description'}<textarea className={field} maxLength={1500} value={descEn} onChange={e=>setDescEn(e.target.value)}/></label>
      <button className={btn} disabled={isLoading||!stageId} type="submit">{ar?'إضافة مسودة':'Create draft'}</button>{error&&<p role="alert" className="text-destructive">{error}</p>}
    </form></details>
    <div className="flex justify-between"><h2 className="font-bold">{ar?'المسارات الموجودة':'Existing tracks'}</h2><button className={btn} disabled={isFetching} onClick={()=>void refetch()}>{ar?'تحديث':'Refresh'}</button></div>
    {isError&&<p role="alert">{ar?'تعذّر تحميل المسارات.':'Could not load tracks.'}</p>}
    {isFetching&&!data&&<p role="status">{ar?'جارٍ التحميل…':'Loading…'}</p>}
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{data?.Items.map(x=><button type="button" key={x.Track.Id} onClick={()=>setSelected(x.Track.Id)} aria-pressed={selected===x.Track.Id} className={'rounded-xl border p-3 text-start '+(selected===x.Track.Id?'border-primary bg-primary/10':'bg-card')}><p className="font-bold">{ar?x.Track.NameAr:x.Track.NameEn}</p><p className="text-xs text-muted-foreground">{x.Track.IsPublished?(ar?'منشور':'Published'):(ar?'مسودة':'Draft')} · {x.ProblemCount} {ar?'مسألة مرتبطة':'mapped problems'}</p></button>)}</div>
    {selected!==null&&<TrackEditor key={selected} id={selected} ar={ar}/>}
  </main>;
}
