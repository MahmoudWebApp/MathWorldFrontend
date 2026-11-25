import {redirect} from 'next/navigation';
type Props={params:Promise<{locale:string;stageId:string;trackId:string}>};
export default async function TrackPage({params}:Props){
 const {locale,stageId,trackId}=await params;
 redirect('/'+locale+'/stages/'+encodeURIComponent(stageId)+'#track-'+encodeURIComponent(trackId));
}
