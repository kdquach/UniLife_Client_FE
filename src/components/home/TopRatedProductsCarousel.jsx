import { memo, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '@/components/ProductCard.jsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const getItemsPerView = (width) => {
  if (width < 640) return 1;
  if (width < 1024) return 2;
  if (width < 1280) return 3;
  return 4;
};

function TopRatedProductsCarousel({ products = [] }) {
  const [itemsPerView, setItemsPerView] = useState(() => getItemsPerView(window.innerWidth));
  const [startIndex, setStartIndex] = useState(0);

  const safeItems = useMemo(() => (Array.isArray(products) ? products.slice(0, 8) : []), [products]);
  const maxStart = Math.max(0, safeItems.length - itemsPerView);

  useEffect(() => {
    const onResize = () => setItemsPerView(getItemsPerView(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (safeItems.length === 0) return null;

  const clampedStart = Math.min(startIndex, maxStart);

  return (
    <section className="mx-auto max-w-[1240px] bg-transparent">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-text sm:text-2xl">Món được yêu thích nhất</h2>
          <p className="text-xs text-gray-500 sm:text-sm">Top món phổ biến được sinh viên đặt nhiều hôm nay</p>
        </div>
        <Link
          to="/favorite"
          className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-text transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/35 sm:text-sm"
        >
          Xem danh sách yêu thích
        </Link>
      </div>

      <div className="relative mt-8 overflow-hidden">

        <button
          type="button"
          onClick={() => setStartIndex((prev) => Math.max(0, prev - 1))}
          disabled={clampedStart === 0}
          className="absolute left-1 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-gray-200 bg-white text-text transition-all duration-300 hover:scale-105 hover:bg-orange-50 hover:text-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/35 disabled:cursor-not-allowed disabled:opacity-45"
          aria-label="Xem món trước"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          type="button"
          onClick={() => setStartIndex((prev) => Math.min(maxStart, prev + 1))}
          disabled={clampedStart >= maxStart}
          className="absolute right-1 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-gray-200 bg-white text-text transition-all duration-300 hover:scale-105 hover:bg-orange-50 hover:text-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/35 disabled:cursor-not-allowed disabled:opacity-45"
          aria-label="Xem món kế tiếp"
        >
          <ChevronRight size={18} />
        </button>

        <div
          className="flex gap-8 px-1 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            transform: `translateX(-${(clampedStart * 100) / itemsPerView}%)`,
          }}
        >
          {safeItems.map((item) => (
            <div
              key={item.id}
              className="shrink-0 pb-1"
              style={{
                width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 32 / itemsPerView}px)`,
              }}
            >
              <ProductCard
                productId={item.id}
                image={item.image}
                name={item.name}
                description={item.description}
                price={item.price}
                inCart={item.inCart}
                wishlisted={item.wishlisted}
                onToggleWishlist={item.onToggleWishlist}
                onAddToCart={item.onAddToCart}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(TopRatedProductsCarousel);
