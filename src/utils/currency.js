const DEFAULT_LOCALE = "vi-VN";
const DEFAULT_CURRENCY = "VND";

export function formatCurrency(
  amount,
  {
    locale = DEFAULT_LOCALE,
    currency = DEFAULT_CURRENCY,
    maximumFractionDigits = currency === "VND" ? 0 : 2,
  } = {}
) {
  const value = Number(amount);
  const safe = Number.isFinite(value) ? value : 0;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits,
    }).format(safe);
  } catch {
    if (currency === "VND") return `${Math.round(safe)} ₫`;
    return `${safe}`;
  }
}

// Back-compat helper name used throughout the app.
export function money(amount) {
  return formatCurrency(amount, { currency: DEFAULT_CURRENCY, locale: DEFAULT_LOCALE });
}
