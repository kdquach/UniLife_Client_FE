import { useState } from "react";
import clsx from "clsx";
import MaterialIcon from "@/components/MaterialIcon.jsx";
import { validateVoucher } from "@/services/voucher.service";
import { money } from "@/utils/currency.js";

/**
 * VoucherInput - Component to apply voucher codes
 * @param {Object} props
 * @param {number} props.subtotal - Order subtotal for validation
 * @param {Array} props.items - Cart items for validation
 * @param {string} props.campusId - Campus ID for local vouchers
 * @param {Object} props.appliedVoucher - Currently applied voucher
 * @param {number} props.discountAmount - Amount discounted
 * @param {Function} props.onApply - Callback when voucher applied: (voucher, discountAmount) => void
 * @param {Function} props.onRemove - Callback when voucher removed: () => void
 */
export default function VoucherInput({
  subtotal = 0,
  items = [],
  campusId,
  appliedVoucher,
  discountAmount = 0,
  onApply,
  onRemove,
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleApply = async () => {
    if (!code.trim()) {
      setError("Vui lòng nhập mã giảm giá");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await validateVoucher({
        code: code.trim(),
        orderTotal: subtotal,
        items,
        campusId,
      });

      if (response.status === "success") {
        const { voucher, discountAmount, message } = response.data;
        setSuccess(
          message || `Áp dụng thành công! Giảm ${money(discountAmount)}`,
        );
        onApply?.(voucher, discountAmount);
        setCode(""); // Clear input after success
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể áp dụng voucher";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCode("");
    setError("");
    setSuccess("");
    onRemove?.();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleApply();
    }
  };

  // If voucher is already applied, show applied state
  if (appliedVoucher) {
    return (
      <div className="rounded-2xl bg-green-50 border border-green-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-green-100">
              <MaterialIcon
                name="local_offer"
                className="text-[16px] text-green-600"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-700">
                {appliedVoucher.code}
              </p>
              <p className="text-xs text-green-600">
                Giảm {money(discountAmount)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="grid h-8 w-8 place-items-center rounded-full text-green-600 hover:bg-green-100 transition"
            aria-label="Xóa voucher"
          >
            <MaterialIcon name="close" className="text-[18px]" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            <MaterialIcon
              name="confirmation_number"
              className="text-[18px] text-muted"
            />
          </div>
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError("");
              setSuccess("");
            }}
            onKeyPress={handleKeyPress}
            placeholder="Nhập mã giảm giá"
            disabled={loading}
            className={clsx(
              "h-11 w-full rounded-xl border bg-surfaceMuted pl-10 pr-4 text-sm",
              "placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20",
              "transition duration-200",
              error ? "border-red-300" : "border-transparent",
            )}
          />
        </div>
        <button
          type="button"
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className={clsx(
            "h-11 px-4 rounded-xl text-sm font-semibold transition duration-200",
            "flex items-center justify-center gap-2 min-w-[90px]",
            loading || !code.trim()
              ? "bg-surfaceMuted text-muted cursor-not-allowed"
              : "bg-primary text-inverse hover:bg-primary-hover",
          )}
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Đang kiểm tra...</span>
            </>
          ) : (
            "Áp dụng"
          )}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <MaterialIcon name="error_outline" className="text-[16px]" />
          <span>{error}</span>
        </div>
      )}

      {/* Success message (shown briefly before voucher is applied) */}
      {success && !appliedVoucher && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <MaterialIcon name="check_circle" className="text-[16px]" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}
