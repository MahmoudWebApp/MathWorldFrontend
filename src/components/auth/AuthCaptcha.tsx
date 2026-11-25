'use client';

import {useEffect, useRef, useState} from 'react';
import Script from 'next/script';

export const captchaSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || '';
export type CaptchaAction = 'login'|'register'|'forgot-password'|'reset-password';
type Turnstile = {
  render: (element: HTMLElement, options: Record<string,unknown>)=>string;
  remove: (id:string)=>void;
};

export function useAuthCaptcha(){
  const [token,setToken]=useState('');
  const [revision,setRevision]=useState(0);
  return {token, revision, setToken, ready:!captchaSiteKey || !!token,
    reset:()=>{setToken('');setRevision(n=>n+1);}};
}

export function AuthCaptcha({action,locale,onToken,revision}:{action:CaptchaAction;locale:string;onToken:(token:string)=>void;revision:number}){
  const container=useRef<HTMLDivElement>(null);
  const [loaded,setLoaded]=useState(false);
  const [failed,setFailed]=useState(false);
  const [retry,setRetry]=useState(0);
  useEffect(()=>{
    if(!captchaSiteKey||!loaded||!container.current)return;
    const api=(window as Window & {turnstile?:Turnstile}).turnstile;
    if(!api){setFailed(true);return;}
    let active=true;let id:string|undefined;
    setFailed(false);onToken('');
    const clear=()=>{if(active)onToken('');};
    try {
      id=api.render(container.current,{sitekey:captchaSiteKey,action,language:locale==='ar'?'ar':'en',size:'flexible',theme:'auto',
        callback:(value:string)=>{if(active){setFailed(false);onToken(value);}},
        'expired-callback':clear,'timeout-callback':clear,
        'error-callback':()=>{if(active){clear();setFailed(true);}},
        'unsupported-callback':()=>{if(active){clear();setFailed(true);}},
      });
    }catch{setFailed(true);}
    return ()=>{active=false;if(id!==undefined)api.remove(id);};
  },[loaded,action,locale,onToken,revision,retry]);
  if(!captchaSiteKey)return null;
  return <div className="space-y-2">
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive"
      onReady={()=>setLoaded(true)} onError={()=>{onToken('');setFailed(true);}}/>
    <div ref={container} aria-label={locale==='ar'?'التحقق من المستخدم':'Human verification'}/>
    {failed&&<p role="alert" className="text-sm text-destructive">{locale==='ar'?'تعذّر التحقق.':'Verification unavailable.'}{' '}
      <button type="button" className="underline" onClick={()=>{if(loaded)setRetry(n=>n+1);else window.location.reload();}}>{locale==='ar'?'إعادة المحاولة':'Retry'}</button></p>}
  </div>;
}
