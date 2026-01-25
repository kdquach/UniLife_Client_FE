import MaterialIcon from '@/components/MaterialIcon.jsx';

export default function RatingStars({ rating = 0, size = 'md' }) {
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
        let starType = 'star_outline';
        if (star <= fullStars) {
          starType = 'star';
        } else if (star === fullStars + 1 && hasHalfStar) {
          starType = 'star_half';
        }

        return (
          <MaterialIcon
            key={star}
            name={starType}
            className={`${sizeClasses[size]} text-orange-500 transition`}
          />
        );
      })}
      {rating > 0 && (
        <span className="ml-1 font-semibold text-text">{ratingValue}</span>
      )}
    </div>
  );
}
