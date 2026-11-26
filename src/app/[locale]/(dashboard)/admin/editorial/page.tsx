'use client';
import {Suspense} from 'react';
import {useSearchParams} from 'next/navigation';
import {useLocale} from 'next-intl';
import {Link} from '@/i18n/routing';
import {useSelector} from 'react-redux';
import type {RootState} from '@/store';
import {EditorialWorkspace} from '@/components/editorial/EditorialWorkspace';
import {MathWorldLoading} from '@/components/ui/MathWorldLoading';
import {useGetAdminTrackQuery} from '@/store/api/stagesApi';
import {useGetAdminCategoriesQuery} from '@/store/api/categoriesApi';
const positive=(v:number)=>Number.isSafeInteger(v)&&v>0;
function Content(){
 const admin=useSelector((s:RootState)=>s.auth.user?.Role==='Admin');
 const ar=useLocale()==='ar';
 const params=useSearchParams();
 const stage=Number(params.get('stageId')),track=Number(params.get('trackId')),category=Number(params.get('categoryId'));
 const scoped=positive(stage)&&positive(track)&&positive(category);
 const detail=useGetAdminTrackQuery(track,{skip:!admin||!scoped});
 const categories=useGetAdminCategoriesQuery(undefined,{skip:!admin||!scoped});
 if(!admin)return null;
 if(scoped&&(detail.isLoading||categories.isLoading))return <MathWorldLoading compact/>;
 if(scoped&&(detail.isError||categories.isError))return <div role="alert" className="p-4"><button type="button" onClick={()=>{void detail.refetch();void categories.refetch();}}>{ar?'إعادة المحاولة':'Retry'}</button></div>;
 const back=positive(stage)?'/admin/learning-tracks?stageId='+stage+(positive(track)?'&trackId='+track:''):'/admin/stages';
 const topic=categories.data?.find(x=>x.Id===category&&x.StageId===stage);
 if(!scoped||detail.currentData?.Track.StageId!==stage||!detail.currentData?.CategoryIds.includes(category)||!topic)return <main className="space-y-3 p-6"><p>{ar?'اختر المرحلة ثم الصف أو المستوى ثم الفئة لعرض المسائل.':'Choose a stage, then a grade or level, then a category to view problems.'}</p><Link href={back} className="font-semibold text-primary underline">{ar?'العودة للمحتوى التعليمي':'Return to learning content'}</Link></main>;
 return <main className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6"><Link href={back} className="font-semibold text-primary underline">{ar?'العودة لفئات الصف أو المستوى':'Back to grade or level categories'}</Link><p className="font-semibold">{ar?detail.currentData.Track.NameAr:detail.currentData.Track.NameEn} · {ar?topic.NameAr:topic.NameEn}</p><EditorialWorkspace key={params.toString()} admin canSubmit initialStage={stage} initialCategory={category} initialTrack={track} create={params.get('create')==='1'}/></main>;
}
export default function AdminEditorialPage(){return <Suspense fallback={<MathWorldLoading compact/>}><Content/></Suspense>;}
