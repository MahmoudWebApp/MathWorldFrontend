'use client';
import {useState} from 'react';
import {GraduationCap} from 'lucide-react';
import {WorkspacePageHeader} from '@/components/ui/WorkspacePageHeader';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/Tabs';
import {getStageAccent} from '@/lib/stageVisuals';
import {useLocale} from 'next-intl';
import {useSelector} from 'react-redux';
import type {RootState} from '@/store';
import {MathWorldLoading} from '@/components/ui/MathWorldLoading';
import {Link} from '@/i18n/routing';
import {useGetAdminCategoriesQuery} from '@/store/api/categoriesApi';
import {StageTopicArtwork} from '@/components/stages/StageTopicArtwork';
import {useGetAdminTracksQuery,useGetAdminTrackQuery,useGetTrackInventoryQuery,useGetAdminStagesQuery,
  useCreateTrackMutation,useMapTrackMutation,usePublishTrackMutation,useUpdateTrackMetadataMutation,type TrackDetail,type TrackMapping,type LearningTrack} from '@/store/api/stagesApi';

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
  const {data:inventory,isFetching,isError}=useGetTrackInventoryQuery({stageId:t.StageId,page,categoryId:category});
  const [save,{isLoading:saving}]=useMapTrackMutation();
  const [publish,{isLoading:publishing}]=usePublishTrackMutation();
  const disabled=t.IsPublished||saving||publishing;
  const toggle=(key:keyof TrackMapping,id:number,checked:boolean)=>setMapping(m=>({...m,[key]:checked?[...new Set([...m[key],id])]:m[key].filter(x=>x!==id)}));
  const equal=(a:number[],b:number[])=>a.length===b.length&&a.every(x=>b.includes(x));
  const dirty=!equal(mapping.CategoryIds,detail.CategoryIds)||!equal(mapping.SkillIds,detail.SkillIds)||!equal(mapping.ProblemIds,detail.ProblemIds);
  async function saveMapping(){setError('');try{await save({id:t.Id,Revision:t.Revision,...mapping}).unwrap();}catch(e){setError(message(e,ar));}}
  async function publishTrack(){setError('');try{await publish({id:t.Id,Revision:t.Revision,Publish:!t.IsPublished,ConfirmPremiumOnlyCourse:premiumOnly&&confirmPremiumOnly}).unwrap();setConfirm(false);}catch(e){setError(message(e,ar));}}
  const name=(x:{NameAr:string;NameEn:string})=>ar?x.NameAr:x.NameEn;
  return <section className="space-y-4 rounded-2xl border bg-card p-4">
    <div className="flex flex-wrap justify-between gap-2"><h2 className="text-lg font-bold">{name(t)}</h2><span className="text-sm">{t.IsPublished?(ar?'منشور':'Published'):(ar?'مسودة':'Draft')}</span></div>
    <MetadataEditor track={t} ar={ar} disabled={dirty||saving||publishing}/>
    <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
      {[[ar?'فئات صالحة':'Valid categories',detail.Coverage.Categories],[ar?'مهارات أساسية':'Primary skills',detail.Coverage.Skills],[ar?'مسائل جاهزة':'Ready problems',detail.Coverage.Problems],[ar?'مسائل Free':'Free problems',detail.Coverage.FreeProblems]].map(([label,count])=><div key={label} className="rounded-xl border p-3"><p className="text-muted-foreground">{label}</p><p className="text-xl font-bold">{count}</p></div>)}
    </div>
    <p className="text-sm text-muted-foreground">{ar?'اختر التصنيف بعد مراجعة المحتوى. لا يتم نسخ المسألة أو تخمين الصف تلقائياً. يجب إلغاء نشر المسار قبل تعديل روابطه.':'Review content before assigning it. Problems are not copied or automatically classified. Unpublish a track before editing its mappings.'}</p>

    <div className="flex flex-wrap gap-2 text-sm"><span>{ar?'الفئات المختارة':'Selected categories'}: {mapping.CategoryIds.length}</span><span>{ar?'المهارات':'Skills'}: {mapping.SkillIds.length}</span><span>{ar?'المسائل':'Problems'}: {mapping.ProblemIds.length}</span></div>
    {isFetching&&!inventory&&<MathWorldLoading/>}
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
    <button className={btn} disabled={dirty||saving||publishing} onClick={()=>{setConfirmPremiumOnly(false);setConfirm(true);}}>{t.IsPublished?(ar?'إلغاء النشر':'Unpublish'):(ar?'نشر المسار':'Publish track')}</button></div>
    {confirm&&<div className="rounded-xl border p-3 space-y-2"><p>{ar?(t.IsPublished?'إلغاء إظهار هذا المسار؟':'هل راجعت التصنيف والمحتوى؟ النشر لا يضيف مسائل جديدة.'):(t.IsPublished?'Hide this track?':'Have you reviewed the mapping and content? Publishing does not add new problems.')}</p>{premiumOnly&&<label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={confirmPremiumOnly} onChange={e=>setConfirmPremiumOnly(e.target.checked)}/><span>{ar?'أوافق على إظهار المساق للجميع، مع إتاحة حل مسائله لمشتركي Premium فقط. لن تتغير الفئتان المجانيتان.':'I confirm the course is visible to everyone, but practice is available only to Premium subscribers. The two Free categories remain unchanged.'}</span></label>}<div className="flex gap-2"><button className={btn} disabled={publishing||dirty||(premiumOnly&&!confirmPremiumOnly)} onClick={()=>void publishTrack()}>{ar?'تأكيد':'Confirm'}</button><button className={btn} onClick={()=>setConfirm(false)}>{ar?'إلغاء':'Cancel'}</button></div></div>}
    {error&&<p role="alert" className="text-destructive text-sm">{error}</p>}
  </section>;
}
function TrackEditor({id,ar}:{id:number;ar:boolean}){
 const {data,isFetching,isError,refetch}=useGetAdminTrackQuery(id,{refetchOnMountOrArgChange:60});
 const categories=useGetAdminCategoriesQuery();
 const [settings,setSettings]=useState(false);
 if((isFetching&&!data)||categories.isLoading)return <MathWorldLoading/>;
 if(isError||categories.isError||!data)return <button className={btn} onClick={()=>{void refetch();void categories.refetch();}}>{ar?'إعادة المحاولة':'Retry'}</button>;
 const accent=getStageAccent({Id:data.Track.StageId});
 const items=(categories.data??[]).filter(c=>data.CategoryIds.includes(c.Id)).sort((a,b)=>(a.Order??0)-(b.Order??0)||a.Id-b.Id);
 return <section className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-bold" style={{color:accent}}>{ar?data.Track.NameAr:data.Track.NameEn}</h2><button className={btn} onClick={()=>setSettings(v=>!v)}>{ar?'إعدادات الصف':'Grade settings'}</button></div>
 {settings?<MappingEditor key={id+'-'+data.Track.Revision} detail={data} ar={ar}/>:<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map(c=><Link key={c.Id} href={`/admin/editorial?stageId=${data.Track.StageId}&trackId=${id}&categoryId=${c.Id}`} style={{'--stage-accent':accent} as import('react').CSSProperties} className="mw-topic-surface rounded-xl border p-4 flex items-center gap-3">{c.Icon&&/^(https?:|\/)/.test(c.Icon)&&<StageTopicArtwork src={c.Icon} size={40} accent={accent}/>}<span className="font-bold mw-topic-ink">{ar?c.NameAr:c.NameEn}</span></Link>)}{!items.length&&<p className="text-muted-foreground">{ar?'لا توجد فئات مرتبطة بهذا الصف':'No categories assigned to this grade'}</p>}</div>}
 </section>;
}
export default function LearningTracksPage(){
  const ar=useLocale()==='ar';const admin=useSelector((s:RootState)=>s.auth.user?.Role==='Admin');
  const {data,isFetching,isError}=useGetAdminTracksQuery(undefined,{skip:!admin});
  const {data:stages}=useGetAdminStagesQuery(undefined,{skip:!admin});
  const [selected,setSelected]=useState<number|null>(null);
  const [tab,setTab]=useState('list');
  const [stageId,setStage]=useState(0);const [kind,setKind]=useState<LearningTrack['Kind']>('course');
  const [code,setCode]=useState('');const [nameAr,setAr]=useState('');const [nameEn,setEn]=useState('');
  const [descAr,setDescAr]=useState('');const [descEn,setDescEn]=useState('');
  const [sort,setSort]=useState(1);const [error,setError]=useState('');
  const [create,{isLoading}]=useCreateTrackMutation();
  async function submit(e:React.FormEvent){e.preventDefault();setError('');try{const t=await create({StageId:stageId,Kind:kind,Code:code,NameAr:nameAr,NameEn:nameEn,DescriptionAr:descAr,DescriptionEn:descEn,SortOrder:sort}).unwrap();setSelected(t.Id);setTab('list');setCode('');setAr('');setEn('');setDescAr('');setDescEn('');}catch(e){setError(message(e,ar));}}
  if(!admin)return null;
  return <main className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6">
    <WorkspacePageHeader title={ar?'المحتوى التعليمي':'Learning content'} icon={GraduationCap} actions={<div className="flex gap-2"><Link className={btn} href="/admin/editorial?tab=requests">{ar?"مسائل بحاجة مراجعة":"Review requests"}</Link><Link className={btn} href="/admin/stages">{ar?"المراحل":"Stages"}</Link></div>}/>
    {data&&!data.Enabled&&<p role="status" className="text-sm text-muted-foreground">{ar?'عرض المسارات للطلاب معطّل.':'Learner track catalog is disabled.'}</p>}
    <Tabs value={tab} onValueChange={setTab} dir={ar?'rtl':'ltr'}>
      <TabsList className="w-fit max-w-full"><TabsTrigger value="list">{ar?'الصفوف والمساقات':'Grades and courses'}</TabsTrigger><TabsTrigger value="create" disabled={selected!==null}>{ar?'إضافة صف أو مساق':'Add grade or course'}</TabsTrigger></TabsList>
      <TabsContent value="list" className="space-y-4">    
    {isError&&<p role="alert">{ar?'تعذّر تحميل المسارات.':'Could not load tracks.'}</p>}
    {isFetching&&!data&&<MathWorldLoading/>}
    {selected===null&&<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{data?.Items.map(x=><button type="button" key={x.Track.Id} onClick={()=>setSelected(x.Track.Id)} aria-pressed={selected===x.Track.Id} style={{'--stage-accent':getStageAccent({Id:x.Track.StageId})} as import('react').CSSProperties} className={'rounded-xl border mw-topic-surface p-3 text-start '+(selected===x.Track.Id?'ring-1 ring-[var(--stage-accent)]':'')}><p className="font-bold mw-topic-ink">{ar?x.Track.NameAr:x.Track.NameEn}</p><p className="text-xs text-muted-foreground">{x.Track.IsPublished?(ar?'منشور':'Published'):(ar?'مسودة':'Draft')} · {x.ProblemCount} {ar?'مسألة مرتبطة':'mapped problems'}</p></button>)}</div>}
    {selected!==null&&<><Link className={btn+" inline-flex"} href={`/admin/editorial?stageId=${data?.Items.find(x=>x.Track.Id===selected)?.Track.StageId??0}&trackId=${selected}`}>{ar?"عرض مسائل الصف":"View grade problems"}</Link><button type="button" className={btn} onClick={()=>setSelected(null)}>{ar?'العودة للصفوف':'Back to grades'}</button><TrackEditor key={selected} id={selected} ar={ar}/></>}
</TabsContent>
      <TabsContent value="create">    <section className="rounded-2xl border bg-card p-4"><form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={submit}>
      <label className="text-sm">{ar?'المرحلة':'Stage'}<select className={field} required value={stageId||''} onChange={e=>setStage(Number(e.target.value))}><option value="">{ar?'اختر':'Select'}</option>{stages?.map(s=><option key={s.Id} value={s.Id}>{ar?s.NameAr:s.NameEn}</option>)}</select></label>
      <label className="text-sm">{ar?'النوع':'Kind'}<select className={field} value={kind} onChange={e=>setKind(e.target.value as LearningTrack['Kind'])}><option value="grade">{ar?'صف':'Grade'}</option><option value="course">{ar?'مساق':'Course'}</option></select></label>
      <label className="text-sm">{ar?'الرمز الثابت':'Stable code'}<input className={field} required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} value={code} onChange={e=>setCode(e.target.value)}/></label>
      <label className="text-sm">{ar?'الترتيب':'Order'}<input className={field} type="number" min={0} max={10000} value={sort} onChange={e=>setSort(Number(e.target.value))}/></label>
      <label className="text-sm">{ar?'الاسم بالعربية':'Arabic name'}<input className={field} required maxLength={150} value={nameAr} onChange={e=>setAr(e.target.value)}/></label>
      <label className="text-sm">{ar?'الاسم بالإنجليزية':'English name'}<input className={field} required maxLength={150} value={nameEn} onChange={e=>setEn(e.target.value)}/></label>
      <label className="text-sm">{ar?'الوصف بالعربية':'Arabic description'}<textarea className={field} maxLength={1500} value={descAr} onChange={e=>setDescAr(e.target.value)}/></label>
      <label className="text-sm">{ar?'الوصف بالإنجليزية':'English description'}<textarea className={field} maxLength={1500} value={descEn} onChange={e=>setDescEn(e.target.value)}/></label>
      <button className={btn} disabled={isLoading||!stageId} type="submit">{ar?'إضافة مسودة':'Create draft'}</button>{error&&<p role="alert" className="text-destructive">{error}</p>}
    </form></section>
</TabsContent>
      
    </Tabs>
  </main>;
}
