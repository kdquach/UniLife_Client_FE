import { memo } from 'react';

function CarouselSkeleton({ title = 'Đang tải dữ liệu...' }) {
  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
        <div className="flex gap-2">
          <span className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
          <span className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
      <p className="text-sm text-muted">{title}</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="overflow-hidden rounded-card bg-surface p-3 shadow-card">
            <div className="aspect-square animate-pulse rounded-card bg-slate-200" />
            <div className="mt-3 space-y-2">
              <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
              <div className="h-6 w-1/2 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="mt-4 h-11 w-full animate-pulse rounded-xl bg-slate-200" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default memo(CarouselSkeleton);
