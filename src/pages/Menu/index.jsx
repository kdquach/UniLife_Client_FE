import clsx from 'clsx';
import { useMemo, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Dropdown } from 'antd';
import { useCartStore } from '@/store/cart.store.js';
import { useRightPanel } from '@/store/rightPanel.store.js';
import { useProduct } from '@/hooks/useProduct.js';
import { useCampusStore } from '@/store/useCampusStore';
import { useWishlist } from '@/hooks/useWishlist.js';
import ProductCard from '@/components/ProductCard.jsx';
import Loader from '@/components/Loader.jsx';
import EmptyState from '@/components/EmptyState.jsx';
import MaterialIcon from '@/components/MaterialIcon.jsx';
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
          : 'bg-surface/80 text-muted shadow-card hover:bg-surface hover:shadow-lift'
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
    const check = () => setOverflow(el.scrollWidth > el.clientWidth);
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

  const [activeCategoryId, setActiveCategoryId] = useState(null); // null = All
  const [sortOption, setSortOption] = useState('');
  const isDefaultFilter = !activeCategoryId && !sortOption;
  const [searchParams] = useSearchParams();
  const { ids: wishlistIds, fetch: fetchWishlist, toggle: toggleWishlist } = useWishlist();

  // Reset filter khi đổi canteen
  useEffect(() => {
    setActiveCategoryId(null);
    setSortOption('');
  }, [selectedCanteen?.id]);

  useEffect(() => {
    const params = {
      limit: 100,
      status: 'available',
    };

    // Search
    const search = searchParams.get('search');
    if (search?.trim()) {
      params.search = search.trim();
    }

    // Category filter (dùng categoryId)
    if (activeCategoryId) {
      params.categoryId = activeCategoryId;
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
      fetchByCanteen(selectedCanteen.id, params);   // ✅ Truyền đầy đủ params
    } else {
      fetchAll(params);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCanteen?.id, activeCategoryId, sortOption, searchParams, fetchByCanteen, fetchAll]);

  // Fetch wishlist
  useEffect(() => {
    fetchWishlist().catch((err) => console.warn('Wishlist not loaded:', err?.message));
  }, [fetchWishlist]);

  // Build category list with id
  const categoryOptions = useMemo(() => {
    const map = new Map(); // id → name
    products.forEach((p) => {
      const cat = p.categoryId;
      if (cat?._id && cat.name) {
        map.set(cat._id.toString(), cat.name);
      }
    });

    const options = Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return [{ id: null, name: 'All' }, ...options];
  }, [products]);

  const items = products;

  return (
    <div className="grid gap-6">
      <section className="grid min-w-0 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">Menu</h1>
          <p className="text-sm text-muted">Choose from our delicious selection</p>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        )}

        {error && !loading && (
          <div className="rounded-lg bg-danger/10 p-4 text-danger">
            <p className="font-medium">Failed to load menu</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => fetchAll({ limit: 100, status: 'available' })}
              className="mt-3 rounded bg-danger px-4 py-2 text-inverse hover:bg-danger/90"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && (
          <>
            <div className="flex w-full items-center justify-between gap-4 flex-wrap">
              {/* Category chips */}
              <div className="relative min-w-0 flex-1">
                {isOverflow && (
                  <button
                    onClick={() => categoryRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
                    className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-surface shadow-card p-1 transition hover:shadow-lift"
                  >
                    ‹
                  </button>
                )}

                <div ref={categoryRef} className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {categoryOptions.map((cat) => (
                    <Chip
                      key={cat.id ?? 'all'}
                      active={activeCategoryId === cat.id}
                      onClick={() => setActiveCategoryId(cat.id)}
                    >
                      {cat.name}
                    </Chip>
                  ))}
                </div>

                {isOverflow && (
                  <button
                    onClick={() => categoryRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
                    className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-surface shadow-card p-1 transition hover:shadow-lift"
                  >
                    ›
                  </button>
                )}
              </div>

              {/* Reset + Sort */}
              <div className="flex items-center gap-3 shrink-0">
                <ResetLink
                  disabled={isDefaultFilter}
                  onClick={() => {
                    setActiveCategoryId(null);
                    setSortOption('');
                  }}
                />

                <Dropdown
                  trigger={['click']}
                  menu={{
                    items: [
                      { key: '', label: 'Mặc định' },
                      { key: 'name-asc', label: 'Tên A → Z' },
                      { key: 'name-desc', label: 'Tên Z → A' },
                      { key: 'price-desc', label: 'Giá cao → thấp' },
                      { key: 'price-asc', label: 'Giá thấp → cao' },
                    ],
                    onClick: ({ key }) => setSortOption(key),
                  }}
                >
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-card bg-surface px-4 py-2 shadow-card transition-all hover:shadow-lift min-w-40"
                  >
                    <span className="text-sm font-medium text-text flex-1 text-left">
                      {sortOption === 'name-asc' ? 'Tên A → Z' : 
                       sortOption === 'name-desc' ? 'Tên Z → A' :
                       sortOption === 'price-desc' ? 'Giá cao → thấp' :
                       sortOption === 'price-asc' ? 'Giá thấp → cao' : 'Mặc định'}
                    </span>
                    <MaterialIcon name="expand_more" className="text-[18px] text-muted" />
                  </button>
                </Dropdown>
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
                    onToggleWishlist={() => toggleWishlist(it._id)}
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
    </div>
  );
}