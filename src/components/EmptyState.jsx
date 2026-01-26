import clsx from 'clsx';
import Empty from '@/assets/images/emptyState.png';

export default function EmptyState({
  title = 'No data',
  description = 'Try adjusting filters or adding items.',
  illustration = Empty,   // image mặc định
  action,                 // optional CTA
  variant = 'empty',      // empty | loading | error
}) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center py-16 text-center',
        variant === 'error' ? 'text-red-600' : 'text-muted'
      )}
    >
      {/* IMAGE */}
      {illustration && (
        <img
          src={illustration}
          alt=""
          className={clsx(
            'mb-5 select-none',
            variant === 'loading' ? 'w-70 opacity-70 animate-pulse' : 'w-100 opacity-90'
          )}
        />
      )}

      {/* TEXT */}
      <h3 className="text-lg font-semibold text-text">
        {title}
      </h3>

      <p className="mt-1 max-w-xs text-sm">
        {description}
      </p>

      {/* ACTION */}
      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
}
