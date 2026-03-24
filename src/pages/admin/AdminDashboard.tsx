import { useQuery } from '@tanstack/react-query';
import { adminOrderService, productService, orderStatusService } from '../../services/api';
import {
  ShoppingBag, Package, DollarSign, Clock,
  Loader2, TrendingUp, AlertCircle
} from 'lucide-react';
import { formatPrice } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import type { OrderDetail } from '../../types';

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

const AdminDashboard = () => {
  // Fetch all orders (first page)
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders', 0, 100],
    queryFn: () => adminOrderService.getAllOrders(0, 100),
  });

  // Fetch all products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAllProducts,
  });

  // Fetch order statuses
  const { data: orderStatuses = [] } = useQuery({
    queryKey: ['order-statuses'],
    queryFn: orderStatusService.getAll,
  });

  const isLoading = ordersLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      </div>
    );
  }

  const orders = ordersData?.content || [];
  const totalOrders = ordersData?.totalElements || 0;
  const totalRevenue = orders
    .filter((o: OrderDetail) => o.statusName !== 'CANCELLED')
    .reduce((sum: number, o: OrderDetail) => sum + o.orderTotal, 0);
  const pendingOrders = orders.filter((o: OrderDetail) => o.statusName === 'PENDING').length;
  const totalProducts = products.length;

  // Recent orders (5)
  const recentOrders = [...orders]
    .sort((a: OrderDetail, b: OrderDetail) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 8);

  // Status distribution
  const statusDistribution = orderStatuses.map(status => {
    const count = orders.filter((o: OrderDetail) => o.statusName === status.status).length;
    return { ...status, count };
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
        <p className="text-sm text-gray-500 mt-1">Xin chào! Đây là tổng quan cửa hàng của bạn.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Doanh thu</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatPrice(totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Chờ xác nhận</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingOrders}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            Trạng thái đơn hàng
          </h2>
          <div className="space-y-3">
            {statusDistribution.map((status) => (
              <div key={status.id} className="flex items-center justify-between">
                <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[status.status] || 'bg-gray-100 text-gray-700'}`}>
                  {STATUS_LABELS[status.status] || status.status}
                </span>
                <span className="text-sm font-bold text-gray-700">{status.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary-600" />
              Đơn hàng gần đây
            </h2>
            <Link
              to="/admin/orders"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Xem tất cả →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <AlertCircle className="w-10 h-10 mx-auto mb-2" />
              <p>Chưa có đơn hàng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 font-medium text-gray-500">Mã đơn</th>
                    <th className="text-left py-2 px-2 font-medium text-gray-500">Ngày</th>
                    <th className="text-left py-2 px-2 font-medium text-gray-500">Trạng thái</th>
                    <th className="text-right py-2 px-2 font-medium text-gray-500">Tổng tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2.5 px-2">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="text-primary-600 hover:underline font-medium"
                        >
                          #{order.orderCode || order.id}
                        </Link>
                      </td>
                      <td className="py-2.5 px-2 text-gray-600">{formatDate(order.orderDate)}</td>
                      <td className="py-2.5 px-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[order.statusName] || 'bg-gray-100 text-gray-700'}`}>
                          {STATUS_LABELS[order.statusName] || order.statusName}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-semibold text-gray-800">
                        {formatPrice(order.orderTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

