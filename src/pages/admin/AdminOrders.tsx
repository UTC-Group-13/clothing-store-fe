import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminOrderService, orderStatusService } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import {
  Loader2, ShoppingBag, ChevronLeft, ChevronRight,
  Filter
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const AdminOrders = () => {
  const [page, setPage] = useState(0);
  const [filterStatusId, setFilterStatusId] = useState<number | null>(null);
  const pageSize = 15;

  // Fetch order statuses
  const { data: orderStatuses = [] } = useQuery({
    queryKey: ['order-statuses'],
    queryFn: orderStatusService.getAll,
  });

  // Fetch orders (all or by status)
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin-orders', filterStatusId, page, pageSize],
    queryFn: () =>
      filterStatusId
        ? adminOrderService.getOrdersByStatus(filterStatusId, page, pageSize)
        : adminOrderService.getAllOrders(page, pageSize),
  });

  const orders = ordersData?.content || [];
  const totalPages = ordersData?.totalPages || 0;
  const totalElements = ordersData?.totalElements || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary-600" />
            Quản lý đơn hàng
          </h1>
          <p className="text-sm text-gray-500 mt-1">Tổng cộng {totalElements} đơn hàng</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          <button
            onClick={() => { setFilterStatusId(null); setPage(0); }}
            className={`px-3 py-1.5 text-sm rounded-full font-medium transition ${
              filterStatusId === null
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tất cả
          </button>
          {orderStatuses.map((status) => (
            <button
              key={status.id}
              onClick={() => { setFilterStatusId(status.id); setPage(0); }}
              className={`px-3 py-1.5 text-sm rounded-full font-medium transition ${
                filterStatusId === status.id
                  ? 'bg-primary-600 text-white'
                  : `${STATUS_COLORS[status.status] || 'bg-gray-100 text-gray-600'} hover:opacity-80`
              }`}
            >
              {STATUS_LABELS[status.status] || status.status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3" />
            <p className="text-lg">Không có đơn hàng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Mã đơn</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Khách hàng</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Ngày đặt</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Trạng thái</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Thanh toán</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Vận chuyển</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Tổng tiền</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">SP</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900">
                        #{order.orderCode || order.id}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      ID: {order.userId}
                    </td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.statusName] || 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_LABELS[order.statusName] || order.statusName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-xs">
                      {order.paymentTypeName}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-xs">
                      {order.shippingMethodName}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      {formatPrice(order.orderTotal)}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      {order.items.length}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium text-xs hover:underline"
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Trang {page + 1} / {totalPages} ({totalElements} đơn)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-1.5 rounded border border-gray-300 text-gray-600 hover:bg-white transition disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded border border-gray-300 text-gray-600 hover:bg-white transition disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;

