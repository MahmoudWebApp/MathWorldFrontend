'use client';
import {createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'framer-motion';
import {CheckCircle2,AlertCircle,X} from 'lucide-react';
import {useLocale} from 'next-intl';

type ToastKind='success'|'error';
type Toast={id:number;message:string;kind:ToastKind};
const ToastContext=createContext<(message:string,kind?:ToastKind)=>void>(()=>{});
export const useToast=()=>useContext(ToastContext);
export function ToastProvider({children}:{children:ReactNode}){
  const ar=useLocale()==='ar';
  const reduced=useReducedMotion();
  const [items,setItems]=useState<Toast[]>([]);
  const next=useRef(0);
  const timers=useRef(new Map<number,ReturnType<typeof setTimeout>>());
  const dismiss=useCallback((id:number)=>{
    const timer=timers.current.get(id);
    if(timer)clearTimeout(timer);
    timers.current.delete(id);
    setItems(list=>list.filter(t=>t.id!==id));
  },[]);
  const notify=useCallback((message:string,kind:ToastKind='success')=>{
    if(!message.trim())return;
    const id=++next.current;
    setItems(list=>[...list.slice(-2),{id,message,kind}]);
    timers.current.set(id,setTimeout(()=>dismiss(id),kind==='error'?9000:5500));
  },[dismiss]);
  useEffect(()=>()=>{timers.current.forEach(clearTimeout);timers.current.clear()},[]);
  return <ToastContext.Provider value={notify}>{children}
    <div className="pointer-events-none fixed bottom-4 end-4 z-[10000] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
      <AnimatePresence initial={false}>
        {items.map(t=><motion.div key={t.id} layout={!reduced} initial={reduced?false:{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduced?0:8}} transition={{duration:reduced?0:.18}}
          className="pointer-events-auto flex items-start gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-xl"
          role={t.kind==='error'?'alert':'status'}>
          {t.kind==='error'?<AlertCircle className="h-5 w-5 shrink-0 text-destructive"/>:<CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"/>}
          <p className="min-w-0 flex-1 break-words text-sm">{t.message}</p>
          <button type="button" onClick={()=>dismiss(t.id)} aria-label={ar?'إغلاق التنبيه':'Dismiss notification'} className="rounded-md p-1 hover:bg-muted"><X className="h-4 w-4"/></button>
        </motion.div>)}
      </AnimatePresence>
    </div>
  </ToastContext.Provider>;
}
