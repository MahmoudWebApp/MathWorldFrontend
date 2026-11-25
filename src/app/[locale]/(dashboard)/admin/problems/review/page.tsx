import {redirect} from 'next/navigation';
export default async function AdminReviewPage({params}:{params:Promise<{locale:string}>}){const {locale}=await params;redirect('/'+(locale==='en'?'en':'ar')+'/admin/editorial?tab=requests');}
