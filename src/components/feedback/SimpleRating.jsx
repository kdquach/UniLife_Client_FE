import MaterialIcon from '@/components/MaterialIcon.jsx';

export default function SimpleRating({ rating = 0, size = 'md' }) {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  const iconSizeClasses = {
    sm: 'text-[12px]',
    md: 'text-[16px]',
    lg: 'text-[20px]',
    xl: 'text-[24px]',
  };

  const ratingValue = Math.min(5, Math.max(0, parseFloat(rating)));
  const displayValue =
    ratingValue === Math.floor(ratingValue)
      ? ratingValue.toFixed(0)
      : ratingValue.toFixed(1);

  return (
    <div
      className={`${sizeClasses[size]} font-semibold text-warning flex items-center gap-1.5`}
    >
      <span className="font-bold">{displayValue}</span>
      <MaterialIcon
        name="star"
        filled
        className={`${iconSizeClasses[size]} text-warning`}
      />
    </div>
  );
}
