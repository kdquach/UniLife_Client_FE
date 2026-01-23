import { useCallback, useMemo, useRef, useState } from "react";
import { RightPanelContext } from "./rightPanel.context";

export function RightPanelProvider({ children }) {
  const [expanded, setExpanded] = useState(false);

  // per-route remembered state (e.g. menu expanded by default, others collapsed)
  const routePrefsRef = useRef({});

  // content state (detail view is primarily used by Menu page)
  const [view, setView] = useState("cart"); // 'cart' | 'detail' | 'payment' | 'order'
  const [detailItemId, setDetailItemId] = useState(null);
  const [detailQty, setDetailQty] = useState(1);

  // order history detail
  const [order, setOrder] = useState(null);

  const applyRouteDefault = useCallback((routeKey, defaultExpanded) => {
    const prefs = routePrefsRef.current;
    if (!(routeKey in prefs)) prefs[routeKey] = defaultExpanded;

    const desired = Boolean(prefs[routeKey]);
    setExpanded((prev) => (prev === desired ? prev : desired));

    // When leaving Menu, don't keep showing a stale detail view.
    if (routeKey !== "menu") {
      setDetailItemId(null);
      setDetailQty(1);
      setView((prev) => (prev === "detail" ? "cart" : prev));
    }
  }, []);

  const rememberExpanded = useCallback((routeKey, nextExpanded) => {
    routePrefsRef.current[routeKey] = Boolean(nextExpanded);
  }, []);

  const expand = useCallback(() => {
    setExpanded(true);
  }, []);

  const collapse = useCallback(() => {
    setExpanded(false);
  }, []);

  const toggle = useCallback(() => {
    setExpanded((v) => !v);
  }, []);

  const openCart = useCallback(() => {
    setView("cart");
    setDetailItemId(null);
    setDetailQty(1);
    setOrder(null);
    setExpanded(true);
  }, []);

  const openDetail = useCallback((itemId) => {
    setView("detail");
    setDetailItemId(itemId);
    setDetailQty(1);
    setOrder(null);
    setExpanded(true);
  }, []);

  const openPayment = useCallback((draftOrder) => {
    setView("payment");
    setOrder(draftOrder || null);
    setDetailItemId(null);
    setDetailQty(1);
    setExpanded(true);
  }, []);

  const openOrderDetail = useCallback((nextOrder) => {
    setView("order");
    setOrder(nextOrder || null);
    setDetailItemId(null);
    setDetailQty(1);
    setExpanded(true);
  }, []);

  const backToCart = useCallback(() => {
    setView("cart");
    setDetailItemId(null);
    setDetailQty(1);
    setOrder(null);
  }, []);

  const value = useMemo(
    () => ({
      expanded,
      view,
      detailItemId,
      detailQty,
      order,

      applyRouteDefault,
      rememberExpanded,

      expand,
      collapse,
      toggle,
      openCart,
      openDetail,
      openPayment,
      openOrderDetail,
      backToCart,
      setDetailQty,
    }),
    [
      expanded,
      view,
      detailItemId,
      detailQty,
      order,
      applyRouteDefault,
      rememberExpanded,
      expand,
      collapse,
      toggle,
      openCart,
      openDetail,
      openPayment,
      openOrderDetail,
      backToCart,
    ]
  );

  return <RightPanelContext.Provider value={value}>{children}</RightPanelContext.Provider>;
}
