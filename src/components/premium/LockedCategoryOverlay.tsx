'use client';
import {LockKeyhole} from 'lucide-react';
import {useLocale} from 'next-intl';
import {LockedPremiumDialog} from './LockedPremiumDialog';

export function LockedCategoryOverlay({name,accent}:{name:string;accent?:string}){
 // Choose a legible foreground for the stage accent in both themes.
 const rgb=accent?.match(/^#([0-9a-f]{6})$/i)?.[1];
 const luminance=rgb ? [0,2,4].map(i=>parseInt(rgb.slice(i,i+2),16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[0.2126,0.7152,0.0722][i],0):0;
 const foreground=luminance>0.179?'#000000':'#ffffff';
 const ar=useLocale()==='ar';
 return <div data-category-locked="true" className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 overflow-hidden rounded-[inherit] bg-background/65 px-2 py-3 text-center dark:bg-background/70">
   <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card text-primary shadow-sm" style={accent?{color:accent,borderColor:accent}:undefined}><LockKeyhole size={22} aria-hidden="true"/></span>
   <span className="rounded-md bg-card/90 px-2 py-1 text-xs font-extrabold text-foreground">{ar?'فئة مقفلة':'Locked topic'}</span>
   <LockedPremiumDialog topicName={name}><button type="button" aria-label={ar?'ترقية الحساب لفتح '+name:'Upgrade account to unlock '+name} className="inline-flex min-h-11 max-w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:text-sm" style={accent?{backgroundColor:accent,color:foreground,outlineColor:accent}:undefined}><LockKeyhole size={15} className="shrink-0" aria-hidden="true"/><span>{ar?'ترقية الحساب':'Upgrade account'}</span></button></LockedPremiumDialog>
 </div>;
}
