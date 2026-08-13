export default function Loading() {
  return (
    <div className="flex min-h-[45vh] items-center justify-center" role="status" aria-live="polite">
      <div className="flex items-center gap-3 rounded-full border border-brand-primary/15 bg-card/80 px-5 py-3 shadow-sm backdrop-blur-xl">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand-primary" />
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand-secondary [animation-delay:180ms]" />
        <span className="text-sm font-semibold text-muted-foreground">MathWorld</span>
      </div>
    </div>
  );
}
