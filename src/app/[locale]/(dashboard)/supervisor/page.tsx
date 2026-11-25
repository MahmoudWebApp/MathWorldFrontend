'use client';

import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/Tabs';
import {Breadcrumbs} from '@/components/ui/Breadcrumbs';
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
    {data&&!isError&&<><Breadcrumbs items={[{label:ar?'الرئيسية':'Home',href:'/supervisor'},{label:ar?'مساحة المشرف':'Supervisor workspace'}]}/><Tabs dir={ar?'rtl':'ltr'} defaultValue={(data.Permissions&1)!==0?'problems':'settings'}><TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">{(data.Permissions&1)!==0&&<TabsTrigger value="problems">{ar?'المسائل':'Problems'}</TabsTrigger>}<TabsTrigger value="settings">{ar?'إعدادات الحساب':'Account settings'}</TabsTrigger></TabsList>{(data.Permissions&1)!==0&&<TabsContent value="problems"><EditorialWorkspace admin={false} canSubmit={(data.Permissions&2)!==0}/></TabsContent>}<TabsContent value="settings"><ChangePasswordForm/></TabsContent></Tabs></>}
  </main>;
}
