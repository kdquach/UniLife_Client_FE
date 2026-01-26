import { Modal } from "antd";
import MaterialIcon from "@/components/MaterialIcon.jsx";
import { money } from "@/utils/currency.js";
import PickupQRCode from "@/components/order/PickupQRCode.jsx";

function fmtTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function OrderSuccessModal({
  open,
  order,
  onClose,
  onViewOrder,
}) {
  const code =
    order?.orderNumber ||
    order?.code ||
    (order?._id ? String(order._id).slice(-6) : "—");
  const paymentKey = order?.payment?.method || order?.paymentMethod || null;
  const paymentLabel = paymentKey
    ? { cash: "COD", momo: "Momo", sepay: "Sepay", bank_transfer: "Sepay" }[
        paymentKey
      ] || paymentKey
    : "—";
  const total =
    typeof order?.totalAmount === "number"
      ? order.totalAmount
      : typeof order?.summary?.total === "number"
        ? order.summary.total
        : typeof order?.total === "number"
          ? order.total
          : 0;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={560}
      styles={{ body: { padding: 24 } }}
    >
      <div className="grid gap-5">
        <div className="grid grid-cols-[44px_1fr] items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-success/10 text-success">
            <MaterialIcon name="check_circle" className="text-[26px]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text">
              Thanh toán thành công
            </h3>
            <p className="text-sm text-muted">
              Cảm ơn bạn! Đơn hàng đã được xác nhận.
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-surfaceMuted p-4">
          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Mã đơn</span>
              <span className="font-semibold text-text">#{code}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Thời gian</span>
              <span className="font-semibold text-text">
                {order?.createdAt ? fmtTime(order.createdAt) : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Phương thức</span>
              <span className="font-semibold text-text">{paymentLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Tổng tiền</span>
              <span className="font-extrabold text-primary">
                {money(total)}
              </span>
            </div>
          </div>

          {/* QR Code với TOTP */}
          {order?._id && (
            <div className="mt-4 flex justify-center">
              <PickupQRCode
                orderId={order._id}
                pickupCode={
                  order.pickupQRCode?.code || order.orderNumber || code
                }
                size={140}
              />
            </div>
          )}
        </div>

        <button
          type="button"
          className="h-11 w-full rounded-2xl bg-primary text-sm font-semibold text-inverse shadow-card transition hover:shadow-lift"
          onClick={onViewOrder}
        >
          Xem đơn hàng
        </button>
      </div>
    </Modal>
  );
}
