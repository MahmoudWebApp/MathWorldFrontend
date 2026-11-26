'use client';
import {useLocale} from 'next-intl';
import {DirectionalArrow} from './DirectionalNavigation';
export function Pagination({page,pageSize,total,onPageChange,disabled=false}:{page:number;pageSize:number;total:number;onPageChange:(p:number)=>void;disabled?:boolean}){
  const ar=useLocale()==='ar';const last=Math.max(1,Math.ceil(total/pageSize));
  const pages=Array.from(new Set([1,...[page-1,page,page+1].filter(p=>p>1&&p<last),last])).sort((a,b)=>a-b);
  const base='inline-flex min-h-9 min-w-9 items-center justify-center gap-1 rounded-lg border px-2 text-sm font-semibold hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed';
  return <nav aria-label={ar?'ترقيم الصفحات':'Pagination'} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/80 p-3">
    <span className="text-xs tabular-nums text-muted-foreground">{ar?'عرض':'Showing'} {total===0?0:Math.min((page-1)*pageSize+1,total)}–{Math.min(page*pageSize,total)} {ar?'من أصل':'of'} {total}</span>
    <div className="flex flex-wrap items-center gap-1">
      <button type="button" className={base} disabled={disabled||page<=1} onClick={()=>onPageChange(page-1)}><DirectionalArrow direction="back" className="h-4 w-4"/>{ar?'السابق':'Previous'}</button>
      {pages.map((n,i)=><span key={n} className="inline-flex items-center gap-1">{i>0&&n>pages[i-1]+1&&<span className="px-1">…</span>}<button type="button" className={base+(n===page?' bg-primary text-primary-foreground hover:bg-primary':'')} aria-current={n===page?'page':undefined} aria-label={(ar?'صفحة ':'Page ')+n} disabled={disabled} onClick={()=>{if(n!==page)onPageChange(n)}}>{n}</button></span>)}
      <button type="button" className={base} disabled={disabled||page>=last} onClick={()=>onPageChange(page+1)}>{ar?'التالي':'Next'}<DirectionalArrow direction="forward" className="h-4 w-4"/></button>
    </div>
  </nav>;
}
