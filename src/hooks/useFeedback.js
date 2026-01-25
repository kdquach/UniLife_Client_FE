import { useState, useCallback } from 'react';
import {
  getAllFeedbacks,
  getFeedbackById,
  getFeedbacksByProduct,
  getProductRatingStats,
  createFeedback,
  updateFeedback,
  deleteFeedback,
} from '@/services/feedback.service';

/**
 * Custom hook for managing feedback and feedback replies
 * @returns {Object} - Feedback state and methods
 */
export function useFeedback() {
  // Feedback state
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [ratingStats, setRatingStats] = useState(null);

  // Reply state
  const [replies, setReplies] = useState([]);

  // Common state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  // ============ Feedback Methods ============

  /**
   * Fetch all feedbacks with pagination
   */
  const fetchAllFeedbacks = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getAllFeedbacks(options);
      setFeedbacks(
        Array.isArray(result.data) ? result.data : result.data?.data || []
      );
      setPagination(result.pagination || null);
      return result;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch feedbacks';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch single feedback by ID
   */
  const fetchFeedbackById = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getFeedbackById(id);
      const fb = result.data?.feedback || result.data;
      setFeedback(fb);
      return fb;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch feedback';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch feedbacks for a specific product
   */
  const fetchFeedbacksByProduct = useCallback(
    async (productId, options = {}) => {
      setLoading(true);
      setError(null);

      try {
        const result = await getFeedbacksByProduct(productId, options);
        setFeedbacks(
          Array.isArray(result.data) ? result.data : result.data?.data || []
        );
        setPagination(result.pagination || null);
        return result;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Failed to fetch product feedbacks';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Fetch rating statistics for a product
   */
  const fetchProductRatingStats = useCallback(async (productId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getProductRatingStats(productId);
      const stats = result.data?.stats || result.data;
      setRatingStats(stats);
      return stats;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch rating stats';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new feedback
   */
  const createNewFeedback = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createFeedback(payload);
      const newFeedback = result.data?.feedback;
      setFeedback(newFeedback);
      setFeedbacks((prev) => [
        {
          ...newFeedback,
          userId: newFeedback.userId || payload.user, // hoặc user từ auth
        },
        ...prev,
      ]);

      return newFeedback;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to create feedback';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update feedback
   */
  const updateExistingFeedback = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateFeedback(id, payload);
      const updated = result.data?.feedback;

      if (updated) {
        setFeedbacks((prev) =>
          prev.map((f) =>
            f._id === id
              ? {
                  ...f,
                  rating: updated.rating,
                  comment: updated.comment,
                }
              : f
          )
        );
      }

      return updated;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to update feedback'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete feedback
   */
  const removeFeedback = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        await deleteFeedback(id);
        setFeedbacks((prev) => prev.filter((f) => f._id !== id));
        if (feedback?._id === id) {
          setFeedback(null);
        }
        return true;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Failed to delete feedback';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [feedback]
  );

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setFeedbacks([]);
    setFeedback(null);
    setReplies([]);
    setRatingStats(null);
    setError(null);
    setPagination(null);
  }, []);

  return {
    // Feedback state
    feedbacks,
    feedback,
    ratingStats,
    replies,
    loading,
    error,
    pagination,

    // Feedback methods
    fetchAllFeedbacks,
    fetchFeedbackById,
    fetchFeedbacksByProduct,
    fetchProductRatingStats,
    createNewFeedback,
    updateExistingFeedback,
    removeFeedback,

    // Utility
    reset,
  };
}
