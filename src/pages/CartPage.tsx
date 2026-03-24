import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/helpers';
import { ShoppingBag, Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { CartItemDetail } from '../types';

const API_BASE_URL = 'http://localhost:8080';

const getImageUrl = (url: string | null | undefined) => {
  if (!url) return 'https://via.placeholder.com/100x100?text=No+Image';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

// Cart Item Component
const CartItemRow = ({ item, onUpdate, onRemove, isUpdating }: {
  item: CartItemDetail;
  onUpdate: (itemId: number, variantStockId: number, qty: number) => void;
  onRemove: (itemId: number) => void;
  isUpdating: boolean;
}) => {
  return (
    <div className="flex gap-4 bg-white p-4 rounded-lg shadow-md">
      <Link to={`/product/${item.productId}`}>
        <img
          src={getImageUrl(item.colorImageUrl)}
          alt={item.productName}
          className="w-24 h-24 object-cover bg-gray-100 rounded"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/product/${item.productId}`} className="hover:text-primary-600 transition">
          <h3 className="font-semibold text-gray-800 mb-1 truncate">{item.productName}</h3>
        </Link>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-full border border-gray-300"
              style={{ backgroundColor: item.colorHex }}
            />
            {item.colorName}
          </span>
          {item.sizeLabel && (
            <>
              <span>•</span>
              <span>Size: {item.sizeLabel}</span>
            </>
          )}
        </div>
        
        <p className="text-primary-600 font-bold">{formatPrice(item.unitPrice)}</p>
        <p className="text-xs text-gray-400">SKU: {item.sku}</p>

        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => onUpdate(item.id, item.variantStockId, item.qty - 1)}
            disabled={item.qty <= 1 || isUpdating}
            className="p-1 rounded bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
          >
            <Minus className="w-4 h-4" />
          </button>

          <span className="font-semibold min-w-[2rem] text-center">
            {item.qty}
          </span>

          <button
            onClick={() => onUpdate(item.id, item.variantStockId, item.qty + 1)}
            disabled={item.qty >= item.availableStock || isUpdating}
            className="p-1 rounded bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>

          {item.availableStock < 10 && (
            <span className="text-xs text-orange-500">Còn {item.availableStock}</span>
          )}

          <button
            onClick={() => onRemove(item.id)}
            disabled={isUpdating}
            className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded transition disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="text-lg font-bold text-gray-800">
          {formatPrice(item.subtotal)}
        </p>
      </div>
    </div>
  );
};

const CartPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  // Fetch server cart
  const { data: cart, isLoading, error } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
    enabled: isAuthenticated,
  });

  // Update item mutation
  const updateMutation = useMutation({
    mutationFn: ({ itemId, variantStockId, qty }: { itemId: number; variantStockId: number; qty: number }) =>
      cartService.updateItem(itemId, { variantStockId, qty }),
    onSuccess: (data) => {
      queryClient.setQueryData(['cart'], data);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi cập nhật giỏ hàng');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Remove item mutation
  const removeMutation = useMutation({
    mutationFn: (itemId: number) => cartService.removeItem(itemId),
    onSuccess: (data) => {
      queryClient.setQueryData(['cart'], data);
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi xóa sản phẩm');
    },
  });

  // Clear cart mutation
  const clearMutation = useMutation({
    mutationFn: cartService.clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đã xóa toàn bộ giỏ hàng');
    },
  });

  const handleUpdate = (itemId: number, variantStockId: number, qty: number) => {
    if (qty < 1) return;
    updateMutation.mutate({ itemId, variantStockId, qty });
  };

  const handleRemove = (itemId: number) => {
    removeMutation.mutate(itemId);
  };

  const isUpdating = updateMutation.isPending || removeMutation.isPending || clearMutation.isPending;

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Vui lòng đăng nhập
          </h2>
          <p className="text-gray-600 mb-6">
            Đăng nhập để xem giỏ hàng của bạn
          </p>
          <Link
            to="/login"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">Lỗi tải giỏ hàng</p>
          <Link
            to="/"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // Empty cart
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Giỏ hàng trống
          </h2>
          <p className="text-gray-600 mb-6">
            Hãy thêm sản phẩm vào giỏ hàng của bạn
          </p>
          <Link
            to="/products"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Giỏ hàng ({cart.totalItems} sản phẩm)
          </h1>
          <button
            onClick={() => clearMutation.mutate()}
            disabled={isUpdating}
            className="text-sm text-red-500 hover:text-red-700 transition disabled:opacity-50"
          >
            Xóa tất cả
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
                isUpdating={isUpdating}
              />
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Tổng đơn hàng
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({cart.totalItems} sản phẩm):</span>
                  <span>{formatPrice(cart.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="text-green-600">Tính khi thanh toán</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-800">
                  <span>Tổng cộng:</span>
                  <span className="text-primary-600">{formatPrice(cart.totalAmount)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition mb-3"
              >
                Tiến hành thanh toán
              </button>

              <Link
                to="/products"
                className="block w-full text-center bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

