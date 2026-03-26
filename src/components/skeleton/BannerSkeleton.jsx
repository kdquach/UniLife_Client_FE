import { memo } from 'react';

function BannerSkeleton() {
  return (
    <section className="relative overflow-hidden rounded-surface bg-surface p-4 shadow-surface">
      <div className="h-65 w-full animate-pulse rounded-card bg-slate-200 md:h-80" />
      <div className="absolute left-10 top-10 w-[60%] space-y-3">
        <div className="h-8 w-[75%] rounded-lg bg-white/60" />
        <div className="h-4 w-[90%] rounded bg-white/50" />
        <div className="h-4 w-[72%] rounded bg-white/50" />
        <div className="mt-4 h-11 w-36 rounded-xl bg-white/70" />
      </div>
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {Array.from({ length: 3 }).map((_, idx) => (
          <span key={idx} className="h-2.5 w-2.5 rounded-full bg-white/70" />
        ))}
      </div>
    </section>
  );
}

export default memo(BannerSkeleton);
