'use client';
import {Suspense,useState} from 'react';
import {DataBadge} from '@/components/admin/AdminDataBadges';
import {useSearchParams} from 'next/navigation';
import {Link} from '@/i18n/routing';
import {Breadcrumbs} from '@/components/ui/Breadcrumbs';
import {DirectionalChevron} from '@/components/ui/DirectionalNavigation';
import {GraduationCap, Pencil, Shapes} from 'lucide-react';
import {Tooltip,TooltipTrigger,TooltipContent} from '@/components/ui/Tooltip';
import {WorkspacePageHeader} from '@/components/ui/WorkspacePageHeader';
import {getStageAccent} from '@/lib/stageVisuals';
import {useLocale} from 'next-intl';
import {useSelector} from 'react-redux';
import type {RootState} from '@/store';
import { MathWorldLoading, MathWorldSkeleton } from '@/components/ui/MathWorldLoading';
import {useGetAdminTracksQuery,useGetAdminTrackQuery,useGetAdminStagesQuery,
  useUpdateTrackMetadataMutation,type TrackDetail,type LearningTrack} from '@/store/api/stagesApi';

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
 return <section className="space-y-4 rounded-2xl border bg-card p-4">
   <MetadataEditor track={t} ar={ar} disabled={false}/>
   <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
     {[[ar?'الفئات':'Categories',detail.Coverage.Categories],[ar?'المهارات':'Skills',detail.Coverage.Skills],[ar?'المسائل':'Problems',detail.Coverage.Problems],[ar?'مسائل Free':'Free problems',detail.Coverage.FreeProblems]].map(([label,count])=><div key={label} className="rounded-xl border p-3"><p className="text-sm text-muted-foreground">{label}</p><strong className="text-xl">{count}</strong></div>)}
   </div>
   <Link href={'/admin/categories?stageId='+t.StageId+'&trackId='+t.Id} className={btn+' inline-flex items-center gap-2'}>{ar?'إدارة الفئات':'Manage categories'}<DirectionalChevron direction="forward" className="h-4 w-4"/></Link>
   <p className="text-sm text-muted-foreground">{ar?'تُدار الفئات ومحتواها من صفحة الفئات. لا حاجة لاختيار المهارات والمسائل هنا.':'Manage categories and their content from the categories page. No separate skill or problem selection is needed here.'}</p>
 </section>;
}
function TrackEditor({id,ar}:{id:number;ar:boolean}){
 const {data,isFetching,isError,refetch}=useGetAdminTrackQuery(id,{refetchOnMountOrArgChange:60});
 if(isFetching&&!data)return <MathWorldSkeleton/>;
 if(isError||!data)return <button className={btn} onClick={()=>void refetch()}>{ar?'إعادة المحاولة':'Retry'}</button>;
 return <section className="space-y-4 rounded-2xl border bg-card p-4">
 <h2 className="text-lg font-bold">{ar?data.Track.NameAr:data.Track.NameEn}</h2>
 <MappingEditor key={id+'-'+data.Track.Revision} detail={data} ar={ar}/>
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
  const visibleTracks=data?.Items.filter(x=>x.Track.StageId===stageFilter&&(stageFilter!==4||['university-level-1','university-level-2'].includes(x.Track.Code)))??[];
  const scopedTrack=selected!==null&&visibleTracks.some(x=>x.Track.Id===selected)?selected:null;
  const stage=stages?.find(s=>s.Id===stageFilter);
  const stageName=stage?(ar?stage.NameAr:stage.NameEn):'';
  const trail=[{label:ar?'لوحة الإدارة':'Administration',href:'/admin'},{label:ar?'المراحل التعليمية':'Educational stages',href:'/admin/stages'},{label:stageName}];
  if(scopedTrack!==null)return <main className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6"><Breadcrumbs items={[...trail.slice(0,2),{label:stageName,href:'/admin/learning-tracks?stageId='+stageFilter},{label:ar?'الفئات':'Categories',href:'/admin/categories?stageId='+stageFilter+'&trackId='+scopedTrack},{label:stageFilter===4?(ar?'تعديل المستوى':'Edit level'):(ar?'تعديل الصف':'Edit grade')}]}/><WorkspacePageHeader title={stageFilter===4?(ar?'تعديل المستوى':'Edit level'):(ar?'تعديل الصف':'Edit grade')} icon={GraduationCap}/><TrackEditor key={scopedTrack} id={scopedTrack} ar={ar}/></main>;
  return <main className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6">
    <Breadcrumbs items={trail}/>
    <WorkspacePageHeader title={stageName} icon={GraduationCap}/>
    {data&&!data.Enabled&&<p role="status" className="text-sm text-muted-foreground">{ar?'عرض المسارات للطلاب معطّل.':'Learner track catalog is disabled.'}</p>}
    <div className="overflow-x-auto rounded-xl border"><table className="mw-workspace-table min-w-[680px] text-sm"><thead><tr>{['ID',ar?'الاسم بالعربية':'Arabic name',ar?'الاسم بالإنجليزية':'English name',ar?'الترتيب':'Order',ar?'المسائل':'Problems',ar?'الحالة':'Status',ar?'الإجراءات':'Actions'].map(label=><th key={label} className="p-3 text-start">{label}</th>)}</tr></thead><tbody>{visibleTracks.map(x=><tr key={x.Track.Id} className="border-b mw-topic-row" style={{'--stage-accent':getStageAccent({Id:x.Track.StageId})} as import('react').CSSProperties}><td className="p-3">{x.Track.Id}</td><td className="p-3 font-bold mw-topic-ink">{x.Track.NameAr}</td><td className="p-3">{x.Track.NameEn}</td><td className="p-3">{x.Track.SortOrder}</td><td className="p-3">{x.ProblemCount}</td><td className="p-3"><DataBadge tone={x.Track.IsPublished?'green':'neutral'}>{x.Track.IsPublished?(ar?'منشور':'Published'):(ar?'مسودة':'Draft')}</DataBadge></td><td className="p-3"><div className="flex items-center gap-2"><Tooltip><TooltipTrigger asChild><Link className="mw-admin-action mw-action-view p-2" href={'/admin/categories?stageId='+stageFilter+'&trackId='+x.Track.Id} aria-label={ar?'عرض الفئات':'View categories'}><Shapes className="h-4 w-4" aria-hidden="true"/></Link></TooltipTrigger><TooltipContent>{ar?'عرض الفئات':'View categories'}</TooltipContent></Tooltip><Tooltip><TooltipTrigger asChild><Link className="mw-admin-action p-2" href={'/admin/learning-tracks?stageId='+stageFilter+'&trackId='+x.Track.Id+'&edit=1'} aria-label={ar?'تعديل':'Edit'}><Pencil className="h-4 w-4" aria-hidden="true"/></Link></TooltipTrigger><TooltipContent>{ar?'تعديل':'Edit'}</TooltipContent></Tooltip></div></td></tr>)}</tbody></table></div>

  </main>;
}

export default function LearningTracksPage(){return <Suspense fallback={<MathWorldLoading compact/>}><LearningTracksContent/></Suspense>;}
