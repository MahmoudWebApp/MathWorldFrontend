import {notFound} from 'next/navigation';
import {StudentTrackWorkspace} from '@/components/curriculum/TrackViews';

type Props={params:Promise<{trackId:string;categoryId:string}>};
export default async function TrackCategoryPage({params}:Props){
  const {trackId,categoryId}=await params;
  const track=Number(trackId),category=Number(categoryId);
  if(!Number.isSafeInteger(track)||track<=0||!Number.isSafeInteger(category)||category<=0)notFound();
  return <StudentTrackWorkspace trackId={track} categoryId={category}/>;
}
