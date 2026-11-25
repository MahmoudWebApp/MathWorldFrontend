'use client';
import {useState} from 'react';
import {useLocale} from 'next-intl';
import {useSelector} from 'react-redux';
import type {RootState} from '@/store';
import {useGetLeaderboardNamePreferenceQuery,useSaveLeaderboardNamePreferenceMutation} from '@/store/api/usersApi';
export function LeaderboardNamePreference(){
 const user=useSelector((s:RootState)=>s.auth.user);
 return user?.Role==='Student'?<Preference key={user.Id} id={user.Id}/>:null;
}
function Preference({id}:{id:number}){
 const ar=useLocale()==='ar';const q=useGetLeaderboardNamePreferenceQuery(id,{refetchOnMountOrArgChange:true,refetchOnFocus:true});
 const [save,{isLoading}]=useSaveLeaderboardNamePreferenceMutation();
 const [error,setError]=useState(false);
 if(q.isError)return <p role="alert">{ar?'تعذّر تحميل الخصوصية.':'Could not load privacy settings.'} <button className="underline" onClick={()=>void q.refetch()}>{ar?'إعادة المحاولة':'Retry'}</button></p>;
 if(!q.currentData)return <p role="status">{ar?'جارٍ التحميل…':'Loading…'}</p>;
 return <section className="space-y-3 rounded-2xl border bg-card p-4">
 <h2 className="font-bold">{ar?'الظهور في المتفوقين':'Leaderboard visibility'}</h2>
 <label className="flex items-center justify-between gap-3"><span>{ar?'عرض اسمي الكامل للطلاب في مرحلتي':'Show my full name to students in my stage'}</span><input type="checkbox" checked={q.currentData.ShareLeaderboardFullName} disabled={isLoading||q.isFetching} onChange={async e=>{setError(false);try{await save({userId:id,ShareLeaderboardFullName:e.target.checked}).unwrap();await q.refetch().unwrap();}catch{setError(true);}}}/></label>
 {error&&<p role="alert">{ar?'تعذّر حفظ الاختيار.':'Could not save preference.'}</p>}
 </section>;
}
