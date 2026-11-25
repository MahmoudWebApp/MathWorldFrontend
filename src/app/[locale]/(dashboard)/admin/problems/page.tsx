import {redirect} from 'next/navigation';
export default async function AdminProblemsPage({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const {locale}=await params;const q=await searchParams;const next=new URLSearchParams();
 for(const key of ['stageId','categoryId','create']){const v=q[key];if(typeof v==='string'&&/^\d+$/.test(v))next.set(key,v);}
 redirect('/'+(locale==='en'?'en':'ar')+'/admin/editorial'+(next.size?'?'+next.toString():''));
}
