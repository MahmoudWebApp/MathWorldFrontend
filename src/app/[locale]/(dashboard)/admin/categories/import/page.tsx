import {redirect} from 'next/navigation';
export default async function RetiredImportPage({params}:{params:Promise<{locale:string}>}){const {locale}=await params;redirect('/'+(locale==='en'?'en':'ar')+'/admin/learning-tracks');}
