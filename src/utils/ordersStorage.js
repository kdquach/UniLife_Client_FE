// DEV-mode persistence for orders.
// TODO(api): replace this file with real API integration.

const KEY = "unilife_orders_v1";
const EVENT = "unilife:orders-updated";

export function getOrders() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setOrders(next) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next || []));
  } catch {
    // ignore
  }
  emitOrdersUpdated();
}

export function addOrder(order) {
  const prev = getOrders();
  setOrders([order, ...prev]);
}

export function emitOrdersUpdated() {
  try {
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    // ignore
  }
}

export function subscribeOrdersUpdated(handler) {
  const h = () => handler?.();
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
}
