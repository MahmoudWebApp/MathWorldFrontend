'use client';
import {WorkspacePageHeader} from '@/components/ui/WorkspacePageHeader';
import {UsersRound,Save,History,Trash2,Mail} from 'lucide-react';

import {DataBadge} from '@/components/admin/AdminDataBadges';
import {Tooltip,TooltipTrigger,TooltipContent} from '@/components/ui/Tooltip';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useGetSupervisorsQuery, useCreateSupervisorMutation, useDeleteSupervisorMutation, useUpdateSupervisorMutation, useInviteSupervisorMutation, useGetSupervisorActivityQuery, type SupervisorAccount } from '@/store/api/platformBrandApi';

const input='w-full rounded-xl border bg-background p-2.5 text-sm';
const button='rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50';
function errorText(e:unknown,ar:boolean) {
  const status=(e as {status?:number})?.status;
  if(status===409)return ar?'البيانات تغيرت أو البريد مستخدم. حدّث القائمة.':'The data changed or email is in use. Refresh.';
  if(status===429)return ar?'بلغت حد الدعوات. حاول لاحقاً.':'Invitation limit reached. Try later.';
  if(status===503)return ar?'خدمة البريد أو عنوان الاختبار غير مهيأ.':'Mail service or test recipient is not configured.';
  return ar?'تعذّر تنفيذ الطلب.':'Request failed.';
}
const activityLabels:Record<string,string>={SupervisorCreated:'إنشاء الحساب',SupervisorInvited:'إرسال الدعوة للطابور',SupervisorInvitationAccepted:'قبول الدعوة',SupervisorPermissionsChanged:'تعديل الصلاحيات',LoggedIn:'تسجيل الدخول',ExplicitSignOut:'تسجيل الخروج',PasswordChanged:'تغيير كلمة المرور',PasswordReset:'استعادة كلمة المرور'};
function StaffActivity({id,ar}:{id:number;ar:boolean}) {
  const [page,setPage]=useState(1);
  const {data,isFetching,isError,refetch}=useGetSupervisorActivityQuery({id,page},{refetchOnMountOrArgChange:true});
  return <section className="space-y-2 border-t pt-3">
    <div className="flex items-center justify-between"><h3 className="font-semibold">{ar?'سجل النشاط':'Activity history'}</h3></div>
    {isFetching&&!data&&<p role="status">{ar?'جارٍ التحميل…':'Loading…'}</p>}
    {isError&&<p role="alert">{ar?'تعذّر جلب السجل':'Could not load history'} <button className="underline" onClick={()=>void refetch()}>{ar?'إعادة المحاولة':'Retry'}</button></p>}
    {data&&!isError&&<>{data.Items.length===0&&<p className="text-sm text-muted-foreground">{ar?'لا توجد أحداث مسجلة':'No recorded events'}</p>}
    {data.Items.map(event=><div key={event.Id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2 text-sm"><span>{ar?activityLabels[event.Action]??event.Action:event.Action} · {event.ActorRole==='Admin'?(ar?'المدير العام':'Super admin'):(ar?'المشرف':'Supervisor')}</span><time dateTime={event.CreatedAtUtc} className="text-xs text-muted-foreground">{new Date(event.CreatedAtUtc).toLocaleString(ar?'ar':'en')}</time></div>)}
    {data.Total>30&&<div className="flex gap-2"><button className={button} disabled={page===1} onClick={()=>setPage(p=>p-1)}>{ar?'السابق':'Previous'}</button><button className={button} disabled={page*30>=data.Total} onClick={()=>setPage(p=>p+1)}>{ar?'التالي':'Next'}</button></div>}</>}
  </section>;
}
function StaffRow({row,ar}:{row:SupervisorAccount;ar:boolean}) {
  const [showActivity,setShowActivity]=useState(false);
  const [active,setActive]=useState(row.IsActive);
  const [permissions,setPermissions]=useState(row.Permissions);
  const [update,{isLoading:saving}]=useUpdateSupervisorMutation();
  const [invite,{isLoading:sending}]=useInviteSupervisorMutation();
  const [remove,{isLoading:deleting}]=useDeleteSupervisorMutation();
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  async function save(){
    setError('');setMessage('');
    try{
      await update({id:row.Id,IsActive:active,Permissions:permissions,Revision:row.Revision}).unwrap();
      setMessage(ar?'تم الحفظ وإبطال الجلسات السابقة.':'Saved. Previous sessions revoked.');
    }catch(e){setError(errorText(e,ar));}
  }
  async function deleteAccount(){
    if(deleting||saving||sending)return;
    if(!window.confirm(ar?'حذف حساب المشرف نهائياً: '+row.FullName+'؟ سيحذف حسابه وسجل نشاطه ومسوداته غير المنشورة نهائياً. ستبقى المسائل المنشورة محفوظة، ولا يمكن التراجع.':'Permanently delete '+row.FullName+'? Their account, activity and unpublished drafts will be permanently removed. Published problems will be preserved; this cannot be undone.'))return;
    setError('');setMessage('');
    try{const result=await remove(row.Id).unwrap();if(!result.Deleted)throw Error('DeletionFailed');}
    catch(e){const code=(e as {data?:{Message?:string}})?.data?.Message;setError(code==='SupervisorHasOpenEditorialWork'?(ar?'يوجد محتوى غير مكتمل للمشرف. راجعه أو اسحبه قبل الحذف.':'Resolve or withdraw the supervisor’s open editorial work before deleting.'):ar?'تعذّر حذف المشرف. قد توجد سجلات محمية.':'Deletion failed; protected records may exist.');}
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
  return <article className="grid gap-4 border-b last:border-b-0 bg-card p-4 lg:grid-cols-[minmax(180px,1fr)_minmax(0,1.8fr)_auto] lg:items-start">
    <div className="space-y-2">
      <div><h2 className="font-bold">{row.FullName}</h2><p className="break-all text-sm text-muted-foreground">{row.Email}</p></div>
      <DataBadge tone={!row.IsActive?'red':row.StaffSetupPending?'amber':'green'}>{!row.IsActive?(ar?'معطّل':'Disabled'):row.StaffSetupPending?(ar?'بانتظار تعيين كلمة المرور':'Awaiting password setup'):(ar?'مفعّل':'Active')}</DataBadge>
    </div>
    <div className="grid gap-2 text-sm sm:grid-cols-2">
      <label className="flex items-center gap-2"><input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)} disabled={saving||sending}/>{ar?'الحساب مفعّل':'Account enabled'}</label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={(permissions&1)!==0} onChange={e=>setPermissions(p=>e.target.checked?p|1:p&~3)} disabled={saving||sending}/>{ar?'إضافة وتعديل مسائله':'Add/edit own problems'}</label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={(permissions&2)!==0} onChange={e=>setPermissions(p=>e.target.checked?p|2:p&~2)} disabled={saving||sending||(permissions&1)===0}/>{ar?'إرسال للمراجعة':'Submit for review'}</label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={(permissions&4)!==0} onChange={e=>setPermissions(p=>e.target.checked?p|4:p&~12)} disabled={saving||sending}/>{ar?'عرض الطلاب':'View students'}</label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={(permissions&8)!==0} onChange={e=>setPermissions(p=>e.target.checked?p|8:p&~8)} disabled={saving||sending||(permissions&4)===0}/>{ar?'عرض سجلات الطلاب':'View student activity'}</label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={(permissions&16)!==0} onChange={e=>setPermissions(p=>e.target.checked?p|16:p&~16)} disabled={saving||sending}/>{ar?'عرض التقارير':'View reports'}</label>
    </div>
    <div className="flex flex-wrap gap-2">
      <Tooltip><TooltipTrigger asChild><button className={button+' text-emerald-600'} disabled={saving||sending||(active===row.IsActive&&permissions===row.Permissions)} onClick={()=>void save()} aria-label={ar?'حفظ الصلاحيات':'Save permissions'}><Save size={17}/></button></TooltipTrigger><TooltipContent>{ar?'حفظ الصلاحيات':'Save permissions'}</TooltipContent></Tooltip>
      {row.StaffSetupPending&&row.IsActive&&<Tooltip><TooltipTrigger asChild><button className={button} disabled={saving||sending||active!==row.IsActive||permissions!==row.Permissions} onClick={()=>void send()} aria-label={ar?'إرسال الدعوة':'Send invitation'}><Mail size={17}/></button></TooltipTrigger><TooltipContent>{ar?'إرسال الدعوة':'Send invitation'}</TooltipContent></Tooltip>}
      <Tooltip><TooltipTrigger asChild><button className={button} aria-expanded={showActivity} onClick={()=>setShowActivity(v=>!v)} aria-label={ar?'سجل النشاط':'Activity history'}><History size={17}/></button></TooltipTrigger><TooltipContent>{ar?'سجل النشاط':'Activity history'}</TooltipContent></Tooltip>
      <Tooltip><TooltipTrigger asChild><button type="button" className={button+' text-destructive border-destructive/30'} disabled={deleting||saving||sending} onClick={()=>void deleteAccount()} aria-label={ar?'حذف المشرف':'Delete supervisor'}><Trash2 size={17}/></button></TooltipTrigger><TooltipContent>{ar?'حذف المشرف':'Delete supervisor'}</TooltipContent></Tooltip>
    </div>
    <div className="lg:col-span-3 empty:hidden">
    {message&&<p role="status" className="text-sm text-primary">{message}</p>}{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
    {showActivity&&<StaffActivity id={row.Id} ar={ar}/>}
    </div>
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
    <div><WorkspacePageHeader title={ar?'المشرفون':'Supervisors'} icon={UsersRound}/>
    </div>
    <form className="space-y-3 rounded-2xl border bg-card p-4" onSubmit={submit}>
      <h2 className="font-bold">{ar?'إضافة مشرف':'Add supervisor'}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">{ar?'الاسم الكامل':'Full name'}<input className={input} required minLength={2} maxLength={150} value={name} onChange={e=>setName(e.target.value)}/></label>
        <label className="text-sm">{ar?'البريد الإلكتروني':'Email'}<input className={input} type="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)}/></label>
      </div>
      <button type="submit" className="rounded-xl bg-primary px-4 py-2.5 text-primary-foreground disabled:opacity-50" disabled={isLoading}>{isLoading?(ar?'جارٍ الإنشاء…':'Creating…'):(ar?'إنشاء حساب':'Create account')}</button>
      {message&&<p role="status" className="text-sm text-primary">{message}</p>}{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
    </form>
    <div className="flex items-center justify-between"><h2 className="text-lg font-bold">{ar?'المشرفون':'Supervisors'} {data?('('+data.Total+')'):''}</h2></div>
    {isFetching&&!data&&<p role="status">{ar?'جارٍ التحميل…':'Loading…'}</p>}{isError&&<p role="alert">{ar?'تعذّر تحميل المشرفين.':'Could not load supervisors.'} <button className="underline" onClick={()=>void refetch()}>{ar?'إعادة المحاولة':'Retry'}</button></p>}
    {data&&!isError&&<>{data.Items.length===0&&<p className="text-muted-foreground">{ar?'لا يوجد مشرفون حالياً.':'No supervisors yet.'}</p>}
      <div className="overflow-hidden rounded-2xl border bg-card"><div className="hidden grid-cols-[minmax(180px,1fr)_minmax(0,1.8fr)_auto] gap-4 bg-muted/50 p-4 text-sm font-bold lg:grid"><span>{ar?'المشرف والحالة':'Supervisor and status'}</span><span>{ar?'الصلاحيات':'Permissions'}</span><span>{ar?'الإجراءات':'Actions'}</span></div>{data.Items.map(row=><StaffRow key={row.Id+'-'+row.Revision} row={row} ar={ar}/>)}</div>
      {data.Total>50&&<div className="flex gap-2 items-center"><button className={button} disabled={page<=1} onClick={()=>setPage(p=>p-1)}>{ar?'السابق':'Previous'}</button><span>{page}</span><button className={button} disabled={page*50>=data.Total} onClick={()=>setPage(p=>p+1)}>{ar?'التالي':'Next'}</button></div>}
    </>}
  </main>;
}
