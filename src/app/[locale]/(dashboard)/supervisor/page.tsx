'use client';

import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/Tabs';
import {Breadcrumbs} from '@/components/ui/Breadcrumbs';
import {SupervisorStudents,SupervisorReportsPanel} from '@/components/supervisor/SupervisorReadViews';
import { useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useGetSupervisorPermissionsQuery } from '@/store/api/platformBrandApi';
import { EditorialWorkspace } from '@/components/editorial/EditorialWorkspace';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';

export default function SupervisorWorkspace(){
  const ar=useLocale()==='ar';
  const staff=useSelector((s:RootState)=>s.auth.user?.Role==='Supervisor'&&s.auth.isAuthenticated);
  const {data,isFetching,isError,refetch}=useGetSupervisorPermissionsQuery(undefined,{skip:!staff,refetchOnMountOrArgChange:true,refetchOnFocus:true,refetchOnReconnect:true,pollingInterval:30000,skipPollingIfUnfocused:true});
  if(!staff)return <main className="p-6 text-center"><a className="text-primary underline" href={ar?'/ar/login':'/en/login'}>{ar?'تسجيل الدخول':'Sign in'}</a></main>;
  return <main className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
    <h1 className="text-2xl font-bold">{ar?'مساحة المشرف':'Supervisor workspace'}</h1>
    {isFetching&&!data&&<p role="status">{ar?'جارٍ التحقق من الصلاحيات…':'Checking permissions…'}</p>}
    {isError&&<div role="alert">{ar?'تعذّر التحقق من الصلاحيات.':'Could not verify permissions.'} <button className="text-primary underline" onClick={()=>void refetch()}>{ar?'إعادة المحاولة':'Retry'}</button></div>}
    {data&&!isError&&<><Breadcrumbs items={[{label:ar?'الرئيسية':'Home',href:'/supervisor'},{label:ar?'مساحة المشرف':'Supervisor workspace'}]}/><Tabs dir={ar?'rtl':'ltr'} key={data.Permissions} defaultValue={(data.Permissions&1)!==0?'problems':(data.Permissions&4)!==0?'students':(data.Permissions&16)!==0?'reports':'settings'}><TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">{(data.Permissions&1)!==0&&<TabsTrigger value="problems">{ar?'المسائل':'Problems'}</TabsTrigger>}{(data.Permissions&4)!==0&&<TabsTrigger value="students">{ar?"الطلاب":"Students"}</TabsTrigger>}{(data.Permissions&16)!==0&&<TabsTrigger value="reports">{ar?"التقارير":"Reports"}</TabsTrigger>}<TabsTrigger value="settings">{ar?'إعدادات الحساب':'Account settings'}</TabsTrigger></TabsList>{(data.Permissions&1)!==0&&<TabsContent value="problems"><EditorialWorkspace admin={false} canSubmit={(data.Permissions&2)!==0}/></TabsContent>}{(data.Permissions&4)!==0&&<TabsContent value="students"><SupervisorStudents canViewActivity={(data.Permissions&8)!==0}/></TabsContent>}{(data.Permissions&16)!==0&&<TabsContent value="reports"><SupervisorReportsPanel/></TabsContent>}<TabsContent value="settings"><ChangePasswordForm/></TabsContent></Tabs></>}
  </main>;
}
