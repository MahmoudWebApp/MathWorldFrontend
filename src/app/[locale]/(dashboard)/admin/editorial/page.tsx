'use client';
import {Suspense} from 'react';
import {useSearchParams} from 'next/navigation';
import {useSelector} from 'react-redux';
import type {RootState} from '@/store';
import {EditorialWorkspace} from '@/components/editorial/EditorialWorkspace';
import {MathWorldLoading} from '@/components/ui/MathWorldLoading';
import {useGetAdminStagesQuery} from '@/store/api/stagesApi';
import {useGetAdminCategoriesQuery} from '@/store/api/categoriesApi';
function Content(){
 const admin=useSelector((s:RootState)=>s.auth.user?.Role==='Admin');
 const params=useSearchParams();
 const stageRaw=Number(params.get('stageId'));const categoryRaw=Number(params.get('categoryId'));
 const scoped=Number.isSafeInteger(stageRaw)&&stageRaw>0;
 const stages=useGetAdminStagesQuery(undefined,{skip:!admin||!scoped});
 const categories=useGetAdminCategoriesQuery(undefined,{skip:!admin||!scoped});
 if(!admin)return null;
 if(scoped&&(stages.isLoading||categories.isLoading))return <MathWorldLoading compact/>;
 if(scoped&&(stages.isError||categories.isError))return <div role="alert" className="p-4"><button type="button" onClick={()=>{void stages.refetch();void categories.refetch();}}>↻</button></div>;
 const stage=scoped&&stages.data?.some(x=>x.Id===stageRaw)?stageRaw:0;
 const category=stage&&Number.isSafeInteger(categoryRaw)&&categories.data?.some(x=>x.Id===categoryRaw&&x.StageId===stage)?categoryRaw:0;
 return <main className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6"><EditorialWorkspace key={params.toString()} admin canSubmit initialStage={stage} initialCategory={category} create={params.get('create')==='1'&&!!category} initialTab={params.get('tab')==='requests'?'requests':'published'}/></main>;
}
export default function AdminEditorialPage(){return <Suspense fallback={<MathWorldLoading compact/>}><Content/></Suspense>;}
