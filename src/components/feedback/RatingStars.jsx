import MaterialIcon from '@/components/MaterialIcon.jsx';

export default function RatingStars({ rating = 0, size = 'md', showValue = true }) {
  const sizeClasses = {
    sm: 'text-[16px]',
    md: 'text-[20px]',
    lg: 'text-[28px]',
  };

  const ratingValue = Math.min(5, Math.max(0, parseFloat(rating)));
  const fullStars = Math.floor(ratingValue);
  const hasHalfStar = ratingValue % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFull = star <= fullStars;
        const isHalf = star === fullStars + 1 && hasHalfStar;
        const iconName = isHalf ? 'star_half' : 'star';
        const iconClass = isFull
          ? 'text-warning'
          : isHalf
          ? 'text-warning'
          : 'text-warning/25';

        return (
          <MaterialIcon
            key={star}
            name={iconName}
            filled
            className={`${sizeClasses[size]} ${iconClass} transition`}
          />
        );
      })}
      {showValue && rating > 0 && (
        <span className="ml-1 font-semibold text-text">{ratingValue}</span>
      )}
    </div>
  );
}
