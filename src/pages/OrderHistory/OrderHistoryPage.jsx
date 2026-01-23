import { useEffect, useMemo, useState } from "react";
import MaterialIcon from "@/components/MaterialIcon.jsx";
import { useRightPanel } from "@/store/rightPanel.store.js";
import { money } from "@/utils/currency.js";
import { formatDate } from "@/utils/formatDate.js";
import { addOrder, getOrders, subscribeOrdersUpdated } from "@/utils/ordersStorage.js";

/* ===== CONSTANT ===== */
const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "preparing", label: "Đang chuẩn bị" },
  { key: "completed", label: "Hoàn thành" },
  { key: "cancelled", label: "Hủy" },
];

/* ===== EMPTY STATE ===== */
function EmptyOrder() {
  return (
    <div className="grid h-64 place-items-center text-center">
      <div className="grid gap-3">
        <MaterialIcon name="receipt_long" className="mx-auto text-[56px] text-muted" />
        <p className="text-sm font-semibold">Chưa có đơn hàng</p>
        <p className="text-sm text-muted">
          Bạn hãy đặt hàng nhé!
        </p>
      </div>
    </div>
  );
}

/* ===== TABS ===== */
function OrderTabs({ active, onChange }) {
  return (
    <div className="flex w-fit gap-1 rounded-full bg-white p-1">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${active === tab.key
            ? "bg-primary text-inverse shadow-card"
            : "text-muted hover:text-text"
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ===== TABLE ===== */
function OrderTable({ orders, onSelect }) {
  if (!orders.length) return <EmptyOrder />;

  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface">
      <table className="w-full text-sm">
        <thead className="bg-surfaceMuted text-muted">
          <tr>
            <th className="px-4 py-3 text-left">Mã đơn</th>
            <th className="px-4 py-3 text-left">Sản phẩm</th>
            <th className="px-4 py-3 text-left">Ngày</th>
            <th className="px-4 py-3 text-right">Tổng tiền</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const total = o?.summary?.total ?? o?.total ?? 0;
            const when = o?.createdAt || o?.date;

            return (
              <tr
                key={o.id}
                className="border-t border-border cursor-pointer hover:bg-surfaceMuted/60"
                role="button"
                tabIndex={0}
                onClick={() => onSelect?.(o)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelect?.(o);
                }}
              >
                <td className="px-4 py-3 font-medium">#{o.code}</td>
                <td className="px-4 py-3">
                  {(Array.isArray(o.items) ? o.items : [])
                    .map((it) => (typeof it === "string" ? it : it?.name || it?.itemId || ""))
                    .filter(Boolean)
                    .join(", ")}
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(when, "DD/MM/YYYY")}</td>
                <td className="px-4 py-3 text-right font-semibold">{money(total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ===== PAGE ===== */
export default function OrderHistoryPage() {
  const [activeTab, setActiveTab] = useState("all");
  const panel = useRightPanel();

  const [orders, setOrders] = useState(() => getOrders());

  useEffect(() => {
    // TODO(api): replace storage with real API fetch.
    return subscribeOrdersUpdated(() => setOrders(getOrders()));
  }, []);

  useEffect(() => {
    // DEV seed: create a couple of orders if storage is empty.
    if (!import.meta.env.DEV) return;
    if (orders.length) return;
    addOrder({
      id: "order-seed-1",
      code: "ORD-001",
      status: "completed",
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      paymentMethod: "COD",
      items: [
        { itemId: "classic-burger", name: "Classic Burger", price: 35000, qty: 2, image: "" },
        { itemId: "margherita-pizza", name: "Margherita Pizza", price: 15000, qty: 1, image: "" },
      ],
      summary: { subtotal: 85000, tax: 0, total: 85000 },
    });
    addOrder({
      id: "order-seed-2",
      code: "ORD-002",
      status: "cancelled",
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      paymentMethod: "QR",
      items: [{ itemId: "caesar-salad", name: "Caesar Salad", price: 25000, qty: 1, image: "" }],
      summary: { subtotal: 25000, tax: 0, total: 25000 },
    });
  }, [orders.length]);

  const filtered = useMemo(() => {
    return activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);
  }, [activeTab, orders]);

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Lịch sử đơn hàng</h1>

      <OrderTabs active={activeTab} onChange={setActiveTab} />

      <OrderTable orders={filtered} onSelect={(order) => panel.openOrderDetail?.(order)} />
    </div>
  );
}
