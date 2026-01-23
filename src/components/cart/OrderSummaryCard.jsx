import { money } from "@/utils/currency.js";

export default function OrderSummaryCard({
  title = "Detail Summary",
  subtotal = 0,
  tax = 0,
  discount = 0,
  deliveryFee = 0,
  total = 0,
}) {
  return (
    <div className="grid gap-2">
      <h3 className="text-sm font-semibold text-text">{title}</h3>
      <div className="rounded-3xl bg-app-bg py-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Subtotal</span>
          <span className="font-semibold text-text">{money(subtotal)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted">Tax (8%)</span>
          <span className="font-semibold text-text">{money(tax)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted">Discount</span>
          <span className="font-semibold text-text">{discount ? `-${money(discount)}` : money(0)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted">Delivery Fee</span>
          <span className="font-semibold text-text">{money(deliveryFee)}</span>
        </div>
        <div className="my-4 h-px w-full border-b border-dashed border-divider" />
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-text">Total</span>
          <span className="text-lg font-extrabold text-primary">{money(total)}</span>
        </div>
      </div>
    </div>
  );
}
