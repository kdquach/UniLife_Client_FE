import clsx from 'clsx';
import { useMemo, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Select } from 'antd';
import { useCartStore } from '@/store/cart.store.js';
import { useRightPanel } from '@/store/rightPanel.store.js';
import { useProduct } from '@/hooks/useProduct.js';
import { useCampusStore } from '@/store/useCampusStore';
import { useWishlist } from '@/hooks/useWishlist.js';
import ProductCard from '@/components/ProductCard.jsx';
import Loader from '@/components/Loader.jsx';
import EmptyState from '@/components/EmptyState.jsx';
import ResetLink from '../../components/menu/ResetLink';

function Chip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200',
        active
          ? 'bg-primary text-inverse shadow-lift'
          : 'bg-white/80 text-muted shadow-card hover:bg-white hover:shadow-lift'
      )}
    >
      {children}
    </button>
  );
}

function useHorizontalOverflow(ref) {
  const [overflow, setOverflow] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      setOverflow(el.scrollWidth > el.clientWidth);
    };

    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return overflow;
}

export default function MenuPage() {
  const cart = useCartStore();
  const panel = useRightPanel();
  const categoryRef = useRef(null);
  const isOverflow = useHorizontalOverflow(categoryRef);

  const { products, loading, error, fetchByCanteen, fetchAll } = useProduct();
  const { selectedCanteen } = useCampusStore();

  const [activeCategory, setActiveCategory] = useState('All');
  const [sortOption, setSortOption] = useState('');
  const isDefaultFilter = activeCategory === 'All' && !sortOption;
  const [searchParams] = useSearchParams();
  const { ids: wishlistIds, fetch: fetchWishlist, toggle: toggleWishlist } = useWishlist();

  useEffect(() => {
    const params = {
      limit: 100,
      status: 'available',
    };

    // Search
    const search = searchParams.get('search');
    if (search && search.trim()) {
      params.search = search.trim();
    }

    // Category
    if (activeCategory !== 'All') {
      params.category = activeCategory;
    }

    // Sort
    if (sortOption) {
      const map = {
        'name-asc': 'name',
        'name-desc': '-name',
        'price-asc': 'price',
        'price-desc': '-price',
      };
      params.sort = map[sortOption];
    }

    if (selectedCanteen?.id) {
      fetchByCanteen(selectedCanteen.id, { limit: 100, status: 'available' });
      cart.clearCart(); // Clear cart if canteen changes
    } else {
      fetchAll(params);
    }

    cart.clear();
    // eslint-disable-next-line
  }, [selectedCanteen?.id, activeCategory, sortOption, searchParams]);

  // Fetch wishlist on mount (requires authenticated user)
  useEffect(() => {
    fetchWishlist().catch((err) => {
      console.warn('Wishlist not loaded:', err?.message || err);
    });
  }, [fetchWishlist]);

  // Extract unique categories from products
  const categories = useMemo(() => {
    const cats = new Set(
      products.map((p) => p.categoryId?.name).filter(Boolean)
    );
    return ['All', ...Array.from(cats).sort()];
  }, [products]);
  const items = products;

  return (
    <div className="grid gap-6">
      <section className="grid min-w-0 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">Menu</h1>
          <p className="text-sm text-muted">
            Choose from our delicious selection
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            <p className="font-medium">Failed to load menu</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => fetchAll({ limit: 100, status: 'available' })}
              className="mt-3 rounded bg-red-700 px-4 py-2 text-white hover:bg-red-800"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* Bộ lọc và sort */}
            {/* FILTER BAR */}
            <div className="flex w-full items-center justify-between gap-4 flex-wrap">
              {/* LEFT: CATEGORY */}
              <div className="relative min-w-0 flex-1">
                {isOverflow && (
                  <button
                    onClick={() =>
                      categoryRef.current?.scrollBy({ left: -200, behavior: 'smooth' })
                    }
                    className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white shadow-card p-1 transition hover:shadow-lift"
                  >
                    ‹
                  </button>
                )}

                <div
                  ref={categoryRef}
                  className="flex gap-2 overflow-x-auto scrollbar-hide"
                >
                  {categories.map((c) => (
                    <Chip
                      key={c}
                      active={activeCategory === c}
                      onClick={() => setActiveCategory(c)}
                    >
                      {c}
                    </Chip>
                  ))}
                </div>

                {isOverflow && (
                  <button
                    onClick={() =>
                      categoryRef.current?.scrollBy({ left: 200, behavior: 'smooth' })
                    }
                    className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white shadow-card p-1 transition hover:shadow-lift"
                  >
                    ›
                  </button>
                )}
              </div>

              {/* RIGHT: RESET + SORT */}
              <div className="flex items-center gap-3 shrink-0">
                <ResetLink
                  disabled={isDefaultFilter}
                  onClick={() => {
                    setActiveCategory('All');
                    setSortOption('');
                  }}
                />

                <Select
                  value={sortOption || ''}
                  onChange={(v) => setSortOption(v)}
                  size="middle"
                  className="min-w-40"
                  options={[
                    { value: '', label: 'Mặc định' },
                    { value: 'name-asc', label: 'Tên A → Z' },
                    { value: 'name-desc', label: 'Tên Z → A' },
                    { value: 'price-desc', label: 'Giá cao → thấp' },
                    { value: 'price-asc', label: 'Giá thấp → cao' },
                  ]}
                />
              </div>
            </div>

            {items.length === 0 ? (
              <EmptyState
                title="No items available"
                description="No products found for the selected category"
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {items.map((it) => (
                  <ProductCard
                    key={it._id}
                    productId={it._id}
                    image={it.image}
                    name={it.name}
                    description={it.description}
                    price={it.price}
                    inCart={cart.lines?.some((l) => l.itemId === it._id)}
                    wishlisted={wishlistIds.has(it._id)}
                    onToggleWishlist={() => {
                      toggleWishlist(it._id).catch((err) => {
                        console.error('Toggle wishlist failed:', err);
                      });
                    }}
                    onAddToCart={() => {
                      cart.addItem(it._id, 1);
                      panel.openCart();
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div >
  );
}
