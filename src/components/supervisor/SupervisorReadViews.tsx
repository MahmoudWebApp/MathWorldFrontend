'use client';
import {useState} from 'react';
import {useLocale} from 'next-intl';
import {useGetSupervisorStudentsQuery,useGetSupervisorStudentActivityQuery,useGetSupervisorReportsQuery} from '@/store/api/platformBrandApi';
import {MathWorldLoading} from '@/components/ui/MathWorldLoading';
const btn='rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50';
function Pager({page,total,onChange,ar}:{page:number;total:number;onChange:(n:number)=>void;ar:boolean}){
 if(total<=30)return null;
 return <div className="flex items-center gap-3"><button className={btn} disabled={page<=1} onClick={()=>onChange(page-1)}>{ar?'السابق':'Previous'}</button><span>{page} / {Math.ceil(total/30)}</span><button className={btn} disabled={page*30>=total} onClick={()=>onChange(page+1)}>{ar?'التالي':'Next'}</button></div>;
}
function Activity({id}:{id:number}){
 const ar=useLocale()==='ar';const [page,setPage]=useState(1);const q=useGetSupervisorStudentActivityQuery({id,page},{refetchOnMountOrArgChange:true});
 if(q.isError)return <p role="alert">{ar?'لا يمكن عرض السجل.':'Activity is unavailable.'} <button className="underline" onClick={()=>void q.refetch()}>{ar?'إعادة المحاولة':'Retry'}</button></p>;
 if(!q.currentData)return <MathWorldLoading compact/>;
 return <div className="mt-3 space-y-2 rounded-xl border p-3">{q.currentData.Items.length===0&&<p>{ar?'لا توجد أحداث مسجلة':'No recorded events'}</p>}{q.currentData.Items.map(x=><div className="flex flex-wrap justify-between gap-2 border-b py-2 text-sm" key={x.Id}><span>{x.Action} · {x.Resource}</span><time dateTime={x.CreatedAtUtc}>{new Date(x.CreatedAtUtc).toLocaleString(ar?'ar':'en')}</time></div>)}<Pager ar={ar} page={page} total={q.currentData.Total} onChange={setPage}/></div>;
}
export function SupervisorStudents({canViewActivity}:{canViewActivity:boolean}){
 const ar=useLocale()==='ar';const [page,setPage]=useState(1);const [open,setOpen]=useState<number|null>(null);
 const q=useGetSupervisorStudentsQuery(page,{refetchOnMountOrArgChange:true});
 if(q.isError)return <p role="alert">{ar?'تعذّر تحميل الطلاب.':'Students are unavailable.'} <button className="underline" onClick={()=>void q.refetch()}>{ar?'إعادة المحاولة':'Retry'}</button></p>;
 if(!q.currentData)return <MathWorldLoading compact/>;
 return <section className="space-y-3"><h2 className="text-xl font-bold">{ar?'الطلاب':'Students'} ({q.currentData.Total})</h2>{q.currentData.Items.length===0&&<p>{ar?'لا يوجد طلاب':'No students'}</p>}{q.currentData.Items.map(x=><article className="rounded-2xl border bg-card p-4" key={x.Id}><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">{x.FullName}</h3><p dir="ltr" className="break-all text-sm text-muted-foreground">{x.Email}</p><p className="text-sm">{x.IsActive?(ar?'حساب مفعّل':'Active account'):(ar?'حساب معطّل':'Disabled account')}</p></div>{canViewActivity&&<button className={btn} aria-expanded={open===x.Id} onClick={()=>setOpen(v=>v===x.Id?null:x.Id)}>{ar?'سجل النشاط':'Activity'}</button>}</div>{canViewActivity&&open===x.Id&&<Activity key={x.Id} id={x.Id}/>}</article>)}<Pager ar={ar} page={page} total={q.currentData.Total} onChange={n=>{setOpen(null);setPage(n);}}/></section>;
}
export function SupervisorReportsPanel(){
 const ar=useLocale()==='ar';const q=useGetSupervisorReportsQuery(undefined,{refetchOnMountOrArgChange:true});
 if(q.isError)return <p role="alert">{ar?'تعذّر تحميل التقرير.':'Report is unavailable.'} <button className="underline" onClick={()=>void q.refetch()}>{ar?'إعادة المحاولة':'Retry'}</button></p>;
 if(!q.currentData)return <MathWorldLoading compact/>;
 const d=q.currentData;const names=ar?['غير محددة','الابتدائية','الإعدادية','الثانوية','الجامعية']:['Unspecified','Primary','Middle school','Secondary','University'];
 return <section className="space-y-4"><h2 className="text-xl font-bold">{ar?'ملخص الطلاب':'Student overview'}</h2><div className="grid gap-3 sm:grid-cols-2">{[[ar?'الطلاب':'Students',d.Students],[ar?'الحسابات المفعّلة':'Enabled accounts',d.ActiveAccounts]].map(([n,v])=><div key={n} className="rounded-2xl border bg-card p-4"><p>{n}</p><strong className="text-2xl text-primary">{v}</strong></div>)}</div><div className="overflow-x-auto rounded-2xl border bg-card"><table className="w-full text-start text-sm"><thead><tr><th className="p-3 text-start">{ar?'المرحلة':'Stage'}</th><th className="p-3">{ar?'الطلاب':'Students'}</th><th className="p-3">{ar?'محاولات الحل المسجلة':'Recorded problem attempts'}</th></tr></thead><tbody>{d.Stages.map(x=><tr key={x.StageId??0} className="border-t"><td className="p-3">{names[x.StageId??0]??String(x.StageId)}</td><td className="p-3 text-center">{x.Students}</td><td className="p-3 text-center">{d.Attempts.find(a=>a.StageId===x.StageId)?.Attempts??0}</td></tr>)}</tbody></table></div></section>;
}
