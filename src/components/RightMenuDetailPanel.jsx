import clsx from 'clsx';
import { useEffect } from 'react';
import { useCartStore } from '@/store/cart.store.js';
import { useRightPanel } from '@/store/rightPanel.store.js';
import { useProduct } from '@/hooks/useProduct.js';
import { money } from '@/utils/currency.js';
import MaterialIcon from '@/components/MaterialIcon.jsx';
import imageNotFound from '@/assets/images/image-not-found.png';

export default function RightMenuDetailPanel({ allowCollapse = true }) {
  const cart = useCartStore();
  const panel = useRightPanel();
  const { product: item, loading, fetchById } = useProduct();
  const qty = panel.detailQty;

  // Fetch product detail when detailItemId changes
  useEffect(() => {
    if (panel.detailItemId) {
      fetchById(panel.detailItemId).catch((err) => {
        console.error('Failed to fetch product detail:', err);
      });
    }
  }, [panel.detailItemId, fetchById]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between bg-white/70 backdrop-blur px-5 py-4">
        <h2 className="text-sm font-semibold text-text">
          {item?.name || 'Chi tiết'}
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1 rounded-full bg-transparent px-3 py-1.5 text-xs font-semibold text-muted transition duration-200 hover:text-primary"
            onClick={panel.backToCart}
            aria-label="Back to cart"
          >
            <MaterialIcon name="chevron_left" className="text-[18px]" />
            Cart
          </button>

          {allowCollapse ? (
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full bg-transparent text-muted transition duration-200 hover:text-primary"
              onClick={panel.collapse}
              aria-label="Collapse panel"
            >
              <MaterialIcon name="chevron_left" className="text-[22px]" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="grid h-full place-items-center p-8 text-center text-slate-600">
            <div className="space-y-2">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p>Đang tải...</p>
            </div>
          </div>
        )}

        {!loading && !item && (
          <div className="grid h-full place-items-center p-8 text-center text-slate-600">
            Chọn món ăn để xem chi tiết.
          </div>
        )}

        {!loading && item && (
          <>
            <div className="aspect-16/10 w-full bg-slate-100">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.06]"
                  loading="lazy"
                />
              ) : (
                <img
                  src={imageNotFound}
                  alt={item.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.06]"
                  loading="lazy"
                />
              )}
            </div>

            <div className="grid gap-4 p-5">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-text">
                    {item.name}
                  </h3>
                  <span className="text-lg font-semibold text-primary">
                    {money(item.price)}
                  </span>
                </div>
                <p className="text-sm text-muted">{item.description}</p>
              </div>

              <div className="grid gap-2">
                <p className="text-sm font-semibold text-slate-800">Quantity</p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="grid h-9 w-9 place-items-center rounded-lg bg-white shadow-card transition duration-200 hover:bg-slate-50 hover:shadow-lift"
                    onClick={() =>
                      panel.setDetailQty((q) => Math.max(1, q - 1))
                    }
                    aria-label="Decrease"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-semibold">
                    {qty}
                  </span>
                  <button
                    type="button"
                    className="grid h-9 w-9 place-items-center rounded-lg bg-white shadow-card transition duration-200 hover:bg-slate-50 hover:shadow-lift"
                    onClick={() => panel.setDetailQty((q) => q + 1)}
                    aria-label="Increase"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-5">
        <button
          type="button"
          disabled={!item || loading}
          onClick={() => {
            if (!item) return;
            cart.addItem(item._id, qty);
            panel.openCart();
          }}
          className={clsx(
            'h-11 w-full rounded-card text-sm font-semibold text-white shadow-card transition duration-200',
            item && !loading
              ? 'bg-primary hover:bg-primaryHover hover:shadow-lift'
              : 'bg-surfaceMuted text-muted'
          )}
        >
          Add to Cart · {item ? money(item.price * qty) : money(0)}
        </button>
      </div>
    </div>
  );
}
