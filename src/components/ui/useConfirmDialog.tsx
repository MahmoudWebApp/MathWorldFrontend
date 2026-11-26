'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {useLocale} from 'next-intl';
import {AlertTriangle} from 'lucide-react';
import {Button} from './Button';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogFooter} from './Dialog';

export function useConfirmDialog(){
 const ar=useLocale()==='ar';
 const [message,setMessage]=useState<string|null>(null);
 const pending=useRef<((result:boolean)=>void)|null>(null);
 const finish=useCallback((answer:boolean)=>{const resolve=pending.current;pending.current=null;setMessage(null);resolve?.(answer)},[]);
 useEffect(()=>()=>{pending.current?.(false);pending.current=null},[]);
 const ask=useCallback((text:string)=>new Promise<boolean>(resolve=>{
   if(pending.current){resolve(false);return;}
   pending.current=resolve;setMessage(text);
 }),[]);
 const dialog=<Dialog open={message!==null} onOpenChange={open=>{if(!open)finish(false)}}>
   <DialogContent className="max-w-lg"><DialogHeader className="pe-8">
     <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 shrink-0 text-amber-500"/>{ar?'تأكيد العملية':'Confirm action'}</DialogTitle>
     <DialogDescription className="whitespace-pre-line break-words">{message}</DialogDescription>
   </DialogHeader><DialogFooter>
     <Button variant="outline" onClick={()=>finish(false)}>{ar?'إلغاء':'Cancel'}</Button>
     <Button onClick={()=>finish(true)}>{ar?'تأكيد':'Confirm'}</Button>
   </DialogFooter></DialogContent>
 </Dialog>;
 return {ask,dialog};
}
