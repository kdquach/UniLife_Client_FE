import clsx from 'clsx';
import { useMemo, useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart.store.js';
import { useRightPanel } from '@/store/rightPanel.store.js';
import { useProduct } from '@/hooks/useProduct.js';
import { useCampusStore } from '@/store/useCampusStore';
import { useWishlist } from '@/hooks/useWishlist.js';
import ProductCard from '@/components/ProductCard.jsx';
import Loader from '@/components/Loader.jsx';
import EmptyState from '@/components/EmptyState.jsx';

function Chip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'rounded-full px-4 py-1.5 text-sm font-medium shadow-card transition duration-200',
        active
          ? 'bg-primary text-inverse shadow-lift'
          : 'bg-white/80 text-muted hover:bg-white hover:shadow-lift'
      )}
    >
      {children}
    </button>
  );
}

export default function MenuPage() {
  const cart = useCartStore();
  const panel = useRightPanel();
  const { products, loading, error, fetchByCanteen, fetchAll } = useProduct();
  const { selectedCanteen } = useCampusStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const { ids: wishlistIds, fetch: fetchWishlist, toggle: toggleWishlist } = useWishlist();

  // Fetch products when selectedCanteen changes
  useEffect(() => {
    if (selectedCanteen?.id) {
      fetchByCanteen(selectedCanteen.id, { limit: 100, status: 'available' });
      cart.clearCart(); // Clear cart if canteen changes
    } else {
      fetchAll({ limit: 100, status: 'available' });
    }
    setActiveCategory('All');
    // eslint-disable-next-line
  }, [selectedCanteen?.id]);

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

  const items = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter((x) => x.categoryId?.name === activeCategory);
  }, [activeCategory, products]);

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
            <div className="flex flex-wrap items-center gap-2">
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
    </div>
  );
}
