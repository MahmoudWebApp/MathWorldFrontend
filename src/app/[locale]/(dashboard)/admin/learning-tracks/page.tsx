'use client';
import {Suspense,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {Link} from '@/i18n/routing';
import {Breadcrumbs} from '@/components/ui/Breadcrumbs';
import {DirectionalChevron,DirectionalArrow} from '@/components/ui/DirectionalNavigation';
import {useGetAdminCategoriesQuery} from '@/store/api/categoriesApi';
import {GraduationCap} from 'lucide-react';
import {WorkspacePageHeader} from '@/components/ui/WorkspacePageHeader';
import {getStageAccent} from '@/lib/stageVisuals';
import {useLocale} from 'next-intl';
import {useSelector} from 'react-redux';
import type {RootState} from '@/store';
import {readTrackProposal,MAX_TRACK_PROPOSAL_BYTES} from '@/components/curriculum/trackProposalImport';
import { MathWorldLoading, MathWorldSkeleton } from '@/components/ui/MathWorldLoading';
import {useGetAdminTracksQuery,useGetAdminTrackQuery,useGetTrackInventoryQuery,useGetAdminStagesQuery,
  useMapTrackMutation,usePublishTrackMutation,useUpdateTrackMetadataMutation,type TrackDetail,type TrackMapping,type LearningTrack} from '@/store/api/stagesApi';

const btn='rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50';
const field='w-full rounded-xl border bg-background p-2.5 text-sm';
function message(e:unknown,ar:boolean){
  const code=(e as {data?:{Message?:string}})?.data?.Message;
  const errors:Record<string,[string,string]>={TrackNotReady:['المسار غير جاهز: تحقق من المسائل والمهارات المنشورة وتغطية Free.','Track is not ready: check published skills, problems and Free coverage.'],PremiumOnlyCourseConfirmationRequired:['يجب تأكيد نشر هذا المساق للمشتركين فقط.','Confirm publication of this Premium-only course.'],ProblemPrimarySkillMismatch:['مسألة بلا مهارة أساسية مطابقة للتصنيف.','A problem lacks a matching primary skill.'],SkillCategoryMismatch:['مهارة لا تنتمي إلى الفئة المحددة.','Skill/category mismatch.'],CategoryStageMismatch:['فئة من مرحلة مختلفة.','Category/stage mismatch.'],TrackChanged:['تغير المسار، حدّث البيانات.','Track changed; refresh.'],UnpublishOrRefreshTrack:['ألغِ النشر أو حدّث البيانات أولاً.','Unpublish or refresh first.']};
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
  const [confirmPremiumOnly,setConfirmPremiumOnly]=useState(false);
  const premiumOnly=!t.IsPublished&&t.StageId===4&&t.Kind==='course'&&detail.Coverage.Problems>0&&detail.Coverage.FreeProblems===0;
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
  async function publishTrack(){setError('');try{await publish({id:t.Id,Revision:t.Revision,Publish:!t.IsPublished,ConfirmPremiumOnlyCourse:premiumOnly&&confirmPremiumOnly}).unwrap();setConfirm(false);}catch(e){setError(message(e,ar));}}
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
    {isFetching&&!inventory&&<MathWorldLoading compact mode="filter"/>}
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
    <button className={btn} disabled={dirty||saving||publishing||readingProposal} onClick={()=>{setConfirmPremiumOnly(false);setConfirm(true);}}>{t.IsPublished?(ar?'إلغاء النشر':'Unpublish'):(ar?'نشر المسار':'Publish track')}</button></div>
    {confirm&&<div className="rounded-xl border p-3 space-y-2"><p>{ar?(t.IsPublished?'إلغاء إظهار هذا المسار؟':'هل راجعت التصنيف والمحتوى؟ النشر لا يضيف مسائل جديدة.'):(t.IsPublished?'Hide this track?':'Have you reviewed the mapping and content? Publishing does not add new problems.')}</p>{premiumOnly&&<label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={confirmPremiumOnly} onChange={e=>setConfirmPremiumOnly(e.target.checked)}/><span>{ar?'أوافق على إظهار المساق للجميع، مع إتاحة حل مسائله لمشتركي Premium فقط. لن تتغير الفئتان المجانيتان.':'I confirm the course is visible to everyone, but practice is available only to Premium subscribers. The two Free categories remain unchanged.'}</span></label>}<div className="flex gap-2"><button className={btn} disabled={publishing||dirty||(premiumOnly&&!confirmPremiumOnly)} onClick={()=>void publishTrack()}>{ar?'تأكيد':'Confirm'}</button><button className={btn} onClick={()=>setConfirm(false)}>{ar?'إلغاء':'Cancel'}</button></div></div>}
    {error&&<p role="alert" className="text-destructive text-sm">{error}</p>}
  </section>;
}
function TrackEditor({id,ar}:{id:number;ar:boolean}){
 const {data,isFetching,isError,refetch}=useGetAdminTrackQuery(id,{refetchOnMountOrArgChange:60});
 const categories=useGetAdminCategoriesQuery();
 const [editing,setEditing]=useState(true);
 if(isFetching&&!data||categories.isLoading)return <MathWorldSkeleton/>;
 if(isError||categories.isError||!data)return <button className={btn} onClick={()=>{void refetch();void categories.refetch();}}>{ar?'إعادة المحاولة':'Retry'}</button>;
 const accent=getStageAccent({Id:data.Track.StageId});
 return <section className="space-y-4 rounded-2xl border bg-card p-4">
 <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">{ar?data.Track.NameAr:data.Track.NameEn}</h2><button className={btn} onClick={()=>setEditing(v=>!v)}>{editing?(ar?'عرض الفئات':'View categories'):(ar?'تعديل المستوى':'Edit level')}</button></div>
 {editing?<MappingEditor key={id+'-'+data.Track.Revision} detail={data} ar={ar}/>:<div className="overflow-x-auto rounded-xl border"><table className="mw-workspace-table min-w-[540px] text-sm"><thead><tr>{['ID',ar?'الاسم بالعربية':'Arabic name',ar?'الاسم بالإنجليزية':'English name',ar?'الإجراءات':'Actions'].map(label=><th key={label} className="p-3 text-start">{label}</th>)}</tr></thead><tbody>{(categories.data??[]).filter(c=>data.CategoryIds.includes(c.Id)).map(c=><tr key={c.Id} className="border-b mw-topic-row" style={{'--stage-accent':accent} as import('react').CSSProperties}><td className="p-3">{c.Id}</td><td className="p-3 font-bold mw-topic-ink">{c.NameAr}</td><td className="p-3">{c.NameEn}</td><td className="p-3"><Link href={'/admin/editorial?stageId='+data.Track.StageId+'&trackId='+id+'&categoryId='+c.Id} className={btn+' mw-topic-ink'}>{ar?'عرض المسائل':'View problems'}</Link></td></tr>)}{!data.CategoryIds.length&&<tr><td colSpan={4} className="p-6 text-center text-muted-foreground">{ar?'لا توجد فئات مرتبطة بعد':'No linked categories yet'}</td></tr>}</tbody></table></div>}
 </section>;
}
function LearningTracksContent(){
  const params=useSearchParams();
  const requestedStage=Number(params.get('stageId'));
  const requestedTrack=Number(params.get('trackId'));
  const ar=useLocale()==='ar';const admin=useSelector((s:RootState)=>s.auth.user?.Role==='Admin');
  const {data,isFetching,isError,refetch}=useGetAdminTracksQuery(undefined,{skip:!admin});
  const {data:stages,isLoading:stagesLoading,isError:stagesError,refetch:reloadStages}=useGetAdminStagesQuery(undefined,{skip:!admin});
  const selected=Number.isSafeInteger(requestedTrack)&&requestedTrack>0?requestedTrack:null;
  const stageFilter=stages?.some(s=>s.Id===requestedStage)?requestedStage:0;
  if(!admin)return null;
  if((isFetching&&!data)||stagesLoading)return <MathWorldSkeleton/>;
  if(isError||stagesError)return <div role="alert" className="p-6">{ar?'تعذّر تحميل المحتوى التعليمي.':'Could not load learning content.'} <button className={btn} onClick={()=>{void refetch();void reloadStages();}}>{ar?'إعادة المحاولة':'Retry'}</button></div>;
  if(!stageFilter)return <main className="p-6"><Link href="/admin/stages" className={btn}>{ar?'اختر المرحلة أولاً':'Choose a stage first'}</Link></main>;
  const scopedTrack=selected!==null&&data?.Items.some(x=>x.Track.Id===selected&&x.Track.StageId===stageFilter)?selected:null;
  const stage=stages?.find(s=>s.Id===stageFilter);
  const stageName=stage?(ar?stage.NameAr:stage.NameEn):'';
  const trail=[{label:ar?'لوحة الإدارة':'Administration',href:'/admin'},{label:ar?'المراحل التعليمية':'Educational stages',href:'/admin/stages'},{label:stageName}];
  if(scopedTrack!==null)return <main className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6"><Breadcrumbs items={[...trail.slice(0,2),{label:stageName,href:'/admin/learning-tracks?stageId='+stageFilter},{label:ar?'إدارة الارتباطات':'Manage mappings'}]}/><WorkspacePageHeader title={ar?'إدارة الارتباطات':'Manage mappings'} icon={GraduationCap} actions={<Link className={btn+' inline-flex items-center gap-2'} href={'/admin/categories?stageId='+stageFilter+'&trackId='+scopedTrack}><DirectionalArrow direction="back" className="h-4 w-4"/>{ar?'العودة للفئات':'Back to categories'}</Link>}/><TrackEditor key={scopedTrack} id={scopedTrack} ar={ar}/></main>;
  return <main className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6">
    <Breadcrumbs items={trail}/>
    <WorkspacePageHeader title={stageName} icon={GraduationCap} actions={<Link className={btn+' inline-flex items-center gap-2'} href="/admin/stages"><DirectionalArrow direction="back" className="h-4 w-4"/>{ar?'العودة للمراحل':'Back to stages'}</Link>}/>
    {data&&!data.Enabled&&<p role="status" className="text-sm text-muted-foreground">{ar?'عرض المسارات للطلاب معطّل.':'Learner track catalog is disabled.'}</p>}
    <div className="overflow-x-auto rounded-xl border"><table className="mw-workspace-table min-w-[680px] text-sm"><thead><tr>{['ID',ar?'الاسم بالعربية':'Arabic name',ar?'الاسم بالإنجليزية':'English name',ar?'الترتيب':'Order',ar?'المسائل':'Problems',ar?'الحالة':'Status',ar?'الإجراءات':'Actions'].map(label=><th key={label} className="p-3 text-start">{label}</th>)}</tr></thead><tbody>{data?.Items.filter(x=>x.Track.StageId===stageFilter).map(x=><tr key={x.Track.Id} className="border-b mw-topic-row" style={{'--stage-accent':getStageAccent({Id:x.Track.StageId})} as import('react').CSSProperties}><td className="p-3">{x.Track.Id}</td><td className="p-3 font-bold mw-topic-ink">{x.Track.NameAr}</td><td className="p-3">{x.Track.NameEn}</td><td className="p-3">{x.Track.SortOrder}</td><td className="p-3">{x.ProblemCount}</td><td className="p-3">{x.Track.IsPublished?(ar?'منشور':'Published'):(ar?'مسودة':'Draft')}</td><td className="p-3"><Link className={btn+' mw-topic-action inline-flex items-center gap-2'} href={'/admin/categories?stageId='+stageFilter+'&trackId='+x.Track.Id}>{ar?'عرض الفئات':'View categories'}<DirectionalChevron direction="forward" className="h-4 w-4"/></Link><Link className={btn+' ms-2 inline-flex'} href={'/admin/learning-tracks?stageId='+stageFilter+'&trackId='+x.Track.Id+'&edit=1'}>{ar?'تعديل':'Edit'}</Link></td></tr>)}</tbody></table></div>

  </main>;
}

export default function LearningTracksPage(){return <Suspense fallback={<MathWorldLoading compact/>}><LearningTracksContent/></Suspense>;}
