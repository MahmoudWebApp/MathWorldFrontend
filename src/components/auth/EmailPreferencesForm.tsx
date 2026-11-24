'use client';

import {useState} from 'react';
import {useLocale} from 'next-intl';
import {useSelector} from 'react-redux';
import type {RootState} from '@/store';
import {useGetEmailPreferencesQuery,useSaveEmailPreferencesMutation,type EmailPreferenceInput,type EmailPreferences} from '@/store/api/usersApi';

export function EmailPreferencesForm() {
  const user=useSelector((s:RootState)=>s.auth.user);
  return user?.Role==='Student'?<Preferences key={user.Id} userId={user.Id}/>:null;
}
function Preferences({userId}:{userId:number}) {
  const ar=useLocale()==='ar';
  const {currentData:data,isFetching,isError,refetch}=useGetEmailPreferencesQuery(userId,{refetchOnMountOrArgChange:true});
  return <section className="space-y-3 rounded-2xl border bg-card p-4">
    <h2 className="font-bold">{ar?'تفضيلات البريد الإلكتروني':'Email preferences'}</h2>
    <p className="text-sm text-muted-foreground">{ar?'إشعارات المنصة تبقى متاحة داخل حسابك. هذه الخيارات للرسائل الإضافية فقط ولا تؤثر على رسائل الأمان.':'In-app notifications remain available. These choices apply only to optional emails, not security messages.'}</p>
    {isError?<div role="alert"><p>{ar?'تعذّر تحميل التفضيلات.':'Could not load preferences.'}</p><button type="button" className="mt-2 underline" onClick={()=>void refetch()}>{ar?'إعادة المحاولة':'Retry'}</button></div>
      :!data||isFetching?<p role="status">{ar?'جارٍ التحميل…':'Loading…'}</p>
      :<Editor key={JSON.stringify(data)} userId={userId} initial={data} refresh={async()=>{await refetch().unwrap();}}/>}
  </section>;
}
function Editor({userId,initial,refresh}:{userId:number;initial:EmailPreferences;refresh:()=>Promise<void>}) {
  const ar=useLocale()==='ar';
  const [draft,setDraft]=useState<EmailPreferenceInput>({EmailLearningUpdates:initial.EmailLearningUpdates,EmailSubscriptionUpdates:initial.EmailSubscriptionUpdates,EmailImportantAnnouncements:initial.EmailImportantAnnouncements,Locale:initial.Locale});
  const [save,{isLoading}]=useSaveEmailPreferencesMutation();
  const [message,setMessage]=useState('');
  const [failed,setFailed]=useState(false);
  const options=[['EmailLearningUpdates','الشهادات والإنجازات التعليمية','Certificates and learning achievements'],['EmailSubscriptionUpdates','تحديثات الاشتراك','Subscription updates'],['EmailImportantAnnouncements','الإشعارات المهمة','Important notices']] as const;
  async function submit(){
    setMessage('');setFailed(false);
    try{await save({userId,preferences:draft}).unwrap();await refresh();setMessage(ar?'تم حفظ التفضيلات.':'Preferences saved.');}
    catch{setFailed(true);setMessage(ar?'تعذّر حفظ التفضيلات. حاول مجدداً.':'Could not save preferences. Try again.');}
  }
  return <form className="space-y-3" onSubmit={e=>{e.preventDefault();void submit();}}>
    {!initial.EmailVerified&&<p className="text-sm text-muted-foreground">{ar?'يلزم تأكيد بريد الحساب قبل الاشتراك في الرسائل الاختيارية.':'Your account email must be verified before opting into optional emails.'}</p>}
    {!initial.OptionalDeliveryEnabled&&<p className="text-sm text-muted-foreground">{ar?'الإرسال الاختياري غير مفعّل حالياً. يمكنك حفظ خياراتك مسبقاً.':'Optional delivery is currently disabled. You can save your choices in advance.'}</p>}
    {options.map(([key,a,e])=><label key={key} className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={draft[key]} disabled={isLoading||(!initial.EmailVerified&&!draft[key])} onChange={e=>setDraft(p=>({...p,[key]:e.target.checked}))}/>{ar?a:e}
    </label>)}
    <label className="flex flex-wrap items-center gap-2 text-sm">{ar?'لغة الرسائل':'Email language'}
      <select className="rounded-lg border bg-background p-2" disabled={isLoading} value={draft.Locale} onChange={e=>setDraft(p=>({...p,Locale:e.target.value==='en'?'en':'ar'}))}><option value="ar">العربية</option><option value="en">English</option></select>
    </label>
    <button type="submit" disabled={isLoading} className="rounded-xl bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50">{isLoading?(ar?'جارٍ الحفظ…':'Saving…'):(ar?'حفظ التفضيلات':'Save preferences')}</button>
    {message&&<p role={failed?'alert':'status'} className="text-sm">{message}</p>}
  </form>;
}
