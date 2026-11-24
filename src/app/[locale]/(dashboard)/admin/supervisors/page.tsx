'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useGetSupervisorsQuery, useCreateSupervisorMutation, useUpdateSupervisorMutation, useInviteSupervisorMutation, type SupervisorAccount } from '@/store/api/platformBrandApi';

const input='w-full rounded-xl border bg-background p-2.5 text-sm';
const button='rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50';
function errorText(e:unknown,ar:boolean) {
  const status=(e as {status?:number})?.status;
  if(status===409)return ar?'البيانات تغيرت أو البريد مستخدم. حدّث القائمة.':'The data changed or email is in use. Refresh.';
  if(status===429)return ar?'بلغت حد الدعوات. حاول لاحقاً.':'Invitation limit reached. Try later.';
  if(status===503)return ar?'خدمة البريد أو عنوان الاختبار غير مهيأ.':'Mail service or test recipient is not configured.';
  return ar?'تعذّر تنفيذ الطلب.':'Request failed.';
}
function StaffRow({row,ar}:{row:SupervisorAccount;ar:boolean}) {
  const [active,setActive]=useState(row.IsActive);
  const [permissions,setPermissions]=useState(row.Permissions);
  const [update,{isLoading:saving}]=useUpdateSupervisorMutation();
  const [invite,{isLoading:sending}]=useInviteSupervisorMutation();
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  async function save(){
    setError('');setMessage('');
    try{
      await update({id:row.Id,IsActive:active,Permissions:permissions,Revision:row.Revision}).unwrap();
      setMessage(ar?'تم الحفظ وإبطال الجلسات السابقة.':'Saved. Previous sessions revoked.');
    }catch(e){setError(errorText(e,ar));}
  }
  async function send(){
    setError('');setMessage('');
    try{
      const result=await invite({id:row.Id,Language:ar?'ar':'en'}).unwrap();
      setMessage(result.WorkerEnabled
        ? (ar?'أضيفت الدعوة إلى طابور الإرسال، الوصول غير مؤكد.':'Invitation queued; delivery not confirmed.')
        : (ar?'أضيفت الدعوة للطابور لكن عامل البريد معطّل.':'Invitation queued, but the mail worker is disabled.'));
    }catch(e){setError(errorText(e,ar));}
  }
  return <article className="space-y-3 rounded-2xl border bg-card p-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div><h2 className="font-bold">{row.FullName}</h2><p className="break-all text-sm text-muted-foreground">{row.Email}</p></div>
      <span className="rounded-lg border px-3 py-1 text-sm">{!row.IsActive?(ar?'معطّل':'Disabled'):row.StaffSetupPending?(ar?'بانتظار تعيين كلمة المرور':'Awaiting password setup'):(ar?'مفعّل':'Active')}</span>
    </div>
    <div className="flex flex-wrap gap-4 text-sm">
      <label className="flex items-center gap-2"><input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)} disabled={saving||sending}/>{ar?'الحساب مفعّل':'Account enabled'}</label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={(permissions&1)!==0} onChange={e=>setPermissions(p=>e.target.checked?p|1:0)} disabled={saving||sending}/>{ar?'إنشاء وتحرير مسوداته':'Create/edit own drafts'}</label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={(permissions&2)!==0} onChange={e=>setPermissions(p=>e.target.checked?p|2:p&~2)} disabled={saving||sending||(permissions&1)===0}/>{ar?'إرسال للمراجعة':'Submit for review'}</label>
    </div>
    <div className="flex flex-wrap gap-2">
      <button className={button} disabled={saving||sending||(active===row.IsActive&&permissions===row.Permissions)} onClick={()=>void save()}>{saving?(ar?'جارٍ الحفظ…':'Saving…'):(ar?'حفظ الصلاحيات':'Save permissions')}</button>
      {row.StaffSetupPending&&row.IsActive&&<button className={button} disabled={saving||sending||active!==row.IsActive||permissions!==row.Permissions} onClick={()=>void send()}>{sending?(ar?'جارٍ الإضافة…':'Queuing…'):(ar?'إرسال / إعادة الدعوة':'Send / resend invitation')}</button>}
    </div>
    {message&&<p role="status" className="text-sm text-primary">{message}</p>}{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
  </article>;
}
export default function SupervisorsPage(){
  const ar=useLocale()==='ar';
  const admin=useSelector((s:RootState)=>s.auth.user?.Role==='Admin');
  const [page,setPage]=useState(1);
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const {data,isFetching,isError,refetch}=useGetSupervisorsQuery(page,{skip:!admin,refetchOnMountOrArgChange:true});
  const [create,{isLoading}]=useCreateSupervisorMutation();
  async function submit(e:React.FormEvent){
    e.preventDefault();setError('');setMessage('');
    try{
      await create({FullName:name.trim(),Email:email.trim(),Language:ar?'ar':'en'}).unwrap();
      setName('');setEmail('');setPage(1);
      setMessage(ar?'تم إنشاء الحساب بانتظار التفعيل. أرسل الدعوة من القائمة.':'Account created awaiting setup. Send its invitation from the list.');
    }catch(e){setError(errorText(e,ar));}
  }
  if(!admin)return null;
  return <main className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
    <div><h1 className="text-2xl font-bold">{ar?'إدارة المشرفين':'Supervisor management'}</h1>
    <p className="text-sm text-muted-foreground">{ar?'المدير العام وحده يدير الحسابات ويعتمد المحتوى. المشرف لا ينشر ولا يصل إلى حسابات الطلاب أو التقارير.':'Only the super administrator manages accounts and approves content. Supervisors cannot publish or access learner data or reports.'}</p></div>
    <form className="space-y-3 rounded-2xl border bg-card p-4" onSubmit={submit}>
      <h2 className="font-bold">{ar?'إضافة مشرف':'Add supervisor'}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">{ar?'الاسم الكامل':'Full name'}<input className={input} required minLength={2} maxLength={150} value={name} onChange={e=>setName(e.target.value)}/></label>
        <label className="text-sm">{ar?'البريد الإلكتروني':'Email'}<input className={input} type="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)}/></label>
      </div>
      <p className="text-sm text-muted-foreground">{ar?'لا تُنشأ كلمة مرور معروفة للأدمن. يعيّنها المشرف بنفسه عبر دعوة قصيرة الصلاحية.':'The administrator does not receive a password. The supervisor sets it using a short-lived invitation.'}</p>
      <button type="submit" className="rounded-xl bg-primary px-4 py-2.5 text-primary-foreground disabled:opacity-50" disabled={isLoading}>{isLoading?(ar?'جارٍ الإنشاء…':'Creating…'):(ar?'إنشاء حساب':'Create account')}</button>
      {message&&<p role="status" className="text-sm text-primary">{message}</p>}{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
    </form>
    <div className="flex items-center justify-between"><h2 className="text-lg font-bold">{ar?'المشرفون':'Supervisors'} {data?('('+data.Total+')'):''}</h2><button className={button} disabled={isFetching} onClick={()=>void refetch()}>{ar?'تحديث':'Refresh'}</button></div>
    {isFetching&&!data&&<p role="status">{ar?'جارٍ التحميل…':'Loading…'}</p>}{isError&&<p role="alert">{ar?'تعذّر تحميل المشرفين.':'Could not load supervisors.'}</p>}
    {data&&!isError&&<>{data.Items.length===0&&<p className="text-muted-foreground">{ar?'لا يوجد مشرفون حالياً.':'No supervisors yet.'}</p>}
      {data.Items.map(row=><StaffRow key={row.Id+'-'+row.Revision} row={row} ar={ar}/>)}
      {data.Total>50&&<div className="flex gap-2 items-center"><button className={button} disabled={page<=1} onClick={()=>setPage(p=>p-1)}>{ar?'السابق':'Previous'}</button><span>{page}</span><button className={button} disabled={page*50>=data.Total} onClick={()=>setPage(p=>p+1)}>{ar?'التالي':'Next'}</button></div>}
    </>}
  </main>;
}
