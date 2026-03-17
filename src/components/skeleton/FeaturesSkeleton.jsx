import { memo } from 'react';

function FeaturesSkeleton() {
  return (
    <section className="rounded-surface bg-surface p-6 shadow-surface md:p-7">
      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-3 xl:col-span-5">
          <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-[90%] animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-[82%] animate-pulse rounded bg-slate-100" />
          <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-200" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:col-span-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="rounded-card border border-border/70 bg-surface p-4 shadow-card">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />
              <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-3 w-full animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>

        <div className="xl:col-span-3">
          <div className="aspect-4/5 h-full min-h-70 animate-pulse rounded-card bg-slate-200" />
        </div>
      </div>
    </section>
  );
}

export default memo(FeaturesSkeleton);
