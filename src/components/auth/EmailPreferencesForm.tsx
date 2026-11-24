'use client';

import {useState} from 'react';
import {useLocale} from 'next-intl';
import {useSelector} from 'react-redux';
import type {RootState} from '@/store';
import {useGetEmailPreferencesQuery,useSaveEmailPreferencesMutation,useRequestEmailVerificationMutation,type EmailPreferenceInput,type EmailPreferences} from '@/store/api/usersApi';

export function EmailPreferencesForm() {
  const user=useSelector((s:RootState)=>s.auth.user);
  return user?.Role==='Student'?<Preferences key={user.Id} userId={user.Id}/>:null;
}
function Preferences({userId}:{userId:number}) {
  const ar=useLocale()==='ar';
  const {currentData:data,isFetching,isError,refetch}=useGetEmailPreferencesQuery(userId,{refetchOnMountOrArgChange:true,refetchOnFocus:true});
  const [status,setStatus]=useState<{text:string;error:boolean}|null>(null);
  const [request,{isLoading:requesting}]=useRequestEmailVerificationMutation();
  async function verify(){
    setStatus(null);
    try{
      const result=await request(ar?'ar':'en').unwrap();
      if(result.AlreadyVerified){await refetch().unwrap();setStatus({text:ar?'بريدك مؤكّد.':'Your email is verified.',error:false});}
      else if(result.Queued)setStatus({text:ar?'تمت إضافة رسالة التأكيد إلى طابور الإرسال. افتح الرابط عند وصوله ثم حدّث هذه الصفحة.':'Verification email queued. Open its link when received, then refresh this page.',error:false});
      else throw new Error('Unexpected response');
    }catch(e){
      const limited=(e as {status?:number})?.status===429;
      setStatus({text:limited?(ar?'انتظر قليلاً قبل طلب رابط آخر.':'Wait before requesting another link.'):(ar?'تعذّر طلب رسالة التأكيد.':'Could not request verification email.'),error:true});
    }
  }
  return <section className="space-y-3 rounded-2xl border bg-card p-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="font-bold">{ar?'تفضيلات البريد الإلكتروني':'Email preferences'}</h2>
      <button type="button" disabled={isFetching||requesting} className="rounded-lg border px-3 py-2 text-sm" onClick={()=>void refetch()}>{ar?'تحديث':'Refresh'}</button>
    </div>
    <p className="text-sm text-muted-foreground">{ar?'إشعارات المنصة تبقى متاحة داخل حسابك. هذه الخيارات للرسائل الإضافية فقط ولا تؤثر على رسائل الأمان.':'In-app notifications remain available. These choices apply only to optional emails, not security messages.'}</p>
    {isError?<div role="alert"><p>{ar?'تعذّر تحميل التفضيلات.':'Could not load preferences.'}</p><button type="button" className="mt-2 underline" onClick={()=>void refetch()}>{ar?'إعادة المحاولة':'Retry'}</button></div>
      :!data?<p role="status">{ar?'جارٍ التحميل…':'Loading…'}</p>
      :<>
        <p className="text-sm">{data.EmailVerified?(ar?'بريد الحساب مؤكّد.':'Account email verified.'):(ar?'بريد الحساب غير مؤكّد.':'Account email not verified.')}</p>
        {!data.EmailVerified&&data.VerificationAvailable===true&&<button type="button" disabled={requesting||isFetching} onClick={()=>void verify()} className="rounded-lg border border-primary px-3 py-2 text-sm text-primary disabled:opacity-50">{requesting?(ar?'جارٍ الطلب…':'Requesting…'):(ar?'إرسال رابط التأكيد':'Send verification link')}</button>}
        {!data.EmailVerified&&data.VerificationAvailable!==true&&<p className="text-sm text-muted-foreground">{ar?'إرسال رابط التأكيد غير متاح حالياً.':'Email verification is currently unavailable.'}</p>}
        <Editor key={JSON.stringify(data)} userId={userId} initial={data} refreshing={isFetching||requesting} onSaved={async()=>{await refetch().unwrap();setStatus({text:ar?'تم حفظ التفضيلات.':'Preferences saved.',error:false});}} onError={()=>setStatus({text:ar?'تعذّر حفظ التفضيلات. حاول مجدداً.':'Could not save preferences. Try again.',error:true})}/>
      </>}
    {status&&<p role={status.error?'alert':'status'} className="text-sm">{status.text}</p>}
  </section>;
}
function Editor({userId,initial,refreshing,onSaved,onError}:{userId:number;initial:EmailPreferences;refreshing:boolean;onSaved:()=>Promise<void>;onError:()=>void}) {
  const ar=useLocale()==='ar';
  const [draft,setDraft]=useState<EmailPreferenceInput>({EmailLearningUpdates:initial.EmailLearningUpdates,EmailSubscriptionUpdates:initial.EmailSubscriptionUpdates,EmailImportantAnnouncements:initial.EmailImportantAnnouncements,Locale:initial.Locale});
  const [save,{isLoading}]=useSaveEmailPreferencesMutation();
  const busy=isLoading||refreshing;
  const options=[['EmailLearningUpdates','الشهادات والإنجازات التعليمية','Certificates and learning achievements'],['EmailSubscriptionUpdates','تحديثات الاشتراك','Subscription updates'],['EmailImportantAnnouncements','الإشعارات المهمة','Important notices']] as const;
  async function submit(){
    if(busy)return;
    try{await save({userId,preferences:draft}).unwrap();await onSaved();}
    catch{onError();}
  }
  return <form className="space-y-3" onSubmit={e=>{e.preventDefault();void submit();}}>
    {!initial.EmailVerified&&<p className="text-sm text-muted-foreground">{ar?'يلزم تأكيد بريد الحساب قبل الاشتراك في الرسائل الاختيارية.':'Verify your account email before opting into optional emails.'}</p>}
    {!initial.OptionalDeliveryEnabled&&<p className="text-sm text-muted-foreground">{ar?'الإرسال الاختياري غير مفعّل حالياً.':'Optional delivery is currently disabled.'}</p>}
    {options.map(([key,a,e])=><label key={key} className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={draft[key]} disabled={busy||(!initial.EmailVerified&&!draft[key])} onChange={e=>setDraft(p=>({...p,[key]:e.target.checked}))}/>{ar?a:e}
    </label>)}
    <label className="flex flex-wrap items-center gap-2 text-sm">{ar?'لغة الرسائل':'Email language'}
      <select className="rounded-lg border bg-background p-2" disabled={busy} value={draft.Locale} onChange={e=>setDraft(p=>({...p,Locale:e.target.value==='en'?'en':'ar'}))}><option value="ar">العربية</option><option value="en">English</option></select>
    </label>
    <button type="submit" disabled={busy} className="rounded-xl bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50">{isLoading?(ar?'جارٍ الحفظ…':'Saving…'):(ar?'حفظ التفضيلات':'Save preferences')}</button>
  </form>;
}
