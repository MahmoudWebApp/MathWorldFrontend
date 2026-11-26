'use client';
import {useState} from 'react';
import {useLocale} from 'next-intl';
import {AlertTriangle} from 'lucide-react';
import {Button} from './Button';
import {Dialog,DialogTrigger,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogFooter} from './Dialog';
import {useToast} from './Toast';

// Retain the former public props so all existing call sites share the new modal.
interface PopoverConfirmProps {
 onConfirm:()=>void|Promise<void>;onCancel?:()=>void;title?:string;description?:string;
 confirmText?:string;cancelText?:string;isLoading?:boolean;trigger:React.ReactNode;
 align?:'start'|'center'|'end';side?:'top'|'right'|'bottom'|'left';
}
export function PopoverConfirm({onConfirm,onCancel,title,description,confirmText,cancelText,isLoading=false,trigger}:PopoverConfirmProps){
 const ar=useLocale()==='ar';
 const notify=useToast();
 const [open,setOpen]=useState(false);
 const [busy,setBusy]=useState(false);
 const loading=busy||isLoading;
 function close(next:boolean){if(loading)return;setOpen(next);if(!next)onCancel?.();}
 async function confirm(){if(loading)return;setBusy(true);try{await onConfirm();setOpen(false)}catch{notify(ar?'تعذّر تنفيذ العملية.':'Action failed.','error')}finally{setBusy(false)}}
 return <Dialog open={open} onOpenChange={close}>
   <DialogTrigger asChild>{trigger}</DialogTrigger>
   <DialogContent className="max-w-lg" onClick={e=>e.stopPropagation()}>
     <DialogHeader className="pe-8">
       <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 shrink-0 text-destructive"/>{title??(ar?'تأكيد الحذف':'Confirm deletion')}</DialogTitle>
       <DialogDescription>{description??(ar?'هل تريد حذف هذا العنصر؟ لا يمكن التراجع.':'Delete this item? This cannot be undone.')}</DialogDescription>
     </DialogHeader>
     <DialogFooter><Button variant="outline" disabled={loading} onClick={()=>close(false)}>{cancelText??(ar?'إلغاء':'Cancel')}</Button><Button variant="destructive" disabled={loading} onClick={()=>void confirm()}>{loading?(ar?'جارٍ التنفيذ…':'Working…'):(confirmText??(ar?'حذف':'Delete'))}</Button></DialogFooter>
   </DialogContent>
 </Dialog>;
}
