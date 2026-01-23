import { useMemo, useState } from "react";
import { money } from "@/utils/currency.js";

const CATEGORIES = ["All", "Burgers", "Pizza", "Salads", "Wraps", "Mains", "Bowls", "Pasta"];

const SAMPLE_ITEMS = [
  {
    id: "classic-burger",
    name: "Classic Burger",
    category: "Burgers",
    description: "Juicy beef patty with fresh lettuce, tomato, and our special sauce",
    price: 12.99,
    image:
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "margherita-pizza",
    name: "Margherita Pizza",
    category: "Pizza",
    description: "Fresh mozzarella, tomato sauce, and basil on a crispy crust",
    price: 14.99,
    image:
      "https://images.unsplash.com/photo-1601924582975-4aa83e52f0c4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "caesar-salad",
    name: "Caesar Salad",
    category: "Salads",
    description: "Crisp romaine, parmesan, croutons, and Caesar dressing",
    price: 9.99,
    image:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "chicken-wrap",
    name: "Chicken Wrap",
    category: "Wraps",
    description: "Grilled chicken with mixed greens, tomato, and ranch dressing",
    price: 10.99,
    image:
      "https://images.unsplash.com/photo-1604909053146-0d1b1b2d88df?auto=format&fit=crop&w=1200&q=80",
  },
];

const TOPPINGS = [
  { id: "avocado", label: "Avocado", price: 3 },
  { id: "extra-cheese", label: "Extra Cheese", price: 2 },
  { id: "bacon", label: "Bacon", price: 2 },
];

const SIZES = [
  { id: "regular", label: "Regular", delta: 0 },
  { id: "large", label: "Large", delta: 3 },
];

export function useMenu() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedId, setSelectedId] = useState(null);

  const [panelMode, setPanelMode] = useState("cart"); // 'detail' | 'cart'
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [sizeId, setSizeId] = useState("regular");
  const [toppings, setToppings] = useState([]);
  const [qty, setQty] = useState(1);

  const [cart, setCart] = useState([]);

  const items = useMemo(() => {
    if (activeCategory === "All") return SAMPLE_ITEMS;
    return SAMPLE_ITEMS.filter((x) => x.category === activeCategory);
  }, [activeCategory]);

  const selectedItem = useMemo(() => SAMPLE_ITEMS.find((x) => x.id === selectedId) || null, [selectedId]);

  const selectedSize = useMemo(() => SIZES.find((s) => s.id === sizeId) || SIZES[0], [sizeId]);

  const toppingsTotal = useMemo(
    () => toppings.reduce((sum, t) => sum + (TOPPINGS.find((x) => x.id === t)?.price || 0), 0),
    [toppings]
  );

  const detailTotal = useMemo(() => (selectedItem?.price || 0) + selectedSize.delta + toppingsTotal, [
    selectedItem?.price,
    selectedSize.delta,
    toppingsTotal,
  ]);

  const cartLines = useMemo(() => {
    return cart.map((c) => {
      const item = SAMPLE_ITEMS.find((x) => x.id === c.itemId);
      const size = SIZES.find((s) => s.id === c.sizeId) || SIZES[0];
      const toppingSum = (c.toppings || []).reduce((sum, id) => sum + (TOPPINGS.find((t) => t.id === id)?.price || 0), 0);
      const unit = (item?.price || 0) + size.delta + toppingSum;
      return {
        ...c,
        item,
        size,
        unit,
        lineTotal: unit * c.qty,
      };
    });
  }, [cart]);

  const subtotal = useMemo(() => cartLines.reduce((sum, l) => sum + l.lineTotal, 0), [cartLines]);
  const tax = useMemo(() => subtotal * 0.08, [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  function toggleTopping(id) {
    setToppings((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function selectItem(id) {
    setSelectedId(id);
    setPanelMode("detail");
    setPanelCollapsed(false);
    setSizeId("regular");
    setToppings([]);
    setQty(1);
  }

  function addToCart() {
    if (!selectedItem) return;
    const lineId = `line-${Date.now()}`;
    setCart((prev) => [
      {
        lineId,
        itemId: selectedItem.id,
        sizeId,
        toppings,
        qty,
      },
      ...prev,
    ]);
    setPanelMode("cart");
    setPanelCollapsed(false);
  }

  function incLine(lineId) {
    setCart((prev) => prev.map((l) => (l.lineId === lineId ? { ...l, qty: l.qty + 1 } : l)));
  }

  function decLine(lineId) {
    setCart((prev) =>
      prev
        .map((l) => (l.lineId === lineId ? { ...l, qty: Math.max(1, l.qty - 1) } : l))
        .filter((l) => l.qty > 0)
    );
  }

  function removeLine(lineId) {
    setCart((prev) => prev.filter((l) => l.lineId !== lineId));
  }

  return {
    categories: CATEGORIES,
    activeCategory,
    setActiveCategory,
    items,
    selectedItem,
    selectItem,
    panelMode,
    setPanelMode,
    panelCollapsed,
    setPanelCollapsed,
    sizes: SIZES,
    sizeId,
    setSizeId,
    toppingOptions: TOPPINGS,
    toppings,
    toggleTopping,
    qty,
    setQty,
    detailTotal,
    addToCart,
    cartLines,
    subtotal,
    tax,
    total,
    money,
    incLine,
    decLine,
    removeLine,
  };
}
