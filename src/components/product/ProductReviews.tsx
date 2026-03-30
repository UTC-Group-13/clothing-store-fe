import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Loader2, SlidersHorizontal, ChevronDown, Check, Ellipsis, User } from 'lucide-react';
import { reviewService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import type { ReviewResponse } from '../../types';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://160.30.113.40:8080';

const getImageUrl = (url: string | null | undefined) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

const formatRelativeDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// ========== Star Rating Display ==========
const StarRating = ({ rating, size = 'w-4 h-4' }: { rating: number; size?: string }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`${size} ${
          star <= rating
            ? 'text-yellow-400 fill-yellow-400'
            : star - 0.5 <= rating
            ? 'text-yellow-400 fill-yellow-400 opacity-50'
            : 'text-gray-300'
        }`}
      />
    ))}
  </div>
);

// ========== Rating Breakdown Bar ==========
const RatingBar = ({ star, count, total }: { star: number; count: number; total: number }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 w-3 text-right">{star}</span>
      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
    </div>
  );
};

// ========== Single Review Card (Clothing Store style) ==========
const ReviewCard = ({
  review,
  currentUserId,
  onDelete,
  isDeleting,
}: {
  review: ReviewResponse;
  currentUserId: number | null;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}) => {
  const imageUrl = getImageUrl(review.colorImageUrl);

  return (
    <div className="p-5 sm:p-6 border border-gray-200 rounded-2xl space-y-3 relative">
      {/* Rating + menu */}
      <div className="flex items-center justify-between">
        <StarRating rating={review.ratingValue} size="w-[18px] h-[18px]" />
        {currentUserId === review.userId && (
          <button
            onClick={() => onDelete(review.id)}
            disabled={isDeleting}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
            title="Xóa đánh giá"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Ellipsis className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {/* User name + verified */}
      <div className="flex items-center gap-1.5">
        <span className="font-bold text-gray-900">{review.username}</span>
        <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0">
          <Check className="w-3 h-3 text-white" />
        </span>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-gray-600 leading-relaxed text-sm">{review.comment}</p>
      )}

      {/* Variant badge */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            className="w-5 h-5 rounded object-cover border border-gray-200"
          />
        )}
        <span className="flex items-center gap-1">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full border border-gray-300"
            style={{ backgroundColor: review.colorHex }}
          />
          {review.colorName}
        </span>
        {review.sizeLabel && (
          <>
            <span>·</span>
            <span>Size {review.sizeLabel}</span>
          </>
        )}
      </div>

      {/* Date */}
      <p className="text-sm text-gray-400">
        Đăng vào {formatRelativeDate(review.createdAt)}
      </p>
    </div>
  );
};

// ========== Main Component ==========
interface ProductReviewsProps {
  productId: number;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null); // null = all
  const [visibleCount, setVisibleCount] = useState(6);
  const [sortLatest, setSortLatest] = useState(true);

  // Fetch review summary
  const { data: summary } = useQuery({
    queryKey: ['review-summary', productId],
    queryFn: () => reviewService.getSummary(productId),
    enabled: !!productId,
  });

  // Fetch reviews list
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewService.getByProduct(productId),
    enabled: !!productId,
  });

  // Compute rating distribution from reviews
  const ratingCounts = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      if (r.ratingValue >= 1 && r.ratingValue <= 5) counts[r.ratingValue]++;
    });
    return counts;
  }, [reviews]);

  // Filter + sort
  const filteredReviews = useMemo(() => {
    let result = ratingFilter
      ? reviews.filter((r) => r.ratingValue === ratingFilter)
      : reviews;
    if (sortLatest) {
      result = [...result].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      result = [...result].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
    return result;
  }, [reviews, ratingFilter, sortLatest]);

  const visibleReviews = filteredReviews.slice(0, visibleCount);
  const hasMore = visibleCount < filteredReviews.length;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: reviewService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['review-summary', productId] });
      toast.success('Đã xóa đánh giá');
      setDeletingId(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể xóa đánh giá');
      setDeletingId(null);
    },
  });

  const handleDelete = (reviewId: number) => {
    if (window.confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      setDeletingId(reviewId);
      deleteMutation.mutate(reviewId);
    }
  };

  const totalReviews = summary?.totalReviews ?? reviews.length;

  return (
    <div>
      {/* ========== Tab-style heading (Product Details | Reviews | FAQs) ========== */}
      <div className="flex items-center justify-center border-b border-gray-200 mb-8">
        <button className="px-6 sm:px-10 py-4 text-gray-400 font-medium text-sm sm:text-base border-b-2 border-transparent hover:text-gray-600 transition">
          Chi tiết sản phẩm
        </button>
        <button className="px-6 sm:px-10 py-4 font-medium text-sm sm:text-base text-gray-900 border-b-2 border-gray-900 transition">
          Đánh giá ({totalReviews})
        </button>
        <button className="px-6 sm:px-10 py-4 text-gray-400 font-medium text-sm sm:text-base border-b-2 border-transparent hover:text-gray-600 transition">
          Hỏi đáp
        </button>
      </div>

      {/* ========== Header row: "All Reviews" + filter / sort ========== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Tất cả đánh giá
          <span className="text-gray-400 font-normal ml-1 text-lg">({totalReviews})</span>
        </h2>

        <div className="flex items-center gap-3">
          {/* Sort toggle */}
          <button
            onClick={() => setSortLatest((v) => !v)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSortLatest((v) => !v)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
          >
            {sortLatest ? 'Mới nhất' : 'Cũ nhất'}
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========== Rating summary + filter chips ========== */}
      {summary && totalReviews > 0 && (
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Left: big score + stars + breakdown */}
          <div className="md:w-72 shrink-0 space-y-4">
            <div className="flex items-end gap-3">
              <span className="text-5xl font-bold text-gray-900 leading-none">
                {summary.avgRating.toFixed(1)}
              </span>
              <span className="text-gray-500 text-sm mb-1">/ 5</span>
            </div>
            <StarRating rating={Math.round(summary.avgRating)} size="w-5 h-5" />
            <div className="space-y-1.5 pt-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <RatingBar
                  key={star}
                  star={star}
                  count={ratingCounts[star]}
                  total={totalReviews}
                />
              ))}
            </div>
          </div>

          {/* Right: rating filter chips */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setRatingFilter(null); setVisibleCount(6); }}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                  ratingFilter === null
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                Tất cả
              </button>
              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  onClick={() => { setRatingFilter(star); setVisibleCount(6); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition flex items-center gap-1 ${
                    ratingFilter === star
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {star}
                  <Star className={`w-3.5 h-3.5 ${ratingFilter === star ? 'text-yellow-300 fill-yellow-300' : 'text-yellow-400 fill-yellow-400'}`} />
                  <span className="text-xs opacity-70">({ratingCounts[star]})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== Reviews grid (2 cols on desktop) ========== */}
      {reviewsLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <User className="w-14 h-14 mx-auto mb-4 text-gray-300" />
          {ratingFilter ? (
            <>
              <p className="text-lg font-medium">Không có đánh giá {ratingFilter} sao</p>
              <button
                onClick={() => setRatingFilter(null)}
                className="mt-3 text-sm text-primary-600 hover:underline"
              >
                Xem tất cả đánh giá
              </button>
            </>
          ) : (
            <>
              <p className="text-lg font-medium">Chưa có đánh giá nào</p>
              <p className="text-sm mt-1">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={isAuthenticated && user ? user.userId : null}
                onDelete={handleDelete}
                isDeleting={deletingId === review.id}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setVisibleCount((c) => c + 6)}
                className="px-8 py-3 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Xem thêm đánh giá
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductReviews;


