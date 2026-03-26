import clsx from 'clsx';
import { useMemo, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Dropdown } from 'antd';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cart.store.js';
import { useRightPanel } from '@/store/rightPanel.store.js';
import { useProduct } from '@/hooks/useProduct.js';
import { useDailyMenu } from '@/hooks/useDailyMenu.js';
import { useCampusStore } from '@/store/useCampusStore';
import { useWishlist } from '@/hooks/useWishlist.js';
import ProductCard from '@/components/ProductCard.jsx';
import Loader from '@/components/Loader.jsx';
import EmptyState from '@/components/EmptyState.jsx';
import MaterialIcon from '@/components/MaterialIcon.jsx';
import ResetLink from '../../components/menu/ResetLink';

const ORDERABLE_STATUSES = ['available', 'unavailable'];

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
  const {
    products: dailyProducts,
    loading: loadingDaily,
    error: errorDaily,
    notice: noticeDaily,
    fetchByCanteen: fetchDailyByCanteen,
    reset: resetDaily,
  } = useDailyMenu();
  const { selectedCanteen } = useCampusStore();

  const [activeCategoryId, setActiveCategoryId] = useState(null); // null = All
  const [sortOption, setSortOption] = useState('');
  const isDefaultFilter = !activeCategoryId && !sortOption;
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() =>
    searchParams.get('tab') === 'daily' ? 'daily' : 'food'
  );
  const {
    ids: wishlistIds,
    fetch: fetchWishlist,
    toggle: toggleWishlist,
  } = useWishlist();

  const queryTab = searchParams.get('tab');
  const querySearch = searchParams.get('search')?.trim() || '';
  const normalizedSearch = querySearch.toLowerCase();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveTab(queryTab === 'daily' ? 'daily' : 'food');
  }, [queryTab]);

  // Reset filter khi đổi canteen
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveCategoryId(null);
    setSortOption('');
  }, [selectedCanteen?.id, activeTab]);

  useEffect(() => {
    if (activeTab === 'daily') {
      if (selectedCanteen?.id) {
        fetchDailyByCanteen(selectedCanteen.id).catch(() => {});
      } else {
        resetDaily();
      }
      return;
    }

    const params = {
      limit: 100,
    };

    if (selectedCanteen?.id) {
      fetchByCanteen(selectedCanteen.id, params);
    } else {
      fetchAll(params);
    }
  }, [
    activeTab,
    selectedCanteen?.id,
    fetchByCanteen,
    fetchAll,
    fetchDailyByCanteen,
    resetDaily,
  ]);

  // Fetch wishlist
  useEffect(() => {
    fetchWishlist().catch((err) =>
      console.warn('Wishlist not loaded:', err?.message)
    );
  }, [fetchWishlist]);

  useEffect(() => {
    if (activeTab === 'daily' && noticeDaily && !loadingDaily && !errorDaily) {
      toast.info(noticeDaily);
    }
  }, [activeTab, noticeDaily, loadingDaily, errorDaily]);

  // Build category list with id
  const baseItems = useMemo(
    () => (activeTab === 'daily' ? dailyProducts : products),
    [activeTab, dailyProducts, products]
  );

  const items = useMemo(() => {
    let result = Array.isArray(baseItems) ? [...baseItems] : [];

    if (activeTab === 'food') {
      result = result.filter((item) =>
        ORDERABLE_STATUSES.includes(String(item?.status || '').toLowerCase())
      );
    }

    if (normalizedSearch) {
      result = result.filter((item) => {
        const name = String(item?.name || '').toLowerCase();
        const description = String(item?.description || '').toLowerCase();
        return (
          name.includes(normalizedSearch) ||
          description.includes(normalizedSearch)
        );
      });
    }

    if (activeCategoryId) {
      result = result.filter((item) => {
        const categoryId = item?.categoryId?._id || item?.categoryId;
        return String(categoryId || '') === String(activeCategoryId);
      });
    }

    if (sortOption) {
      const sorterMap = {
        'name-asc': (a, b) =>
          String(a?.name || '').localeCompare(String(b?.name || '')),
        'name-desc': (a, b) =>
          String(b?.name || '').localeCompare(String(a?.name || '')),
        'price-asc': (a, b) => Number(a?.price || 0) - Number(b?.price || 0),
        'price-desc': (a, b) => Number(b?.price || 0) - Number(a?.price || 0),
      };

      const sorter = sorterMap[sortOption];
      if (sorter) {
        result.sort(sorter);
      }
    }

    return result;
  }, [activeCategoryId, activeTab, baseItems, normalizedSearch, sortOption]);

  const categoryOptions = useMemo(() => {
    const map = new Map(); // id → name
    baseItems.forEach((p) => {
      const cat = p.categoryId;
      if (cat?._id && cat.name) {
        map.set(cat._id.toString(), cat.name);
      }
    });

    const options = Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return [{ id: null, name: 'All' }, ...options];
  }, [baseItems]);

  const currentLoading = activeTab === 'daily' ? loadingDaily : loading;
  const currentError = activeTab === 'daily' ? errorDaily : error;

  return (
    <div className="grid gap-6">
      <section className="grid min-w-0 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">Menu</h1>
          <p className="text-sm text-muted">
            Choose from our delicious selection
          </p>
        </div>

        <div className="inline-flex w-fit rounded-full border border-slate-200 bg-white p-1 shadow-card">
          <button
            type="button"
            onClick={() => setActiveTab('food')}
            className={clsx(
              'rounded-full px-4 py-2 text-sm font-medium transition',
              activeTab === 'food'
                ? 'bg-primary text-inverse shadow-lift'
                : 'text-muted hover:text-text'
            )}
          >
            Menu Food
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={clsx(
              'rounded-full px-4 py-2 text-sm font-medium transition',
              activeTab === 'daily'
                ? 'bg-primary text-inverse shadow-lift'
                : 'text-muted hover:text-text'
            )}
          >
            Menu theo ngày
          </button>
        </div>

        {currentLoading && (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        )}

        {currentError && !currentLoading && (
          <div className="rounded-lg bg-danger/10 p-4 text-danger">
            <p className="font-medium">Failed to load menu</p>
            <p className="text-sm">{currentError}</p>
            <button
              onClick={() => {
                if (activeTab === 'daily' && selectedCanteen?.id) {
                  fetchDailyByCanteen(selectedCanteen.id);
                  return;
                }
                fetchAll({ limit: 100 });
              }}
              className="mt-3 rounded bg-danger px-4 py-2 text-inverse hover:bg-danger/90"
            >
              Retry
            </button>
          </div>
        )}

        {activeTab === 'daily' &&
          noticeDaily &&
          !currentError &&
          !currentLoading && (
            <div className="rounded-lg border border-info/30 bg-info/10 p-4 text-info">
              <p className="font-medium">Thông báo menu theo ngày</p>
              <p className="text-sm">{noticeDaily}</p>
            </div>
          )}

        {!currentLoading && (
          <>
            <div className="flex w-full items-center justify-between gap-4 flex-wrap">
              {/* Category chips */}
              <div className="relative min-w-0 flex-1">
                {isOverflow && (
                  <button
                    onClick={() =>
                      categoryRef.current?.scrollBy({
                        left: -200,
                        behavior: 'smooth',
                      })
                    }
                    className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-surface shadow-card p-1 transition hover:shadow-lift"
                  >
                    ‹
                  </button>
                )}

                <div
                  ref={categoryRef}
                  className="flex gap-2 overflow-x-auto scrollbar-hide"
                >
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
                    onClick={() =>
                      categoryRef.current?.scrollBy({
                        left: 200,
                        behavior: 'smooth',
                      })
                    }
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
                      {sortOption === 'name-asc'
                        ? 'Tên A → Z'
                        : sortOption === 'name-desc'
                          ? 'Tên Z → A'
                          : sortOption === 'price-desc'
                            ? 'Giá cao → thấp'
                            : sortOption === 'price-asc'
                              ? 'Giá thấp → cao'
                              : 'Mặc định'}
                    </span>
                    <MaterialIcon
                      name="expand_more"
                      className="text-[18px] text-muted"
                    />
                  </button>
                </Dropdown>
              </div>
            </div>

            {items.length === 0 ? (
              <EmptyState
                title={
                  activeTab === 'daily'
                    ? 'Không có món trong menu ngày'
                    : 'No items available'
                }
                description={
                  activeTab === 'daily'
                    ? 'Hiện chưa có menu theo ngày hoặc không có món phù hợp bộ lọc.'
                    : 'No products found for the selected category'
                }
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
