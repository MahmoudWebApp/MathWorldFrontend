import type {ReactNode} from 'react';
import type {LucideIcon} from 'lucide-react';
export function WorkspacePageHeader({title,icon:Icon,count}:{title:string;icon:LucideIcon;count?:ReactNode}){
 return <header className="mb-5 flex min-w-0 items-center justify-between gap-3 border-b border-border/60 pb-4">
 <h1 className="text-gradient-math min-w-0 break-words text-2xl font-extrabold sm:text-3xl">{title}</h1>
 <div className="flex shrink-0 items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 text-primary">{count!==undefined&&<strong className="text-lg font-bold tabular-nums">{count}</strong>}<Icon className="h-6 w-6" aria-hidden="true"/></div>
 </header>;
}
