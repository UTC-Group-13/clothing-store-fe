import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/helpers';
import {
  ArrowLeft, Package, Truck, CreditCard, MapPin,
  Loader2, XCircle, CheckCircle2, Clock, RotateCcw,
  Building2, QrCode, Copy
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:8080';

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

const getStatusInfo = (statusName: string) => {
  return STATUS_CONFIG[statusName] || { label: statusName, color: 'text-gray-700', bg: 'bg-gray-100', icon: Package };
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

const STATUS_STEPS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

const copyToClipboard = (text: string, label: string) => {
  navigator.clipboard.writeText(text);
  toast.success(`Đã sao chép ${label}`);
};

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const justPlaced = (location.state as any)?.justPlaced === true;

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(Number(id)),
    enabled: !!id && isAuthenticated,
  });

  const cancelMutation = useMutation({
    mutationFn: () => orderService.cancelOrder(Number(id)),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(['order', id], updatedOrder);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Đã hủy đơn hàng thành công');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể hủy đơn hàng');
    },
  });

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      cancelMutation.mutate();
    }
  };

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

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">Không tìm thấy đơn hàng</p>
          <Link to="/orders" className="text-primary-600 hover:underline">
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.statusName);
  const StatusIcon = statusInfo.icon;
  const isCancelled = order.statusName === 'CANCELLED';
  const currentStepIndex = isCancelled ? -1 : STATUS_STEPS.indexOf(order.statusName);

  // Determine if bank transfer
  const isBankTransfer = order.paymentTypeName?.toLowerCase().includes('chuyển khoản')
    || order.paymentTypeName?.toLowerCase().includes('ck')
    || order.paymentTypeName?.toLowerCase().includes('bank')
    || !!order.qrUrl;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại đơn hàng
          </Link>

          {/* Just placed success banner */}
          {justPlaced && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
              <div>
                <p className="font-semibold text-green-800">Đặt hàng thành công!</p>
                <p className="text-sm text-green-700">
                  {isBankTransfer
                    ? 'Vui lòng chuyển khoản theo thông tin bên dưới để hoàn tất.'
                    : 'Đơn hàng của bạn đang được xử lý.'}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                {order.orderCode ? `Đơn hàng #${order.orderCode}` : `Đơn hàng #${order.id}`}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Ngày đặt: {formatDate(order.orderDate)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                <StatusIcon className="w-4 h-4" />
                {statusInfo.label}
              </span>
              {order.statusName === 'PENDING' && (
                <button
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                  className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {cancelMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Hủy đơn
                </button>
              )}
            </div>
          </div>
        </div>

        {/* QR + Bank Info card for bank transfer (prominent position) */}
        {isBankTransfer && !isCancelled && (
          <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Thông tin chuyển khoản
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* QR Code */}
              {order.qrUrl && (
                <div className="flex flex-col items-center">
                  <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm mb-3">
                    <img
                      src={order.qrUrl}
                      alt="QR chuyển khoản"
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <QrCode className="w-4 h-4" />
                    Quét mã QR để chuyển khoản
                  </p>
                </div>
              )}

              {/* Bank details */}
              {order.bankInfo && (
                <div className="space-y-3">
                  {order.bankInfo.logoUrl && (
                    <img
                      src={order.bankInfo.logoUrl}
                      alt={order.bankInfo.bankName}
                      className="h-10 object-contain"
                    />
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500">Ngân hàng</p>
                        <p className="font-semibold text-gray-800">{order.bankInfo.bankName}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500">Số tài khoản</p>
                        <p className="font-semibold text-gray-800 font-mono">{order.bankInfo.accountNumber}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(order.bankInfo!.accountNumber, 'số tài khoản')}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                        title="Sao chép"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500">Chủ tài khoản</p>
                        <p className="font-semibold text-gray-800">{order.bankInfo.accountHolderName}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(order.bankInfo!.accountHolderName, 'tên chủ TK')}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                        title="Sao chép"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div>
                        <p className="text-xs text-yellow-700">Nội dung chuyển khoản</p>
                        <p className="font-bold text-yellow-800 font-mono">
                          {order.paymentNote || order.orderCode || `DH${order.id}`}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(order.paymentNote || order.orderCode || `DH${order.id}`, 'nội dung CK')}
                        className="p-2 text-yellow-700 hover:bg-yellow-100 rounded-lg transition"
                        title="Sao chép"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                    ⚠️ Vui lòng ghi đúng nội dung chuyển khoản để đơn hàng được xác nhận nhanh hơn.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Timeline */}
        {!isCancelled && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Trạng thái đơn hàng</h2>
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, index) => {
                const stepInfo = getStatusInfo(step);
                const isActive = index <= currentStepIndex;
                const isCurrentStep = index === currentStepIndex;
                const StepIcon = STATUS_CONFIG[step]?.icon || Package;

                return (
                  <div key={step} className="flex-1 flex flex-col items-center relative">
                    {/* Connecting line */}
                    {index > 0 && (
                      <div
                        className={`absolute top-5 right-1/2 w-full h-0.5 -z-0 ${
                          index <= currentStepIndex ? 'bg-primary-600' : 'bg-gray-200'
                        }`}
                      />
                    )}
                    {/* Icon */}
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
                      {stepInfo.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cancelled banner */}
        {isCancelled && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-500 shrink-0" />
            <div>
              <p className="font-medium text-red-700">Đơn hàng đã bị hủy</p>
              <p className="text-sm text-red-600">Tồn kho đã được hoàn trả tự động.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-600" />
                Sản phẩm ({order.items.length})
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                    <Link to={`/product/${item.productId}`}>
                      <img
                        src={getImageUrl(item.colorImageUrl)}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded bg-white"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.productId}`}
                        className="font-medium text-gray-800 hover:text-primary-600 transition truncate block"
                      >
                        {item.productName}
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
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
                      <p className="text-xs text-gray-400 mt-1">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-medium text-gray-800">{formatPrice(item.price)}</p>
                      <p className="text-sm text-gray-500">× {item.qty}</p>
                      <p className="font-bold text-gray-900 mt-1">{formatPrice(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Price Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Tổng quan</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span>
                    {order.shippingFee === 0 ? (
                      <span className="text-green-600">Miễn phí</span>
                    ) : (
                      formatPrice(order.shippingFee)
                    )}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-800">
                  <span>Tổng cộng:</span>
                  <span className="text-primary-600">{formatPrice(order.orderTotal)}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-600" />
                Thanh toán
              </h2>
              <p className="font-medium text-gray-800">{order.paymentTypeName || 'N/A'}</p>
              {order.paymentNote && (
                <p className="text-sm text-gray-500 mt-1">
                  Nội dung CK: <span className="font-mono font-medium">{order.paymentNote}</span>
                </p>
              )}
            </div>

            {/* Shipping Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary-600" />
                Vận chuyển
              </h2>
              <p className="font-medium text-gray-800">{order.shippingMethodName}</p>
              {order.shippingFee > 0 && (
                <p className="text-sm text-gray-500">{formatPrice(order.shippingFee)}</p>
              )}
            </div>

            {/* Shipping Address */}
            {order.shippingAddressDetail && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  Địa chỉ giao hàng
                </h2>
                <div className="text-sm text-gray-600 space-y-1">
                  {order.shippingAddressDetail.unitNumber && (
                    <p>{order.shippingAddressDetail.unitNumber}</p>
                  )}
                  {order.shippingAddressDetail.streetNumber && (
                    <p>{order.shippingAddressDetail.streetNumber}</p>
                  )}
                  <p>{order.shippingAddressDetail.addressLine1}</p>
                  {order.shippingAddressDetail.addressLine2 && (
                    <p>{order.shippingAddressDetail.addressLine2}</p>
                  )}
                  <p>
                    {order.shippingAddressDetail.city}
                    {order.shippingAddressDetail.region && `, ${order.shippingAddressDetail.region}`}
                  </p>
                  {order.shippingAddressDetail.postalCode && (
                    <p>Mã bưu điện: {order.shippingAddressDetail.postalCode}</p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              {order.statusName === 'PENDING' && (
                <button
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                  className="w-full py-3 text-red-600 border border-red-300 rounded-lg font-semibold hover:bg-red-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {cancelMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  Hủy đơn hàng
                </button>
              )}
              <Link
                to="/products"
                className="block w-full text-center py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
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

export default OrderDetailPage;

