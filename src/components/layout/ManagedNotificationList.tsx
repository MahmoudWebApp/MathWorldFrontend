'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { CheckCheck, Trash2, RefreshCw } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { MathWorldLoading } from '@/components/ui/MathWorldLoading';
import { useLazyGetManagedInboxQuery, useDeleteNoticeSelectionMutation, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation, type InboxNotification, type ManagedInbox } from '@/store/api/notificationsApi';

export function ManagedNotificationList({onNavigate}:{onNavigate?:()=>void}) {
  const owner=useSelector((state:RootState)=>state.auth.user?.Id);
  return owner ? <Inbox key={owner} onNavigate={onNavigate}/> : null;
}
function Inbox({onNavigate}:{onNavigate?:()=>void}) {
  const locale=useLocale(), ar=locale==='ar';
  const [fetchPage]=useLazyGetManagedInboxQuery();
  const [deleteSelection]=useDeleteNoticeSelectionMutation();
  const [markRead]=useMarkNotificationReadMutation();
  const [markAll]=useMarkAllNotificationsReadMutation();
  const [items,setItems]=useState<InboxNotification[]>([]);
  const [page,setPage]=useState<ManagedInbox|null>(null);
  const [selected,setSelected]=useState<Set<number>>(new Set());
  const [all,setAll]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const lock=useRef(false);
  const active=useRef(true);
  const scroll=useRef<HTMLDivElement>(null);
  const reset=useCallback(async()=>{
    setError('');
    const next=await fetchPage({},false).unwrap();
    if(!active.current)return;
    setPage(next);setItems(next.Items);setAll(false);setSelected(new Set());
    scroll.current?.scrollTo({top:0});
  },[fetchPage]);
  useEffect(()=>{
    active.current=true;
    let cancelled=false;
    setBusy(true);lock.current=true;
    const req=fetchPage({},false);
    void req.unwrap().then(next=>{
      if(!cancelled){setPage(next);setItems(next.Items);}
    }).catch(()=>{if(!cancelled)setError(ar?'تعذّر تحميل الإشعارات.':'Could not load notifications.');})
      .finally(()=>{if(!cancelled){lock.current=false;setBusy(false);}});
    return ()=>{cancelled=true;active.current=false;req.abort();};
  },[fetchPage,ar]);
  async function run(action:()=>Promise<void>) {
    if(lock.current)return;
    lock.current=true;setBusy(true);setError('');
    try {await action();} catch {
      if(active.current)setError(ar?'تعذّر إكمال الطلب. حاول مجدداً.':'Request failed. Please retry.');
    } finally {lock.current=false;if(active.current)setBusy(false);}
  }
  const more=()=>void run(async()=>{
    const last=items[items.length-1];
    if(!page?.HasMore||!last)return;
    const next=await fetchPage({snapshotId:page.SnapshotId,beforeId:last.Id,beforeCreatedAt:last.CreatedAtUtc},false).unwrap();
    if(!active.current)return;
    setPage(next);setItems(old=>[...old,...next.Items.filter(n=>!old.some(o=>o.Id===n.Id))]);
  });
  const count=all?(page?.TotalCount??0):selected.size;
  function toggle(id:number){
    setSelected(old=>{const next=new Set(old);if(next.has(id))next.delete(id);else next.add(id);return next;});
  }
  const remove=()=>void run(async()=>{
    if(!page||!count)return;
    if(!window.confirm(ar?'حذف الإشعارات المحددة نهائياً؟':'Permanently delete the selected notifications?'))return;
    await deleteSelection({All:all,SnapshotId:page.SnapshotId,Ids:all?[]:[...selected]}).unwrap();
    if(!active.current)return;
    setItems([]);setPage(null);setAll(false);setSelected(new Set());
    await reset();
  });
  const read=(item:InboxNotification)=>void run(async()=>{
    if(!item.ReadAtUtc){
      await markRead(item.Id).unwrap();
      if(!active.current)return;
      setItems(old=>old.map(n=>n.Id===item.Id?{...n,ReadAtUtc:new Date().toISOString()}:n));
    }
    if(!active.current)return;
    const path=item.TargetPath;
    if(path&&path.startsWith('/')&&!path.startsWith('//')&&!path.includes('://')&&!/[?#%\\\x00-\x1f]/.test(path)){
      onNavigate?.();window.location.assign('/'+locale+path);
    }
  });
  return <section className="min-w-0 space-y-2" aria-label={ar?'قائمة الإشعارات':'Notification list'}>
    <div className="flex flex-wrap items-center gap-2 border-b p-3 text-sm">
      <label className="flex min-h-10 items-center gap-2 font-semibold"><input type="checkbox" checked={all} disabled={busy||!page?.TotalCount} onChange={e=>{setAll(e.target.checked);setSelected(new Set());}}/>{ar?'تحديد الكل':'Select all'}</label>
      <span className="text-xs text-muted-foreground" aria-live="polite">{count} {ar?'محدد':'selected'}</span>
      <button type="button" disabled={busy||!count} onClick={remove} className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-destructive/30 px-2 text-destructive disabled:opacity-40"><Trash2 className="h-4 w-4"/>{ar?'حذف':'Delete'}</button>
      <button type="button" disabled={busy||!items.length} onClick={()=>void run(async()=>{await markAll().unwrap();if(active.current)setItems(old=>old.map(n=>({...n,ReadAtUtc:n.ReadAtUtc??new Date().toISOString()})));})} className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-primary disabled:opacity-40"><CheckCheck className="h-4 w-4"/>{ar?'قراءة الكل':'Read all'}</button>
      <button type="button" disabled={busy} onClick={()=>void run(reset)} aria-label={ar?'تحديث':'Refresh'} className="ms-auto rounded-lg p-2 hover:bg-muted"><RefreshCw className="h-4 w-4"/></button>
    </div>
    {error&&<p role="alert" className="px-3 text-sm text-destructive">{error}</p>}
    <div ref={scroll} className="max-h-[min(50dvh,440px)] overflow-y-auto overscroll-contain" onScroll={e=>{const el=e.currentTarget;if(el.scrollHeight-el.scrollTop-el.clientHeight<48&&page?.HasMore&&!busy&&!error)more();}}>
      {items.map(n=><div key={n.Id} className={'flex items-start gap-3 border-b p-3 '+(!n.ReadAtUtc?'bg-primary/5':'')}>
        <input type="checkbox" className="mt-2 shrink-0" aria-label={(ar?'تحديد ':'Select ')+(ar?n.TitleAr:n.TitleEn)} checked={all||selected.has(n.Id)} disabled={busy||all} onChange={()=>toggle(n.Id)}/>
        <button type="button" disabled={busy} className="min-w-0 flex-1 break-words text-start" onClick={()=>read(n)}>
          <span className="block font-semibold">{ar?n.TitleAr:n.TitleEn}{!n.ReadAtUtc&&<span className="ms-2 inline-block h-2 w-2 rounded-full bg-primary"/>}</span>
          <span className="mt-1 block whitespace-pre-wrap text-sm text-muted-foreground">{ar?n.BodyAr:n.BodyEn}</span>
          <time className="mt-1 block text-xs text-muted-foreground" dateTime={n.CreatedAtUtc}>{new Date(n.CreatedAtUtc).toLocaleDateString(locale)}</time>
        </button>
      </div>)}
      {busy&&!items.length?<MathWorldLoading compact/>:page&&!items.length?<p className="p-6 text-center text-sm text-muted-foreground">{ar?'لا توجد إشعارات':'No notifications'}</p>:null}
      {page?.HasMore&&<button type="button" disabled={busy} className="w-full p-3 text-sm font-semibold text-primary disabled:opacity-50" onClick={more}>{busy?(ar?'جارٍ التحميل…':'Loading…'):(ar?'عرض المزيد':'Load more')}</button>}
    </div>
  </section>;
}
