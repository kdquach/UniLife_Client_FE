import clsx from "clsx";
import { useMemo, useState } from "react";
import { CATEGORIES, MENU_ITEMS } from "./menu.data";
import { useCartStore } from "@/store/cart.store.js";
import { useRightPanel } from "@/store/rightPanel.store.js";
import ProductCard from "@/components/ProductCard.jsx";
import MaterialIcon from "@/components/MaterialIcon.jsx";

function Chip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "rounded-full px-4 py-1.5 text-sm font-medium shadow-card transition duration-200",
        active
          ? "bg-primary text-inverse shadow-lift"
          : "bg-white/80 text-muted hover:bg-white hover:shadow-lift"
      )}
    >
      {children}
    </button>
  );
}

export default function MenuPage() {
  const cart = useCartStore();
  const panel = useRightPanel();
  const [activeCategory, setActiveCategory] = useState("All");
  const [wishlist, setWishlist] = useState(() => new Set());

  const items = useMemo(() => {
    if (activeCategory === "All") return MENU_ITEMS;
    return MENU_ITEMS.filter((x) => x.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="grid gap-6">
      <section className="grid min-w-0 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">Menu</h1>
          <p className="text-sm text-muted">Choose from our delicious selection</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((c) => (
            <Chip key={c} active={activeCategory === c} onClick={() => setActiveCategory(c)}>
              {c}
            </Chip>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div
              key={it.id}
              role="button"
              tabIndex={0}
              onClick={() => panel.openDetail(it.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") panel.openDetail(it.id);
              }}
              className="text-left"
            >
              <ProductCard
                image={it.image}
                name={it.name}
                description={it.description}
                price={it.price}
                inCart={cart.lines?.some((l) => l.itemId === it.id)}
                wishlisted={wishlist.has(it.id)}
                onToggleWishlist={() => {
                  setWishlist((prev) => {
                    const next = new Set(prev);
                    if (next.has(it.id)) next.delete(it.id);
                    else next.add(it.id);
                    return next;
                  });
                }}
                onAddToCart={() => {
                  cart.addItem(it.id, 1);
                  panel.openCart();
                }}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
