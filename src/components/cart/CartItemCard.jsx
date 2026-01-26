import { money } from "@/utils/currency.js";
import imageNotFound from "@/assets/images/image-not-found.png";

export default function CartItemCard({
  line,
  readonly = false,
  onInc,
  onDec,
  onRemove,
}) {
  if (!line) return null;

  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white p-3 shadow-card">
      {line.item?.image ? (
        <div className="h-14 w-14 overflow-hidden rounded-xl bg-surfaceMuted">
          <img src={line.item.image} alt={line.item?.name} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="h-14 w-14 overflow-hidden rounded-xl bg-surfaceMuted">
          <img src={imageNotFound} alt={line.item?.name} className="h-full w-full object-cover" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">{line.item?.name}</p>
            <p className="mt-0.5 text-xs text-muted">{money(line.unit)} / item</p>
            {readonly ? (
              <p className="mt-0.5 text-xs font-semibold text-muted">x{line.qty}</p>
            ) : null}
          </div>
          <p className="shrink-0 text-sm font-bold text-primary">{money(line.lineTotal)}</p>
        </div>

        {readonly ? null : (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center rounded-xl bg-surfaceMuted">
              <button
                type="button"
                className="grid h-8 w-8 place-items-center text-sm font-semibold text-muted transition hover:text-primary"
                onClick={() => onDec?.(line)}
                aria-label="Decrease"
              >
                −
              </button>
              <span className="w-8 text-center text-xs font-semibold">{line.qty}</span>
              <button
                type="button"
                className="grid h-8 w-8 place-items-center text-sm font-semibold text-muted transition hover:text-primary"
                onClick={() => onInc?.(line)}
                aria-label="Increase"
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="ml-auto text-xs font-semibold text-danger hover:underline"
              onClick={() => onRemove?.(line)}
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
