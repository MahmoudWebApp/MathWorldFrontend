'use client';

import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useGetSupervisorPermissionsQuery } from '@/store/api/platformBrandApi';
import { EditorialWorkspace } from '@/components/editorial/EditorialWorkspace';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';

export default function SupervisorWorkspace(){
  const ar=useLocale()==='ar';
  const staff=useSelector((s:RootState)=>s.auth.user?.Role==='Supervisor'&&s.auth.isAuthenticated);
  const {data,isFetching,isError,refetch}=useGetSupervisorPermissionsQuery(undefined,{skip:!staff,refetchOnMountOrArgChange:true});
  if(!staff)return <main className="p-6 text-center"><a className="text-primary underline" href={ar?'/ar/login':'/en/login'}>{ar?'تسجيل الدخول':'Sign in'}</a></main>;
  return <main className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
    <h1 className="text-2xl font-bold">{ar?'مساحة المشرف':'Supervisor workspace'}</h1>
    {isFetching&&!data&&<p role="status">{ar?'جارٍ التحقق من الصلاحيات…':'Checking permissions…'}</p>}
    {isError&&<div role="alert">{ar?'تعذّر التحقق من الصلاحيات.':'Could not verify permissions.'} <button className="text-primary underline" onClick={()=>void refetch()}>{ar?'إعادة المحاولة':'Retry'}</button></div>}
    {data&&!isError&&<section className="space-y-3 rounded-2xl border bg-card p-5">
      <h2 className="font-bold">{data.FullName}</h2><p className="text-sm text-muted-foreground">{ar?'صلاحيات حسابك المعتمدة':'Your assigned permissions'}</p>
      <p>{(data.Permissions&1)!==0?(ar?'مسموح: إنشاء وتحرير مسوداتك':'Allowed: create and edit your drafts'):(ar?'غير مسموح: تحرير المسودات':'Not allowed: edit drafts')}</p>
      <p>{(data.Permissions&2)!==0?(ar?'مسموح: إرسال مسوداتك للمراجعة':'Allowed: submit drafts for review'):(ar?'غير مسموح: إرسال للمراجعة':'Not allowed: submit drafts')}</p>
      <p className="text-sm text-muted-foreground">{ar?'نشر المحتوى واعتماده من اختصاص المدير العام.':'Publishing and approval are reserved for the super administrator.'}</p>
    </section>}
    {data&&!isError&&(data.Permissions&1)!==0&&<EditorialWorkspace admin={false} canSubmit={(data.Permissions&2)!==0}/>}
    <ChangePasswordForm/>
  </main>;
}
