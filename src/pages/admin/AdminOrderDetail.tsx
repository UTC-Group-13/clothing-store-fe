import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminOrderService, orderStatusService } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import {
  ArrowLeft, Loader2, Package, Truck, CreditCard, MapPin,
  Clock, RotateCcw, CheckCircle2, XCircle, Building2,
  QrCode, Copy
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://160.30.113.40:8080';

const getImageUrl = (url: string | null | undefined) => {
  if (!url) return 'https://via.placeholder.com/80x80?text=No+Image';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PENDING: { label: 'Chờ xác nhận', color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Clock },
  PROCESSING: { label: 'Đang xử lý', color: 'text-blue-700', bg: 'bg-blue-100', icon: RotateCcw },
  SHIPPED: { label: 'Đang giao hàng', color: 'text-purple-700', bg: 'bg-purple-100', icon: Truck },
  DELIVERED: { label: 'Đã giao', color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle2 },
  CANCELLED: { label: 'Đã hủy', color: 'text-red-700', bg: 'bg-red-100', icon: XCircle },
};

const STATUS_STEPS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const copyToClipboard = (text: string, label: string) => {
  navigator.clipboard.writeText(text);
  toast.success(`Đã sao chép ${label}`);
};

const AdminOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => adminOrderService.getOrderById(Number(id)),
    enabled: !!id,
  });

  const { data: orderStatuses = [] } = useQuery({
    queryKey: ['order-statuses'],
    queryFn: orderStatusService.getAll,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, statusId }: { orderId: number; statusId: number }) =>
      adminOrderService.updateOrderStatus(orderId, { statusId }),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(['admin-order', id], updatedOrder);
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Đã cập nhật trạng thái đơn hàng');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi cập nhật trạng thái');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-red-500 mb-4">Không tìm thấy đơn hàng</p>
        <Link to="/admin/orders" className="text-primary-600 hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const statusInfo = STATUS_CONFIG[order.statusName] || { label: order.statusName, color: 'text-gray-700', bg: 'bg-gray-100', icon: Package };
  const StatusIcon = statusInfo.icon;
  const isCancelled = order.statusName === 'CANCELLED';
  const currentStepIndex = isCancelled ? -1 : STATUS_STEPS.indexOf(order.statusName);

  const isBankTransfer = order.paymentTypeName?.toLowerCase().includes('chuyển khoản')
    || order.paymentTypeName?.toLowerCase().includes('ck')
    || order.paymentTypeName?.toLowerCase().includes('bank')
    || !!order.qrUrl;

  // Determine possible next statuses
  const getNextStatuses = () => {
    if (isCancelled) return [];
    const results: { id: number; status: string; label: string }[] = [];

    for (const os of orderStatuses) {
      // Cancel is always an option for non-delivered
      if (os.status === 'CANCELLED' && order.statusName !== 'DELIVERED') {
        results.push({ ...os, label: 'Hủy đơn' });
        continue;
      }
      // Only forward transitions
      const nextIdx = STATUS_STEPS.indexOf(os.status);
      if (nextIdx > currentStepIndex) {
        results.push({ ...os, label: STATUS_CONFIG[os.status]?.label || os.status });
      }
    }
    return results;
  };

  const nextStatuses = getNextStatuses();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại đơn hàng
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Đơn hàng #{order.orderCode || order.id}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Đặt ngày {formatDate(order.orderDate)} · Khách hàng ID: {order.userId}
            </p>
          </div>
          <span className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
            <StatusIcon className="w-4 h-4" />
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Status Update Buttons */}
      {nextStatuses.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Cập nhật trạng thái</h2>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((ns) => {
              const isCancel = ns.status === 'CANCELLED';
              return (
                <button
                  key={ns.id}
                  onClick={() => {
                    if (isCancel && !window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
                    updateStatusMutation.mutate({ orderId: order.id, statusId: ns.id });
                  }}
                  disabled={updateStatusMutation.isPending}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition disabled:opacity-50 ${
                    isCancel
                      ? 'bg-red-50 text-red-600 border border-red-300 hover:bg-red-100'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {updateStatusMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                  ) : null}
                  {ns.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Timeline */}
      {!isCancelled && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Tiến trình đơn hàng</h2>
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, index) => {
              const stepConfig = STATUS_CONFIG[step];
              const isActive = index <= currentStepIndex;
              const isCurrentStep = index === currentStepIndex;
              const StepIcon = stepConfig?.icon || Package;

              return (
                <div key={step} className="flex-1 flex flex-col items-center relative">
                  {index > 0 && (
                    <div
                      className={`absolute top-5 right-1/2 w-full h-0.5 -z-0 ${
                        index <= currentStepIndex ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                      isCurrentStep
                        ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                        : isActive
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs mt-2 font-medium ${isActive ? 'text-primary-600' : 'text-gray-400'}`}>
                    {stepConfig?.label || step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancelled banner */}
      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <XCircle className="w-6 h-6 text-red-500 shrink-0" />
          <p className="font-medium text-red-700">Đơn hàng đã bị hủy</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-primary-600" />
              Sản phẩm ({order.items.length})
            </h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={getImageUrl(item.colorImageUrl)}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded bg-white shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{item.productName}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: item.colorHex }} />
                        {item.colorName}
                      </span>
                      {item.sizeLabel && <span>· Size {item.sizeLabel}</span>}
                    </div>
                    <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium">{formatPrice(item.price)}</p>
                    <p className="text-xs text-gray-500">× {item.qty}</p>
                    <p className="text-sm font-bold mt-1">{formatPrice(item.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bank Transfer Info */}
          {isBankTransfer && order.qrUrl && (
            <div className="bg-white rounded-xl shadow-sm border-2 border-blue-200 p-5">
              <h2 className="text-sm font-semibold text-blue-800 mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Thông tin chuyển khoản
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col items-center">
                  <img src={order.qrUrl} alt="QR" className="w-44 h-44 object-contain border rounded-lg p-2" />
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <QrCode className="w-3 h-3" /> QR chuyển khoản
                  </p>
                </div>
                {order.bankInfo && (
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Ngân hàng:</span> <span className="font-medium">{order.bankInfo.bankName}</span></p>
                    <div className="flex items-center justify-between">
                      <p><span className="text-gray-500">Số TK:</span> <span className="font-mono font-medium">{order.bankInfo.accountNumber}</span></p>
                      <button onClick={() => copyToClipboard(order.bankInfo!.accountNumber, 'STK')} className="text-primary-600 hover:text-primary-700"><Copy className="w-3.5 h-3.5" /></button>
                    </div>
                    <p><span className="text-gray-500">Chủ TK:</span> <span className="font-medium">{order.bankInfo.accountHolderName}</span></p>
                    {order.paymentNote && (
                      <div className="flex items-center justify-between bg-yellow-50 p-2 rounded">
                        <p><span className="text-yellow-700 text-xs">Nội dung CK:</span> <span className="font-mono font-bold text-yellow-800">{order.paymentNote}</span></p>
                        <button onClick={() => copyToClipboard(order.paymentNote!, 'nội dung CK')} className="text-yellow-700"><Copy className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right - Summary */}
        <div className="space-y-6">
          {/* Price Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Tổng quan</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển:</span>
                <span>{order.shippingFee === 0 ? <span className="text-green-600">Miễn phí</span> : formatPrice(order.shippingFee)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold text-gray-900">
                <span>Tổng cộng:</span>
                <span className="text-primary-600">{formatPrice(order.orderTotal)}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary-600" /> Thanh toán
            </h2>
            <p className="text-sm font-medium text-gray-800">{order.paymentTypeName}</p>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary-600" /> Vận chuyển
            </h2>
            <p className="text-sm font-medium text-gray-800">{order.shippingMethodName}</p>
          </div>

          {/* Address */}
          {order.shippingAddressDetail && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-600" /> Địa chỉ giao hàng
              </h2>
              <div className="text-sm text-gray-600 space-y-0.5">
                {order.shippingAddressDetail.unitNumber && <p>{order.shippingAddressDetail.unitNumber}</p>}
                {order.shippingAddressDetail.streetNumber && <p>{order.shippingAddressDetail.streetNumber}</p>}
                <p>{order.shippingAddressDetail.addressLine1}</p>
                {order.shippingAddressDetail.addressLine2 && <p>{order.shippingAddressDetail.addressLine2}</p>}
                <p>{order.shippingAddressDetail.city}{order.shippingAddressDetail.region && `, ${order.shippingAddressDetail.region}`}</p>
                {order.shippingAddressDetail.postalCode && <p>Mã bưu điện: {order.shippingAddressDetail.postalCode}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;

