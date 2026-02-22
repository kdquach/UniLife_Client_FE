import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getMyOrders, getOrderById } from "@/services/order.service";
import OrderTabs from "@/components/orderHistory/OrderTabs";
import Loader from "@/components/Loader";
import MaterialIcon from "@/components/MaterialIcon";
import { money } from "@/utils/currency";
import { formatDate } from "@/utils/formatDate";
import EmptyState from "@/components/EmptyState";
import { useRightPanel } from "@/store/useRightPanel";

// Mapping màu sắc badge trạng thái
const STATUS_STYLES = {
  pending: "bg-warning/10 text-warning",
  confirmed: "bg-info/10 text-info",
  preparing: "bg-primary/10 text-primary",
  ready: "bg-info/10 text-info",
  completed: "bg-success/10 text-success",
  cancelled: "bg-danger/10 text-danger",
};

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  preparing: "Đang chuẩn bị",
  ready: "Sẵn sàng lấy",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const { openOrderDetail } = useRightPanel();
  const location = useLocation();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: activeTab === "all" ? undefined : activeTab,
      };

      const response = await getMyOrders(params);

      if (response.status === "success") {
        setOrders(response.data?.results || []);
        setPagination((prev) => ({
          ...prev,
          ...response.data?.pagination,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi Tab hoặc Page thay đổi
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, pagination.page]);

  useEffect(() => {
    const selectedOrderId = location.state?.orderId;
    if (!selectedOrderId) return;

    let active = true;

    const openOrderFromNotification = async () => {
      const existing = orders.find((item) => String(item._id) === String(selectedOrderId));
      if (existing) {
        openOrderDetail(existing);
        navigate(location.pathname, { replace: true, state: null });
        return;
      }

      try {
        const response = await getOrderById(selectedOrderId);
        const targetOrder = response?.data?.order;
        if (!active || !targetOrder) return;
        openOrderDetail(targetOrder);
      } catch (error) {
        console.error("Failed to open order detail from notification:", error);
      } finally {
        if (active) {
          navigate(location.pathname, { replace: true, state: null });
        }
      }
    };

    openOrderFromNotification();

    return () => {
      active = false;
    };
  }, [location.state, location.pathname, navigate, openOrderDetail, orders]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset về trang 1 khi đổi tab
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="mx-auto min-h-screen pb-20" style={{ maxWidth: 'min(800px, 100%)' }}>
      <h1 className="text-2xl font-bold mb-4 text-text">
        Lịch sử đơn hàng
      </h1>

      {/* Tabs Filter */}
      <OrderTabs active={activeTab} onChange={handleTabChange} />

      {/* Content Area */}
      <div className="mt-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-10">
            <EmptyState
              message="Bạn chưa có đơn hàng nào"
              description={
                activeTab !== "all"
                  ? "Thử chọn trạng thái khác xem sao nhé"
                  : "Hãy đặt món ngay để thưởng thức!"
              }
            />
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              onClick={() => openOrderDetail(order)}
              className="bg-surface p-4 rounded-card shadow-card cursor-pointer active:scale-[0.98] transition-all hover:shadow-lift"
            >
              {/* Card Header: Canteen Info & Status */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surfaceMuted overflow-hidden shrink-0">
                    {/* [Defensive UI]: Check canteenId existence */}
                    {order.canteenId?.image ? (
                      <img
                        src={order.canteenId.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted">
                        <MaterialIcon name="store" size={20} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-text text-sm line-clamp-1">
                      {order.canteenId?.name || "Canteen không xác định"}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-muted">
                      <MaterialIcon name="receipt" size={12} />
                      <span>
                        #
                        {order.orderNumber || order._id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[order.status] || "bg-surfaceMuted text-muted"}`}
                >
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>

              {/* Card Body: Items Preview */}
              <div className="py-3 border-t border-dashed border-divider text-sm text-muted space-y-2">
                {order.items.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="flex-1 truncate pr-2">
                      <span className="font-semibold text-text mr-2">
                        {item.quantity}x
                      </span>
                      {item.productName}
                    </span>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p className="text-xs text-muted italic pl-1">
                    + {order.items.length - 2} món khác
                  </p>
                )}
              </div>

              {/* Card Footer: Total & Date */}
              <div className="flex justify-between items-end mt-2 pt-2">
                <span className="text-xs text-muted font-medium">
                  {formatDate(order.createdAt)}
                </span>
                <div className="text-right">
                  <p className="text-xs text-muted mb-0.5">Tổng tiền</p>
                  <span className="font-bold text-primary text-base">
                    {money(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && orders.length > 0 && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-divider">
          <button
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
            className="px-4 py-2 bg-surface rounded-card shadow-card text-sm font-medium hover:shadow-lift disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
          >
            <MaterialIcon name="chevron_left" size={18} /> Trước
          </button>

          <span className="px-3 py-1 bg-primary text-inverse rounded-full text-sm font-semibold shadow-card">
            {pagination.page} / {pagination.totalPages}
          </span>

          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
            className="px-4 py-2 bg-surface rounded-card shadow-card text-sm font-medium hover:shadow-lift disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
          >
            Sau <MaterialIcon name="chevron_right" size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
