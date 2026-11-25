'use client';
import {usePathname} from '@/i18n/routing';
import {useLocale} from 'next-intl';
import {Breadcrumbs,type BreadcrumbItem} from './Breadcrumbs';
import {ADMIN_NAV_ITEMS} from '@/components/admin/AdminNavigation';
import {STUDENT_NAV_ITEMS} from '@/components/dashboard/StudentWorkspaceNavigation';
export function WorkspaceBreadcrumbs(){
 const path=usePathname(),ar=useLocale()==='ar';
 const admin=path.startsWith('/admin/'),student=path.startsWith('/dashboard/');
 if(!admin&&!student||/^\/dashboard\/problems\/[^/]+$/.test(path))return null;
 const root=admin?'/admin':'/dashboard';
 const items=admin?ADMIN_NAV_ITEMS.map(x=>({href:x.href,label:ar?x.labelAr:x.labelEn})):STUDENT_NAV_ITEMS.map(x=>({href:x.href,label:ar?x.ar:x.en}));
 const selected=items.filter(x=>x.href!==root&&(path===x.href||path.startsWith(x.href+'/'))).sort((a,b)=>b.href.length-a.href.length)[0];
 if(!selected)return null;
 const trail:BreadcrumbItem[]=[{label:ar?'الرئيسية':'Home',href:root},{label:selected.label,...(path!==selected.href?{href:selected.href}:{})}];
 if(path!==selected.href)trail.push({label:ar?'التفاصيل':'Details'});
 return <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6"><Breadcrumbs items={trail}/></div>;
}
