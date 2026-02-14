import { useState, useEffect, useMemo, useCallback } from 'react';
import { useFeedback } from '@/hooks/useFeedback.js';
import { useAuth } from '@/hooks/useAuth.js';
import MaterialIcon from '@/components/MaterialIcon.jsx';
import Input from '@/components/Input.jsx';
import Loader from '@/components/Loader.jsx';
import FeedbackCard from './FeedbackCard';
import RatingStars from './RatingStars';
import SimpleRating from './SimpleRating';

export default function FeedbackSection({ productId }) {
  const { isAuthenticated } = useAuth();
  const {
    feedbacks,
    ratingStats,
    loading,
    error,
    pagination,
    fetchFeedbacksByProduct,
    fetchProductRatingStats,
    createNewFeedback,
  } = useFeedback();

  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [existingFeedbacks, setExistingFeedbacks] = useState([]);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    orderId: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Fetch feedbacks and stats on mount and when page changes
  useEffect(() => {
    if (productId) {
      fetchFeedbacksByProduct(productId, { page: currentPage, limit: 10 });
      fetchProductRatingStats(productId);
    }
  }, [
    productId,
    currentPage,
    fetchFeedbacksByProduct,
    fetchProductRatingStats,
  ]);

  // Fetch user's completed orders with the product
  const fetchUserCompletedOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const { api } = await import('@/services/axios.config.js');
      const [ordersResponse, feedbacksResponse] = await Promise.all([
        api.get('/orders/my-orders', {
          params: { status: 'completed' },
        }),
        // Lấy tất cả feedbacks của user hiện tại cho sản phẩm này
        api.get('/feedbacks/my-feedbacks', {
          params: { productId },
        }),
      ]);

      console.log('📦 Orders Response:', ordersResponse.data);
      console.log('💬 Feedbacks Response:', feedbacksResponse.data);

      // Parse orders response: { status: 'success', data: { results: [...] } }
      const completedOrders = ordersResponse.data?.data?.results || [];

      // Parse feedbacks response: { success: true, data: [...] }
      const feedbacks = feedbacksResponse.data?.data || [];

      console.log('✅ Completed Orders:', completedOrders.length);
      console.log('✅ Feedbacks:', feedbacks.length);

      const feedbackOrderIds = new Set(
        feedbacks.map((fb) => fb.orderId?._id || fb.orderId)
      );

      // Lưu existing feedbacks để check sau
      setExistingFeedbacks(feedbacks);

      // Filter orders: có sản phẩm này VÀ chưa feedback
      const ordersWithProduct = completedOrders.filter((order) => {
        const hasProduct = order.items?.some(
          (item) =>
            item.productId?._id === productId || item.productId === productId
        );
        const notFeedbackYet = !feedbackOrderIds.has(order._id);

        console.log(`🔍 Order ${order.orderNumber}:`, {
          hasProduct,
          notFeedbackYet,
          included: hasProduct && notFeedbackYet,
        });

        return hasProduct && notFeedbackYet;
      });

      console.log(
        '✅ Orders with product (not feedbacked):',
        ordersWithProduct.length
      );

      setUserOrders(ordersWithProduct);

      // Auto-select first order if only one available
      if (ordersWithProduct.length === 1) {
        setFormData((prev) => ({ ...prev, orderId: ordersWithProduct[0]._id }));
      } else if (ordersWithProduct.length === 0) {
        // Nếu không còn order nào để feedback, clear orderId
        setFormData((prev) => ({ ...prev, orderId: null }));
      }
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      console.error('❌ Error details:', err.response?.data || err.message);
      setUserOrders([]);
      setExistingFeedbacks([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [productId]);

  // Fetch user's completed orders when form is shown
  useEffect(() => {
    if (showForm && isAuthenticated) {
      // Luôn refetch để đảm bảo có data mới nhất (có thể đã feedback từ Order History)
      fetchUserCompletedOrders();
    }
  }, [showForm, isAuthenticated, fetchUserCompletedOrders]);

  // Cleanup: Reset orders khi productId thay đổi để tránh hiển thị data cũ
  useEffect(() => {
    setUserOrders([]);
    setExistingFeedbacks([]);
    setFormData({ rating: 5, comment: '', orderId: null });
  }, [productId]);

  // Calculate average rating from distribution
  const normalizedDistribution = useMemo(() => {
    const dist = ratingStats?.distribution;
    if (!dist) return null;

    // API may return object { "5": 10, ... } or array [{ rating: 5, count: 10 }, ...]
    if (Array.isArray(dist)) {
      const map = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      for (const item of dist) {
        const r = Number(item?.rating);
        const c = Number(item?.count ?? item?.total ?? 0);
        if (r >= 1 && r <= 5) map[r] = c;
      }
      return map;
    }

    if (typeof dist === 'object') {
      return dist;
    }

    return null;
  }, [ratingStats?.distribution]);

  const avgRating = useMemo(() => {
    if (!ratingStats) return 0;

    const directAvg = Number(ratingStats?.avgRating);
    if (Number.isFinite(directAvg) && directAvg > 0) {
      return Number(directAvg.toFixed(1));
    }

    const totalReviews = Number(ratingStats?.totalReviews ?? 0);
    if (!normalizedDistribution || totalReviews <= 0) return 0;

    let sum = 0;
    for (const [rating, count] of Object.entries(normalizedDistribution)) {
      sum += Number(rating) * Number(count);
    }
    return Number((sum / totalReviews).toFixed(1));
  }, [ratingStats, normalizedDistribution]);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setSubmitError('Vui lòng đăng nhập để bình luận');
      return;
    }

    if (!formData.orderId) {
      setSubmitError('Bạn cần chọn đơn hàng đã mua sản phẩm này để đánh giá');
      return;
    }

    if (formData.rating < 1 || formData.rating > 5) {
      setSubmitError('Vui lòng chọn đánh giá từ 1-5 sao');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await createNewFeedback({
        productId,
        orderId: formData.orderId,
        rating: formData.rating,
        comment: formData.comment.trim(),
      });

      // Reset form
      setFormData({ rating: 5, comment: '', orderId: null });
      setShowForm(false);

      // Reset pagination and re-fetch feedbacks list
      setCurrentPage(1);
      // Refetch stats
      await fetchProductRatingStats(productId);
      // QUAN TRỌNG: Refetch orders để cập nhật dropdown (loại bỏ order vừa feedback)
      await fetchUserCompletedOrders();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Không thể gửi bình luận. Vui lòng thử lại.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-12 rounded-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text mb-2">
            Bình luận & đánh giá
          </h2>
          <p className="text-muted">
            {ratingStats?.totalReviews || 0} đánh giá từ khách hàng
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-card bg-primary text-inverse hover:bg-primaryHover transition font-medium shadow-card"
        >
          <MaterialIcon name="rate_review" className="text-[18px]" />
          Viết bình luận
        </button>
      </div>

      {/* Rating Summary */}
      {ratingStats && ratingStats.totalReviews > 0 && (
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="px-6 py-8 flex items-center justify-center border-r-4 border-divider">
            <div className="flex flex-col items-center text-center">
              <p className="mt-3 text-sm font-semibold text-muted">
                <span className="text-4xl text-black">{avgRating}</span> trên 5
              </p>

              <div className="mt-2">
                <RatingStars rating={avgRating} size="lg" showValue={false} />
              </div>

              <p className="mt-3 text-sm text-muted">
                Dựa trên {ratingStats.totalReviews} đánh giá
              </p>
            </div>
          </div>

          {/* Rating Distribution */}
          {normalizedDistribution && (
            <div className="md:col-span-2 lg:col-span-2 p-6">
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = Number(normalizedDistribution?.[star] ?? 0);
                  const percentage =
                    Number(ratingStats?.totalReviews ?? 0) > 0
                      ? (count / Number(ratingStats.totalReviews)) * 100
                      : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="flex items-center gap-1 whitespace-nowrap text-sm font-medium text-text">
                        {star}
                        <MaterialIcon
                          name="star"
                          filled
                          className="text-[14px] text-warning"
                        />
                      </span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-warning transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted whitespace-nowrap">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feedback Form */}
      {showForm && (
        <form
          onSubmit={handleSubmitFeedback}
          className="mb-8 rounded-card bg-surfaceMuted p-6 shadow-card"
        >
          <h3 className="text-lg font-semibold text-text mb-6 flex items-center gap-2">
            <MaterialIcon
              name="rate_review"
              className="text-[24px] text-warning"
            />
            {isAuthenticated
              ? 'Chia sẻ đánh giá của bạn'
              : 'Vui lòng đăng nhập để bình luận'}
          </h3>

          <div className="space-y-5">
            {/* Order Selection */}
            {isAuthenticated && (
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Chọn đơn hàng <span className="text-danger">*</span>
                </label>
                {ordersLoading ? (
                  <div className="flex items-center gap-2 text-muted text-sm">
                    <Loader size={16} />
                    Đang tải đơn hàng của bạn...
                  </div>
                ) : userOrders.length > 0 ? (
                  <select
                    value={formData.orderId || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        orderId: e.target.value,
                      }))
                    }
                    className="w-full rounded-card bg-surface px-4 py-2.5 text-text shadow-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                  >
                    <option value="">-- Chọn đơn hàng --</option>
                    {userOrders.map((order) => (
                      <option key={order._id} value={order._id}>
                        {order.orderNumber} - Ngày{' '}
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="rounded-card bg-warning/10 p-3 flex items-start gap-2 text-sm text-warning shadow-card">
                    <MaterialIcon
                      name="info"
                      className="text-[16px] shrink-0 mt-0.5"
                    />
                    <p>
                      {existingFeedbacks.length > 0
                        ? 'Bạn đã đánh giá sản phẩm này trong tất cả các đơn hàng có sản phẩm này rồi.'
                        : 'Bạn chỉ có thể đánh giá sản phẩm này sau khi có đơn hàng đã hoàn thành chứa sản phẩm này.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Rating Input */}
            <div>
              <label className="block text-sm font-medium text-text mb-3">
                Đánh giá sản phẩm <span className="text-danger">*</span>
              </label>
              <div className="flex items-center gap-3 bg-surface p-4 rounded-card shadow-card">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, rating: star }))
                    }
                    className="transition transform hover:scale-110"
                  >
                    <MaterialIcon
                      name="star"
                      filled
                      className={`text-[32px] ${
                        formData.rating >= star
                          ? 'text-warning'
                          : 'text-warning/25 hover:text-warning/50'
                      } transition`}
                    />
                  </button>
                ))}
                {formData.rating > 0 && (
                  <span className="ml-2 text-sm font-medium text-muted">
                    {formData.rating} sao
                  </span>
                )}
              </div>
            </div>

            {/* Comment Input */}
            <div>
              <label className="block text-sm font-medium text-text mb-3">
                Bình luận
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, comment: e.target.value }))
                }
                placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
                maxLength={1000}
                className="w-full rounded-card bg-surface px-4 py-3 text-text placeholder:text-muted shadow-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition resize-none"
                rows={4}
              />
              <p className="mt-2 text-xs text-muted text-right">
                {formData.comment.length}/1000 ký tự
              </p>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="rounded-card bg-danger/10 p-4 flex items-start gap-3 shadow-card">
                <MaterialIcon
                  name="error"
                  className="text-[20px] text-danger shrink-0 mt-0.5"
                />
                <p className="text-sm text-danger">{submitError}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !formData.orderId}
                className="flex-1 px-4 py-3 rounded-lg bg-primary text-inverse hover:bg-primaryHover disabled:bg-surfaceMuted disabled:text-muted font-medium transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader size={16} />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <MaterialIcon name="send" className="text-[18px]" />
                    Gửi đánh giá
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setSubmitError(null);
                }}
                className="px-6 py-3 rounded-card bg-surface shadow-card text-text hover:shadow-lift font-medium transition-all"
              >
                Hủy
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="rounded-card bg-danger/10 p-4 flex items-start gap-3 mb-6 shadow-card">
          <MaterialIcon
            name="error"
            className="text-[20px] text-danger shrink-0 mt-0.5"
          />
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {/* Feedbacks List */}
      {!loading && feedbacks.length > 0 && (
        <div className="space-y-4 mb-8">
          {feedbacks.map((feedback) => (
            <FeedbackCard
              key={feedback._id}
              feedback={feedback}
              productId={productId}
              onFeedbackUpdate={() => {
                fetchFeedbacksByProduct(productId, {
                  page: currentPage,
                  limit: 10,
                });
                fetchProductRatingStats(productId);
              }}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && feedbacks.length === 0 && (
        <div className="rounded-card bg-surfaceMuted p-12 text-center shadow-card">
          <MaterialIcon
            name="rate_review"
            className="text-[48px] text-muted/40 mb-4 inline-block"
          />
          <p className="text-base text-muted">
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận về sản phẩm
            này!
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-card bg-surface shadow-card text-text hover:shadow-lift disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <MaterialIcon name="chevron_left" className="text-[20px]" />
          </button>

          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-card font-medium transition-all ${
                  currentPage === page
                    ? 'bg-primary text-inverse shadow-lift'
                    : 'bg-surface shadow-card text-text hover:shadow-lift'
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() =>
              setCurrentPage(Math.min(pagination.pages, currentPage + 1))
            }
            disabled={currentPage === pagination.pages}
            className="px-3 py-2 rounded-card bg-surface shadow-card text-text hover:shadow-lift disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <MaterialIcon name="chevron_right" className="text-[20px]" />
          </button>
        </div>
      )}
    </div>
  );
}
