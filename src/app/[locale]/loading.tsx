/** Route-level skeleton shared by public pages and both student/admin workspaces.
 * Client-side RTK Query loading states still render their own content skeletons.
 */
export default function Loading() {
  return (
    <main role="status" aria-live="polite" aria-busy="true" aria-label="MathWorld loading"
      className="mx-auto w-full max-w-7xl animate-pulse space-y-5 px-4 py-6 sm:px-6">
      <div className="space-y-2">
        <div className="h-8 w-52 rounded-xl bg-muted/80" />
        <div className="h-4 w-80 max-w-full rounded-lg bg-muted/60" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-28 rounded-2xl border border-border/50 bg-card/70 p-4">
            <div className="h-4 w-3/5 rounded bg-muted/70" />
            <div className="mt-5 h-8 w-1/3 rounded bg-muted/70" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-72 rounded-3xl border border-border/60 bg-card/65" />
        <div className="h-72 rounded-3xl border border-border/60 bg-card/65" />
      </div>
    </main>
  );
}
