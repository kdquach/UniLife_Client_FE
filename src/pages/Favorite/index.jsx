import { useEffect, useMemo } from 'react';
import { useWishlist } from '@/hooks/useWishlist.js';
import { useProduct } from '@/hooks/useProduct.js';
import Loader from '@/components/Loader.jsx';
import EmptyState from '@/components/EmptyState.jsx';
import ProductCard from '@/components/ProductCard.jsx';
import clsx from 'clsx';

export default function FavoritePage() {
  const { ids, items, loading, error, fetch, clear, toggle } = useWishlist();
  const { products, fetchAll } = useProduct();

  // Load wishlist and products on mount
  useEffect(() => {
    fetch().catch(() => { });
    fetchAll({ limit: 100, status: 'available' }).catch(() => { });
  }, [fetch, fetchAll]);

  const favoriteProducts = useMemo(() => {
    const set = ids;
    return products.filter((p) => set.has(p._id));
  }, [products, ids]);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Favorite Food</h1>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>
        <button
          type="button"
          disabled={items.length === 0}
          onClick={() => clear().catch(() => { })}
          className={clsx(
            'rounded-lg px-3 py-2 text-sm font-semibold shadow-card transition',
            items.length === 0
              ? 'bg-surfaceMuted text-muted'
              : 'bg-primary text-inverse hover:shadow-lift'
          )}
        >
          Clear Favorites
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      ) : favoriteProducts.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          description="Add items to your favorites from the Menu"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {favoriteProducts.map((it) => (
            <ProductCard
              key={it._id}
              productId={it._id}
              image={it.image}
              name={it.name}
              description={it.description}
              price={it.price}
              inCart={false}
              wishlisted={true}
              onToggleWishlist={() => {
                toggle(it._id).catch(() => { });
              }}
              onAddToCart={() => {
                // Optional: add to cart from favorites in the future
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
