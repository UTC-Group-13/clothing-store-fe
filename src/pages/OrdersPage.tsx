import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/helpers';
import { Package, ChevronRight, Loader2, ShoppingBag } from 'lucide-react';
import type { OrderDetail } from '../types';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Chờ xác nhận', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  PROCESSING: { label: 'Đang xử lý', color: 'text-blue-700', bg: 'bg-blue-100' },
  SHIPPED: { label: 'Đang giao hàng', color: 'text-purple-700', bg: 'bg-purple-100' },
  DELIVERED: { label: 'Đã giao', color: 'text-green-700', bg: 'bg-green-100' },
  CANCELLED: { label: 'Đã hủy', color: 'text-red-700', bg: 'bg-red-100' },
};

const getStatusInfo = (statusName: string) => {
  return STATUS_CONFIG[statusName] || { label: statusName, color: 'text-gray-700', bg: 'bg-gray-100' };
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const OrderCard = ({ order }: { order: OrderDetail }) => {
  const statusInfo = getStatusInfo(order.statusName);

  return (
    <Link
      to={`/orders/${order.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-gray-400" />
          <div>
            <p className="font-bold text-gray-800">
              {order.orderCode ? `#${order.orderCode}` : `Đơn hàng #${order.id}`}
            </p>
            <p className="text-sm text-gray-500">{formatDate(order.orderDate)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {order.paymentTypeName && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
              {order.paymentTypeName}
            </span>
          )}
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Items preview */}
      <div className="space-y-2 mb-4">
        {order.items.slice(0, 2).map((item) => (
          <div key={item.id} className="flex items-center gap-3 text-sm">
            <span className="text-gray-600 truncate flex-1">
              {item.productName}
              <span className="text-gray-400"> × {item.qty}</span>
            </span>
            <span className="text-gray-800 font-medium shrink-0">{formatPrice(item.subtotal)}</span>
          </div>
        ))}
        {order.items.length > 2 && (
          <p className="text-xs text-gray-400">+{order.items.length - 2} sản phẩm khác</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-sm text-gray-500">
          {order.items.reduce((sum, i) => sum + i.qty, 0)} sản phẩm
          {order.shippingMethodName && ` • ${order.shippingMethodName}`}
        </span>
        <span className="font-bold text-primary-600 text-lg">{formatPrice(order.orderTotal)}</span>
      </div>
    </Link>
  );
};

const OrdersPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: orderService.getMyOrders,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">Lỗi tải đơn hàng</p>
          <button
            onClick={() => navigate('/')}
            className="text-primary-600 hover:underline"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Đơn hàng của tôi</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Chưa có đơn hàng nào</h2>
            <p className="text-gray-600 mb-6">Hãy mua sắm và đặt hàng ngay!</p>
            <Link
              to="/products"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;

