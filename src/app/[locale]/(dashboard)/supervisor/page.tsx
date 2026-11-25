'use client';
import {WorkspacePageHeader} from '@/components/ui/WorkspacePageHeader';
import {ShieldCheck} from 'lucide-react';
import {MathWorldLoading} from '@/components/ui/MathWorldLoading';

import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/Tabs';
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
  return <main className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6">
    <WorkspacePageHeader title={ar?'مساحة المشرف':'Supervisor workspace'} icon={ShieldCheck}/>
    {isFetching&&!data&&<MathWorldLoading/>}
    {isError&&<div role="alert">{ar?'تعذّر التحقق من الصلاحيات.':'Could not verify permissions.'} <button className="text-primary underline" onClick={()=>void refetch()}>{ar?'إعادة المحاولة':'Retry'}</button></div>}
    {data&&!isError&&<><Tabs dir={ar?'rtl':'ltr'} key={data.Permissions} defaultValue={(data.Permissions&1)!==0?'problems':(data.Permissions&4)!==0?'students':(data.Permissions&16)!==0?'reports':'settings'}><TabsList className="flex h-auto w-fit max-w-full flex-wrap justify-start gap-1">{(data.Permissions&1)!==0&&<TabsTrigger value="problems">{ar?'المحتوى التعليمي':'Learning content'}</TabsTrigger>}{(data.Permissions&4)!==0&&<TabsTrigger value="students">{ar?"الطلاب":"Students"}</TabsTrigger>}{(data.Permissions&16)!==0&&<TabsTrigger value="reports">{ar?"التقارير":"Reports"}</TabsTrigger>}<TabsTrigger value="settings">{ar?'إعدادات الحساب':'Account settings'}</TabsTrigger></TabsList>{(data.Permissions&1)!==0&&<TabsContent value="problems"><EditorialWorkspace embedded admin={false} canSubmit={(data.Permissions&2)!==0}/></TabsContent>}{(data.Permissions&4)!==0&&<TabsContent value="students"><SupervisorStudents canViewActivity={(data.Permissions&8)!==0}/></TabsContent>}{(data.Permissions&16)!==0&&<TabsContent value="reports"><SupervisorReportsPanel/></TabsContent>}<TabsContent value="settings"><ChangePasswordForm/></TabsContent></Tabs></>}
  </main>;
}
