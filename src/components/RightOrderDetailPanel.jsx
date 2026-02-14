import { useMemo, useState, useEffect } from 'react';
import clsx from 'clsx';
import { toast } from 'sonner';
import { Modal } from 'antd';
import { useRightPanel } from '@/store/rightPanel.store.js';
import { useCartStore } from '@/store/cart.store.js';
import MaterialIcon from '@/components/MaterialIcon.jsx';
import { money } from '@/utils/currency';
import { formatDate } from '@/utils/formatDate';
import PickupQRCode from '@/components/order/PickupQRCode.jsx';
import { reOrder } from '@/services/order.service.js';
import {
  createFeedback,
  getAllFeedbacks,
} from '@/services/feedback.service.js';
import Loader from '@/components/Loader.jsx';

// Status mapping for display
const STATUS_STYLES = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  confirmed: 'bg-info/10 text-info border-info/20',
  preparing: 'bg-primary/10 text-primary border-primary/20',
  ready: 'bg-info/10 text-info border-info/20',
  completed: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-danger/10 text-danger border-danger/20',
};

const STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  preparing: 'Đang chuẩn bị',
  ready: 'Sẵn sàng lấy',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const PAYMENT_METHOD_LABELS = {
  balance: 'Ví UniLife',
  wallet: 'Ví điện tử',
  cash: 'Tiền mặt',
  momo: 'MoMo',
  zalopay: 'ZaloPay',
};

export default function RightOrderDetailPanel({
  className,
  allowCollapse = true,
}) {
  const panel = useRightPanel();
  const cart = useCartStore();
  const order = panel.order || null;

  // Re-order states
  const [reordering, setReordering] = useState(false);
  const [reorderResult, setReorderResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // Feedback states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [existingFeedbacks, setExistingFeedbacks] = useState({});
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  // Kiểm tra feedback đã tồn tại cho order này
  useEffect(() => {
    const fetchExistingFeedbacks = async () => {
      if (!order?._id) return;

      setLoadingFeedbacks(true);
      try {
        const response = await getAllFeedbacks({ orderId: order._id });
        const feedbacks = response.data?.data || response.data || [];

        // Tạo map productId -> feedback để dễ tra cứu
        const feedbackMap = {};
        feedbacks.forEach((fb) => {
          const productId = fb.productId?._id || fb.productId;
          if (productId) {
            feedbackMap[productId] = fb;
          }
        });

        setExistingFeedbacks(feedbackMap);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
      } finally {
        setLoadingFeedbacks(false);
      }
    };

    fetchExistingFeedbacks();
  }, [order?._id]);

  // Xử lý mở modal feedback
  const handleOpenFeedbackModal = (item) => {
    const productId = item.productId?._id || item.productId;

    // Kiểm tra đã feedback chưa
    if (existingFeedbacks[productId]) {
      toast.info('Đã đánh giá', {
        description: 'Bạn đã đánh giá sản phẩm này rồi!',
      });
      return;
    }

    setSelectedProduct(item);
    setFeedbackForm({ rating: 5, comment: '' });
    setShowFeedbackModal(true);
  };

  // Xử lý submit feedback
  const handleSubmitFeedback = async () => {
    if (!selectedProduct || !order?._id) return;

    const productId =
      selectedProduct.productId?._id || selectedProduct.productId;

    if (!productId) {
      toast.error('Lỗi', { description: 'Không xác định được sản phẩm' });
      return;
    }

    setSubmittingFeedback(true);
    try {
      await createFeedback({
        orderId: order._id,
        productId: productId,
        rating: feedbackForm.rating,
        comment: feedbackForm.comment.trim(),
      });

      toast.success('Thành công', {
        description: 'Cảm ơn bạn đã đánh giá sản phẩm!',
      });

      // Cập nhật existingFeedbacks để không cho đánh giá lại
      setExistingFeedbacks((prev) => ({
        ...prev,
        [productId]: {
          rating: feedbackForm.rating,
          comment: feedbackForm.comment,
        },
      }));

      setShowFeedbackModal(false);
      setSelectedProduct(null);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể gửi đánh giá. Vui lòng thử lại.';
      toast.error('Lỗi', { description: message });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Handle re-order
  const handleReOrder = async () => {
    if (!order?._id) return;

    // Lấy canteenId từ order vì BE yêu cầu currentCanteenId
    const currentCanteenId = order.canteenId?._id || order.canteenId;

    if (!currentCanteenId) {
      toast.error('Không thể đặt lại', {
        description: 'Thiếu thông tin Canteen.',
      });
      return;
    }

    setReordering(true);
    try {
      const response = await reOrder(order._id, currentCanteenId);
      const { successItems, failedItems } = response.data;

      // Reload cart để cập nhật UI
      await cart.reloadCart();

      if (failedItems && failedItems.length > 0) {
        // Có món thất bại -> hiện modal chi tiết
        setReorderResult({ successItems, failedItems });
        setShowResultModal(true);
      } else {
        // Tất cả thành công
        toast.success('Đã thêm vào giỏ hàng', {
          description: `${successItems.length} món đã được thêm thành công!`,
        });
        panel.openCart(); // Mở cart panel
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Có lỗi xảy ra khi đặt lại đơn hàng';
      toast.error('Không thể đặt lại', { description: message });
    } finally {
      setReordering(false);
    }
  };

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
    order?.orderNumber || order?._id?.slice(-6).toUpperCase() || '---';
  const canteenName = order?.canteenId?.name || 'Canteen không xác định';
  const canteenLocation = order?.canteenId?.location || '';

  return (
    <div className={clsx('flex h-full flex-col bg-white', className)}>
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
              'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border',
              STATUS_STYLES[order.status] ||
                'bg-gray-100 text-gray-600 border-gray-200'
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
              <div className="w-12 h-12 rounded-full bg-surfaceMuted flex items-center justify-center text-muted shrink-0">
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
                Đặt lúc:{' '}
                <strong>
                  {formatDate(order.createdAt, 'DD/MM/YYYY HH:mm')}
                </strong>
              </span>
            </div>

            {/* Items List */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Món đã đặt
              </h4>
              <div className="space-y-3">
                {items.map((item) => {
                  const productId = item.productId?._id || item.productId;
                  const hasFeedback = existingFeedbacks[productId];
                  const isCompleted = order.status === 'completed';

                  return (
                    <div
                      key={item.lineId}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="w-12 h-12 rounded-card bg-surfaceMuted flex items-center justify-center text-muted shrink-0 overflow-hidden">
                        {item.image && item.image !== 'default.jpg' ? (
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
                        {/* Hiển thị trạng thái đã đánh giá */}
                        {isCompleted && hasFeedback && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                            <MaterialIcon name="check_circle" size={12} />
                            <span>Đã đánh giá</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="font-semibold text-gray-800">
                          {money(item.lineTotal)}
                        </span>
                        {/* Nút đánh giá chỉ hiển thị khi completed và chưa feedback */}
                        {isCompleted && !hasFeedback && !loadingFeedbacks && (
                          <button
                            type="button"
                            onClick={() => handleOpenFeedbackModal(item)}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded-md transition"
                          >
                            <MaterialIcon name="rate_review" size={14} />
                            Đánh giá
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
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
                      'font-medium',
                      order.payment.status === 'completed' ||
                        order.payment.status === 'paid'
                        ? 'text-green-600'
                        : 'text-yellow-600'
                    )}
                  >
                    {order.payment.status === 'completed' ||
                    order.payment.status === 'paid'
                      ? 'Đã thanh toán'
                      : 'Chờ thanh toán'}
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
              {/* Tax - tính 8% trên subtotal */}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Thuế (8%)</span>
                <span>
                  {money(
                    order.tax || order.taxAmount || (order.subTotal || 0) * 0.08
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-800 pt-2 border-t border-gray-200">
                <span>Tổng cộng</span>
                <span className="text-primary">{money(order.totalAmount)}</span>
              </div>
            </div>

            {/* QR Code for pickup - hiển thị theo BE logic */}
            {(order.status === 'pending' ||
              order.status === 'confirmed' ||
              order.status === 'preparing' ||
              order.status === 'ready') && (
              <PickupQRCode
                orderId={order._id}
                pickupCode={order.pickupQRCode?.code || order.orderNumber}
                size={140}
              />
            )}
          </div>
        )}
      </div>

      {/* Footer - Re-order button (only for completed or cancelled orders) */}
      {order &&
        (order.status === 'completed' || order.status === 'cancelled') && (
          <div className="bg-surface border-t border-divider px-5 py-4">
            <button
              type="button"
              disabled={reordering}
              className={clsx(
                'flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-inverse bg-primary shadow-card transition duration-200',
                reordering
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:bg-primaryHover hover:shadow-lift active:scale-[0.98]'
              )}
              onClick={handleReOrder}
            >
              {reordering ? (
                <>
                  <span className="animate-spin">
                    <MaterialIcon
                      name="progress_activity"
                      className="text-[18px]"
                    />
                  </span>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <MaterialIcon name="replay" className="text-[18px]" />
                  Đặt lại đơn này
                </>
              )}
            </button>
          </div>
        )}

      {/* Re-order Result Modal */}
      <Modal
        open={showResultModal}
        onCancel={() => setShowResultModal(false)}
        footer={null}
        centered
        width={480}
        title={
          <div className="flex items-center gap-2">
            <MaterialIcon name="info" className="text-blue-500" />
            <span>Kết quả đặt lại đơn</span>
          </div>
        }
      >
        {reorderResult && (
          <div className="space-y-4">
            {/* Success items */}
            {reorderResult.successItems?.length > 0 && (
              <div className="p-3 bg-green-50 rounded-xl">
                <p className="text-sm font-semibold text-green-700 mb-2">
                  ✓ Đã thêm {reorderResult.successItems.length} món:
                </p>
                <ul className="text-sm text-green-600 space-y-1">
                  {reorderResult.successItems.map((name, i) => (
                    <li key={i}>• {name}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Failed items */}
            {reorderResult.failedItems?.length > 0 && (
              <div className="p-3 bg-red-50 rounded-xl">
                <p className="text-sm font-semibold text-red-700 mb-2">
                  ✗ Không thể thêm {reorderResult.failedItems.length} món:
                </p>
                <ul className="text-sm text-red-600 space-y-1">
                  {reorderResult.failedItems.map((item, i) => (
                    <li key={i}>
                      • <strong>{item.name}</strong>: {item.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              className="w-full h-10 rounded-lg bg-primary text-white text-sm font-semibold"
              onClick={() => {
                setShowResultModal(false);
                panel.openCart();
              }}
            >
              Xem giỏ hàng
            </button>
          </div>
        )}
      </Modal>

      {/* Feedback Modal */}
      <Modal
        open={showFeedbackModal}
        onCancel={() => {
          if (!submittingFeedback) {
            setShowFeedbackModal(false);
            setSelectedProduct(null);
          }
        }}
        footer={null}
        centered
        width={480}
        title={
          <div className="flex items-center gap-2">
            <MaterialIcon name="rate_review" className="text-warning" />
            <span>Đánh giá sản phẩm</span>
          </div>
        }
      >
        {selectedProduct && (
          <div className="space-y-4">
            {/* Product Info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 rounded-card bg-surfaceMuted flex items-center justify-center overflow-hidden shrink-0">
                {selectedProduct.image &&
                selectedProduct.image !== 'default.jpg' ? (
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <MaterialIcon name="restaurant" size={20} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">
                  {selectedProduct.productName}
                </p>
                <p className="text-xs text-gray-500">
                  {money(selectedProduct.price)} x {selectedProduct.quantity}
                </p>
              </div>
            </div>

            {/* Rating Stars */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đánh giá <span className="text-danger">*</span>
              </label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setFeedbackForm((prev) => ({ ...prev, rating: star }))
                    }
                    className="transition transform hover:scale-110"
                    disabled={submittingFeedback}
                  >
                    <MaterialIcon
                      name="star"
                      filled
                      className={`text-[28px] ${
                        feedbackForm.rating >= star
                          ? 'text-warning'
                          : 'text-warning/25 hover:text-warning/50'
                      } transition`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm font-medium text-gray-600">
                  {feedbackForm.rating} sao
                </span>
              </div>
            </div>

            {/* Comment Textarea */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bình luận
              </label>
              <textarea
                value={feedbackForm.comment}
                onChange={(e) =>
                  setFeedbackForm((prev) => ({
                    ...prev,
                    comment: e.target.value,
                  }))
                }
                placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
                maxLength={1000}
                disabled={submittingFeedback}
                className="w-full rounded-xl bg-gray-50 px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition resize-none"
                rows={4}
              />
              <p className="mt-1 text-xs text-gray-500 text-right">
                {feedbackForm.comment.length}/1000 ký tự
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleSubmitFeedback}
                disabled={submittingFeedback}
                className={clsx(
                  'flex-1 px-4 py-3 rounded-xl text-white font-semibold transition flex items-center justify-center gap-2',
                  submittingFeedback
                    ? 'bg-primary/70 cursor-not-allowed'
                    : 'bg-primary hover:bg-primaryHover'
                )}
              >
                {submittingFeedback ? (
                  <>
                    <Loader size={16} />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <MaterialIcon name="send" size={18} />
                    Gửi đánh giá
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFeedbackModal(false);
                  setSelectedProduct(null);
                }}
                disabled={submittingFeedback}
                className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition disabled:opacity-50"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
