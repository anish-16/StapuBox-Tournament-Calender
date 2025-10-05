export function TournamentCardSkeleton() {
  return (
    <div className="rounded-3xl bg-surface shadow-card p-5">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-2xl bg-neutral-100 animate-pulse" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-2/3 rounded-full bg-neutral-100 animate-pulse" />
          <div className="h-3 w-1/3 rounded-full bg-neutral-100 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-32 rounded-full bg-neutral-100 animate-pulse" />
            <div className="h-8 w-20 rounded-full bg-neutral-100 animate-pulse" />
          </div>
        </div>
        <div className="h-10 w-10 rounded-full bg-neutral-100 animate-pulse" />
      </div>
      <div className="mt-5 h-24 rounded-2xl bg-neutral-100 animate-pulse" />
    </div>
  );
}

export function TournamentFilterSkeleton() {
  return (
    <div className="mx-auto w-full max-w-xl sm:mx-0">
      <div className="h-4 w-32 rounded-full bg-neutral-100 animate-pulse" />
      <div className="mt-3 h-14 rounded-2xl bg-neutral-100 animate-pulse" />
    </div>
  );
}
