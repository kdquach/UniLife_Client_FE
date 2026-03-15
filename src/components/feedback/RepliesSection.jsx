import { useEffect, useState } from 'react';
import { getFeedbackReplies } from '@/services/feedback.service.js';
import MaterialIcon from '@/components/MaterialIcon.jsx';
import Loader from '@/components/Loader.jsx';
import { formatDate } from '@/utils/formatDate.js';

export default function RepliesSection({ feedbackId }) {
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!feedbackId) return;

        let isMounted = true;

        const fetchReplies = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await getFeedbackReplies(feedbackId, {
                    page: 1,
                    limit: 20,
                    sort: 'createdAt',
                });
                if (!isMounted) return;
                setReplies(Array.isArray(data) ? data : []);
            } catch (err) {
                if (!isMounted) return;
                const message =
                    err.response?.data?.message ||
                    err.message ||
                    'Không thể tải phản hồi. Vui lòng thử lại sau.';
                setError(message);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchReplies();

        return () => {
            isMounted = false;
        };
    }, [feedbackId]);

    if (loading) {
        return (
            <div className="px-6 pb-4">
                <div className="flex items-center gap-2 text-sm text-muted">
                    <Loader size={16} />
                    <span>Đang tải phản hồi...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="px-6 pb-4">
                <div className="rounded-card bg-danger/10 p-3 flex items-start gap-2 text-sm text-danger">
                    <MaterialIcon
                        name="error"
                        className="text-[18px] shrink-0 mt-0.5"
                    />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!replies.length) {
        return (
            <div className="px-6 pb-4">
                <div className="rounded-card bg-surfaceMuted p-3 text-sm text-muted">
                    Chưa có phản hồi từ quản lý.
                </div>
            </div>
        );
    }

    return (
        <div className="px-6 pb-4 space-y-3">
            {replies.map((reply) => (
                <div
                    key={reply._id}
                    className="rounded-card bg-surfaceMuted p-3 flex items-start gap-3"
                >
                    <div className="mt-0.5">
                        <MaterialIcon
                            name="reply"
                            className="text-[18px] text-primary rotate-180"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-sm font-semibold text-text truncate">
                                {reply.userId?.fullName || 'Quản lý'}
                                {reply.userId?.role && (
                                    <span className="ml-2 text-xs font-medium text-primary/80">
                                        ({reply.userId.role})
                                    </span>
                                )}
                            </p>
                            {reply.createdAt && (
                                <p className="text-xs text-muted whitespace-nowrap">
                                    {formatDate(reply.createdAt)}
                                </p>
                            )}
                        </div>
                        <p className="text-sm text-text leading-relaxed wrap-break-word">
                            {reply.reply}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
