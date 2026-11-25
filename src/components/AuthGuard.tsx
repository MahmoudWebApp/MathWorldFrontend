'use client';
import {useEffect} from 'react';
import {useSelector} from 'react-redux';
import {useLocale} from 'next-intl';
import {usePathname,useRouter} from '@/i18n/routing';
import type {RootState} from '@/store';
import {MathWorldLoading} from '@/components/ui/MathWorldLoading';
export function AuthGuard({children}:{children:React.ReactNode}){
 const path=usePathname(),router=useRouter(),ar=useLocale()==='ar';
 const {user,isLoading,isAuthenticated,sessionUnavailable}=useSelector((s:RootState)=>s.auth);
 const admin=path==='/admin'||path.startsWith('/admin/');
 const supervisor=path==='/supervisor'||path.startsWith('/supervisor/');
 const student=path==='/dashboard'||path.startsWith('/dashboard/')||['/learning-stage','/profile','/social-accounts','/journey','/daily-challenge','/premium/report'].includes(path)||/^\/problems\/[^/]+$/.test(path);
 const account=path==='/notifications';
 const privateRoute=admin||supervisor||student||account;
 const role=user?.Role;
 const home=role==='Admin'?'/admin':role==='Supervisor'?'/supervisor':'/dashboard';
 const allowed=!!isAuthenticated&&!!user&&(admin?role==='Admin':supervisor?role==='Supervisor':student?role==='Student':account?role==='Admin'||role==='Student':true);
 const target=privateRoute&&!allowed?(!isAuthenticated?'/login':home):null;
 useEffect(()=>{if(!isLoading&&!sessionUnavailable&&target)router.replace(target);},[isLoading,sessionUnavailable,target,router]);
 if(!privateRoute)return <>{children}</>;
 if(sessionUnavailable)return <div className="mx-auto max-w-lg p-8 text-center"><p role="alert">{ar?'تعذّر التحقق من الجلسة.':'Unable to verify session.'}</p><button className="sr-wave-button mt-4 rounded-xl px-4 py-2 text-white" onClick={()=>window.dispatchEvent(new Event('mathworld:retry-auth'))}>{ar?'إعادة المحاولة':'Retry'}</button></div>;
 if(isLoading||!allowed)return <div className="p-8"><MathWorldLoading compact/></div>;
 return <>{children}</>;
}
