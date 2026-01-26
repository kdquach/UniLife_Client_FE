import { useMemo } from "react";
import clsx from "clsx";
import { useRightPanel } from "@/store/rightPanel.store.js";
import MaterialIcon from "@/components/MaterialIcon.jsx";
import { money } from "@/utils/currency";
import { formatDate } from "@/utils/formatDate";

// Status mapping for display
const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  preparing: "bg-purple-100 text-purple-800 border-purple-200",
  ready: "bg-indigo-100 text-indigo-800 border-indigo-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  preparing: "Đang chuẩn bị",
  ready: "Sẵn sàng lấy",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const PAYMENT_METHOD_LABELS = {
  balance: "Ví UniLife",
  wallet: "Ví điện tử",
  cash: "Tiền mặt",
  momo: "MoMo",
  zalopay: "ZaloPay",
};

export default function RightOrderDetailPanel({
  className,
  allowCollapse = true,
}) {
  const panel = useRightPanel();
  const order = panel.order || null;

  // Normalize items from API response
  const items = useMemo(() => {
    if (!order?.items || !Array.isArray(order.items)) return [];
    return order.items.map((item, index) => ({
      ...item,
      lineId: `${order._id}-${index}`,
      lineTotal: (item.price || 0) * (item.quantity || 1),
    }));
  }, [order]);

  const orderNumber =
    order?.orderNumber || order?._id?.slice(-6).toUpperCase() || "---";
  const canteenName = order?.canteenId?.name || "Canteen không xác định";
  const canteenLocation = order?.canteenId?.location || "";

  return (
    <div className={clsx("flex h-full flex-col bg-white", className)}>
      {/* Header */}
      <div className="flex items-center justify-between bg-white/90 backdrop-blur px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {allowCollapse && (
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full text-gray-500 transition hover:bg-gray-100"
              onClick={() => panel.collapse()}
              aria-label="Đóng"
            >
              <MaterialIcon name="close" className="text-[22px]" />
            </button>
          )}
          <div>
            <h1 className="text-lg font-bold text-gray-800">
              Chi tiết đơn hàng
            </h1>
            <p className="text-xs text-gray-500">#{orderNumber}</p>
          </div>
        </div>

        {order?.status && (
          <span
            className={clsx(
              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border",
              STATUS_STYLES[order.status] ||
                "bg-gray-100 text-gray-600 border-gray-200",
            )}
          >
            {STATUS_LABELS[order.status] || order.status}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {!order ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Không có dữ liệu đơn hàng</p>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Canteen Info */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                {order.canteenId?.image ? (
                  <img
                    src={order.canteenId.image}
                    alt=""
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <MaterialIcon name="store" size={24} />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{canteenName}</h3>
                {canteenLocation && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MaterialIcon name="location_on" size={12} />
                    {canteenLocation}
                  </p>
                )}
              </div>
            </div>

            {/* Order Time */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MaterialIcon
                name="schedule"
                size={16}
                className="text-gray-400"
              />
              <span>
                Đặt lúc:{" "}
                <strong>
                  {formatDate(order.createdAt, "DD/MM/YYYY HH:mm")}
                </strong>
              </span>
            </div>

            {/* Items List */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Món đã đặt
              </h4>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.lineId}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-300 flex-shrink-0 overflow-hidden">
                      {item.image && item.image !== "default.jpg" ? (
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <MaterialIcon name="restaurant" size={20} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {money(item.price)} x {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-800">
                      {money(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Info */}
            {order.payment && (
              <div className="p-4 bg-blue-50 rounded-xl space-y-2">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">
                  Thanh toán
                </h4>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">Phương thức</span>
                  <span className="font-medium text-blue-800">
                    {PAYMENT_METHOD_LABELS[order.payment.method] ||
                      order.payment.method}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">Trạng thái</span>
                  <span
                    className={clsx(
                      "font-medium",
                      order.payment.status === "completed" ||
                        order.payment.status === "paid"
                        ? "text-green-600"
                        : "text-yellow-600",
                    )}
                  >
                    {order.payment.status === "completed" ||
                    order.payment.status === "paid"
                      ? "Đã thanh toán"
                      : "Chờ thanh toán"}
                  </span>
                </div>
                {order.payment.paidAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-600">Thời gian</span>
                    <span className="text-blue-800">
                      {formatDate(order.payment.paidAt)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Price Summary */}
            <div className="border-t border-dashed border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tạm tính</span>
                <span>{money(order.subTotal || order.totalAmount)}</span>
              </div>
              {/* Discount - always show if exists */}
              {order.discount !== undefined && order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Giảm giá</span>
                  <span>-{money(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-gray-800 pt-2 border-t border-gray-200">
                <span>Tổng cộng</span>
                <span className="text-primary">{money(order.totalAmount)}</span>
              </div>
            </div>

            {/* QR Code for pickup (if ready) */}
            {order.pickupQRCode && order.status === "ready" && (
              <div className="p-4 bg-green-50 rounded-xl text-center">
                <p className="text-sm text-green-700 font-medium mb-2">
                  Mã nhận hàng
                </p>
                <div className="bg-white p-3 rounded-lg inline-block">
                  <p className="font-mono text-lg font-bold text-green-800">
                    {order.pickupQRCode.code?.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <p className="text-xs text-green-600 mt-2">
                  Xuất trình mã này khi nhận hàng
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer - Re-order button (only for completed or cancelled orders) */}
      {order &&
        (order.status === "completed" || order.status === "cancelled") && (
          <div className="bg-white border-t border-gray-100 px-5 py-4">
            <button
              type="button"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-lg transition duration-200 hover:shadow-xl active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #ff5532, #ff6a4a)",
              }}
              onClick={() => {
                // TODO: Implement re-order functionality
                console.log("Re-order:", order);
              }}
            >
              <MaterialIcon name="replay" className="text-[18px]" />
              Đặt lại đơn này
            </button>
          </div>
        )}
    </div>
  );
}
