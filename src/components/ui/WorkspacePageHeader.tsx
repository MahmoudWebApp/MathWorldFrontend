import type {ReactNode} from 'react';
import type {LucideIcon} from 'lucide-react';
export function WorkspacePageHeader({title,icon:Icon,count,actions}:{title:string;icon?:LucideIcon;count?:ReactNode;actions?:ReactNode}){
 return <header className="mw-workspace-heading mb-5 flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
 <div className="flex min-w-0 flex-1 items-center gap-3">
 {Icon&&<span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" aria-hidden="true"/></span>}
 <h1 className="text-gradient-math min-w-0 break-words text-2xl font-extrabold sm:text-3xl">{title}</h1>
 </div>
 {(count!==undefined||actions)&&<div className="flex max-w-full flex-wrap items-center gap-2">{count!==undefined&&<strong className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-bold tabular-nums text-primary">{count}</strong>}{actions}</div>}
 </header>;
}
