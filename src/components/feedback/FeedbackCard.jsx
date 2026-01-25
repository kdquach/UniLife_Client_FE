import { useState, useEffect } from 'react';
import { useFeedback } from '@/hooks/useFeedback.js';
import { useAuth } from '@/hooks/useAuth.js';
import MaterialIcon from '@/components/MaterialIcon.jsx';
import Loader from '@/components/Loader.jsx';
import { formatDate } from '@/utils/formatDate.js';
import RatingStars from './RatingStars';
import SimpleRating from './SimpleRating';

export default function FeedbackCard({ feedback, onFeedbackUpdate }) {
  const { user } = useAuth();
  const { removeFeedback, updateExistingFeedback } = useFeedback();
  console.log('AUTH USER ID:', user?._id);
  console.log('FEEDBACK USER ID:', feedback.userId?._id);

  // const [showReplies, setShowReplies] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [editData, setEditData] = useState({
    rating: Number(feedback.rating) || 5,
    comment: feedback.comment || '',
  });

  // Update editData when feedback changes (after successful update) - only when not editing
  useEffect(() => {
    if (!isEditing) {
      setEditData({
        rating: Number(feedback.rating) || 5,
        comment: feedback.comment || '',
      });
    }
  }, [feedback.rating, feedback.comment, isEditing]);

  const isOwnFeedback = String(user?._id) === String(feedback.userId?._id);

  const isAdmin = user?.role === 'admin';

  const handleDelete = async () => {
    if (!window.confirm('Bạn chắc chắn muốn xóa bình luận này?')) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await removeFeedback(feedback._id);
      // Refetch data immediately after delete
      if (onFeedbackUpdate) {
        setTimeout(onFeedbackUpdate, 300);
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Lỗi khi xóa bình luận';
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (editData.rating < 1 || editData.rating > 5) {
      setUpdateError('Vui lòng chọn đánh giá từ 1-5 sao');
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      await updateExistingFeedback(feedback._id, {
        rating: editData.rating,
        comment: editData.comment.trim(),
      });
      setIsEditing(false);
      // Refetch data immediately after update
      if (onFeedbackUpdate) {
        setTimeout(onFeedbackUpdate, 300);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Lỗi khi cập nhật bình luận';
      setUpdateError(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      rating: feedback.rating,
      comment: feedback.comment || '',
    });
    setIsEditing(false);
    setUpdateError(null);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white hover:shadow-md transition-shadow">
      {/* Header Section */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {feedback.userId?.avatar ? (
            <img
              src={feedback.userId.avatar}
              alt={feedback.userId.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
              <MaterialIcon
                name="person"
                className="text-[18px] text-slate-400"
              />
            </div>
          )}

          {/* User Info */}
          <div>
            <p className="font-semibold text-text">
              {feedback.userId?.fullName || 'Người dùng'}
            </p>
            <p className="text-xs text-muted">
              {formatDate(feedback.createdAt)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {(isOwnFeedback || isAdmin) && !isEditing && (
          <div className="flex gap-1">
            {isOwnFeedback && (
              <button
                onClick={() => setIsEditing(true)}
                title="Chỉnh sửa bình luận"
                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition"
              >
                <MaterialIcon name="edit" className="text-[18px]" />
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              title="Xóa bình luận"
              className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
            >
              <MaterialIcon name="delete" className="text-[18px]" />
            </button>
          </div>
        )}
      </div>

      {/* Rating Section */}
      {!isEditing && (
        <div className="px-6 py-3 bg-gradient-to-r from-orange-50 to-transparent border-b border-slate-100">
          <SimpleRating rating={feedback.rating} size="md" />
        </div>
      )}

      {/* Edit Form */}
      {isEditing && (
        <form onSubmit={handleUpdate} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Đánh giá sản phẩm <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    const newRating = Number(star);
                    console.log('Clicked star:', star, 'newRating:', newRating);
                    setEditData((prev) => {
                      console.log(
                        'Old rating:',
                        prev.rating,
                        'New rating:',
                        newRating
                      );
                      return { ...prev, rating: newRating };
                    });
                  }}
                  className="transition"
                >
                  <MaterialIcon
                    name={
                      Number(editData.rating) >= star ? 'star' : 'star_outline'
                    }
                    className={`text-[32px] ${
                      Number(editData.rating) >= star
                        ? 'text-orange-500'
                        : 'text-slate-300 hover:text-orange-300'
                    } transition`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Bình luận
            </label>
            <textarea
              value={editData.comment}
              onChange={(e) =>
                setEditData({ ...editData, comment: e.target.value })
              }
              placeholder="Chia sẻ ý kiến của bạn về sản phẩm này..."
              maxLength={1000}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition resize-none"
              rows={4}
            />
            <p className="mt-1 text-xs text-muted text-right">
              {editData.comment.length}/1000
            </p>
          </div>

          {updateError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
              <MaterialIcon
                name="error"
                className="text-[20px] text-red-600 shrink-0 mt-0.5"
              />
              <p className="text-sm text-red-600">{updateError}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white hover:bg-primaryHover disabled:bg-slate-400 font-medium transition flex items-center justify-center gap-2"
            >
              {isUpdating ? (
                <>
                  <Loader size={16} />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <MaterialIcon name="check" className="text-[18px]" />
                  Cập nhật
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-6 py-2.5 rounded-lg border border-slate-200 text-text hover:bg-slate-50 font-medium transition"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Content Section */}
      {!isEditing && (
        <div className="px-6 py-4">
          {/* Comment Text */}
          {feedback.comment && (
            <p className="text-text leading-relaxed text-sm">
              {feedback.comment}
            </p>
          )}

          {/* Empty Comment Message */}
          {!feedback.comment && (
            <p className="text-muted italic text-sm">
              Người dùng không có bình luận
            </p>
          )}
        </div>
      )}

      {/* Error Message */}
      {deleteError && (
        <div className="px-6 py-3 bg-red-50 border-t border-red-200 flex items-start gap-2 text-sm text-red-600">
          <MaterialIcon name="error" className="text-[16px] shrink-0 mt-0.5" />
          <p>{deleteError}</p>
        </div>
      )}

      {/* Replies Toggle */}
      {/* {!isEditing && (
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="flex items-center gap-2 text-primary hover:text-primaryHover font-medium transition text-sm"
        >
          <MaterialIcon
            name={showReplies ? 'expand_less' : 'expand_more'}
            className="text-[18px]"
          />
          {showReplies ? 'Ẩn' : 'Xem'} phản hồi
        </button>
      )} */}

      {/* Replies Section */}
      {/* {showReplies && !isEditing && (
        <RepliesSection feedbackId={feedback._id} />
      )} */}
    </div>
  );
}
