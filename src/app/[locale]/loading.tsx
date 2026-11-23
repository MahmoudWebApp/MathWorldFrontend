import { MathWorldLoading } from '@/components/ui/MathWorldLoading';

/** Consistent branded route fallback; actual data remains API-owned. */
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6">
      <MathWorldLoading skeleton />
      <div aria-hidden="true" className="grid animate-pulse gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-52 rounded-3xl border border-border/60 bg-card/65" />
        <div className="h-52 rounded-3xl border border-border/60 bg-card/65" />
      </div>
    </main>
  );
}
