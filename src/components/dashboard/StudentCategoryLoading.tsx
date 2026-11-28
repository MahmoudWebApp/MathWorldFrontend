export function StudentCategorySkeleton({ar}:{ar:boolean}){
 return <div role="status" aria-busy="true" aria-label={ar?'جارٍ تحميل الفئات':'Loading topics'} className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
  {Array.from({length:6},(_,i)=><div key={i} aria-hidden="true" className="flex min-h-52 flex-col gap-3 rounded-2xl border border-border/70 bg-card p-5 motion-safe:animate-pulse">
   <div className="flex items-center gap-3"><div className="h-12 w-12 shrink-0 rounded-xl bg-muted"/><div className="h-5 w-2/3 rounded bg-muted"/></div>
   <div className="h-4 w-full rounded bg-muted"/><div className="h-4 w-3/4 rounded bg-muted"/>
   <div className="mt-auto h-2 w-full rounded-full bg-muted"/><div className="flex gap-2 border-t border-border/60 pt-3"><div className="h-10 flex-1 rounded-xl bg-muted"/><div className="h-10 flex-1 rounded-xl bg-muted"/></div>
  </div>)}
 </div>;
}
export function StudentCategoryLoading({ar}:{ar:boolean}){
 return <main className="mx-auto min-h-[65vh] w-full max-w-7xl space-y-6 p-4 sm:p-6"><h1 className="text-3xl font-extrabold">{ar?'الفئات':'Topics'}</h1><StudentCategorySkeleton ar={ar}/></main>;
}
