import React, { useEffect, useState } from "react";
import { getMyOrders } from "@/services/order.service";
import OrderTabs from "@/components/orderHistory/OrderTabs";
import Loader from "@/components/Loader";
import MaterialIcon from "@/components/MaterialIcon";
import { money } from "@/utils/currency";
import { formatDate } from "@/utils/formatDate";
import EmptyState from "@/components/EmptyState";
import { useRightPanel } from "@/store/useRightPanel";

// Mapping màu sắc badge trạng thái
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
    <div className="container mx-auto p-4 max-w-2xl min-h-screen pb-20">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
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
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer active:scale-[0.98] transition-all hover:shadow-md"
            >
              {/* Card Header: Canteen Info & Status */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                    {/* [Defensive UI]: Check canteenId existence */}
                    {order.canteenId?.image ? (
                      <img
                        src={order.canteenId.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <MaterialIcon name="store" size={20} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm line-clamp-1">
                      {order.canteenId?.name || "Canteen không xác định"}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MaterialIcon name="receipt" size={12} />
                      <span>
                        #
                        {order.orderNumber || order._id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${STATUS_STYLES[order.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}
                >
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>

              {/* Card Body: Items Preview */}
              <div className="py-3 border-t border-dashed border-gray-200 text-sm text-gray-600 space-y-2">
                {order.items.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="flex-1 truncate pr-2">
                      <span className="font-semibold text-gray-800 mr-2">
                        {item.quantity}x
                      </span>
                      {item.productName}
                    </span>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p className="text-xs text-gray-400 italic pl-1">
                    + {order.items.length - 2} món khác
                  </p>
                )}
              </div>

              {/* Card Footer: Total & Date */}
              <div className="flex justify-between items-end mt-2 pt-2">
                <span className="text-xs text-gray-400 font-medium">
                  {formatDate(order.createdAt)}
                </span>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-0.5">Tổng tiền</p>
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
        <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-gray-100">
          <button
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            <MaterialIcon name="chevron_left" size={18} /> Trước
          </button>

          <span className="px-3 py-1 bg-gray-100 rounded-md text-sm font-semibold text-gray-700">
            {pagination.page} / {pagination.totalPages}
          </span>

          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            Sau <MaterialIcon name="chevron_right" size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
