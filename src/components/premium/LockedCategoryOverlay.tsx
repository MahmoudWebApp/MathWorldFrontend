'use client';
import {LockKeyhole} from 'lucide-react';
import {useLocale} from 'next-intl';
import {LockedPremiumDialog} from './LockedPremiumDialog';

export function LockedCategoryOverlay({name}:{name:string}){
 const ar=useLocale()==='ar';
 return <div data-category-locked="true" className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 overflow-hidden rounded-[inherit] bg-background/65 px-2 py-3 text-center dark:bg-background/70">
   <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card text-primary shadow-sm"><LockKeyhole size={22} aria-hidden="true"/></span>
   <span className="rounded-md bg-card/90 px-2 py-1 text-xs font-extrabold text-foreground">{ar?'فئة مقفلة':'Locked topic'}</span>
   <LockedPremiumDialog topicName={name}><button type="button" aria-label={ar?'ترقية الحساب لفتح '+name:'Upgrade account to unlock '+name} className="inline-flex min-h-11 max-w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:text-sm"><LockKeyhole size={15} className="shrink-0" aria-hidden="true"/><span>{ar?'ترقية الحساب':'Upgrade account'}</span></button></LockedPremiumDialog>
 </div>;
}
