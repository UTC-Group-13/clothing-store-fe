import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Send, X, Loader2 } from 'lucide-react';
import { reviewService } from '../../services/api';
import toast from 'react-hot-toast';

interface WriteReviewModalProps {
  orderLineId: number;
  productName: string;
  colorName: string;
  sizeLabel: string;
  onClose: () => void;
}

const WriteReviewModal = ({
  orderLineId,
  productName,
  colorName,
  sizeLabel,
  onClose,
}: WriteReviewModalProps) => {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');

  const createMutation = useMutation({
    mutationFn: reviewService.create,
    onSuccess: () => {
      // Invalidate mọi review cache để cập nhật khi xem lại sản phẩm
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-summary'] });
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
      toast.success('Đánh giá thành công! Cảm ơn bạn.');
      onClose();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Không thể gửi đánh giá';
      toast.error(msg);
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao');
      return;
    }
    createMutation.mutate({
      orderedProductId: orderLineId,
      ratingValue: rating,
      comment: comment.trim() || undefined,
    });
  };

  const ratingLabels = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Đánh giá sản phẩm</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="font-medium text-gray-800">{productName}</p>
          <p className="text-sm text-gray-500 mt-1">
            {colorName}
            {sizeLabel && ` • Size ${sizeLabel}`}
          </p>
        </div>

        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chất lượng sản phẩm <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-9 h-9 transition-colors ${
                    star <= (hovered || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            {(hovered || rating) > 0 && (
              <span className="ml-3 text-sm font-medium text-gray-600">
                {ratingLabels[hovered || rating]}
              </span>
            )}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nhận xét (tùy chọn)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none transition"
          />
          <p className="text-xs text-gray-400 text-right mt-1">
            {comment.length}/2000
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || createMutation.isPending}
            className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Gửi đánh giá
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WriteReviewModal;

