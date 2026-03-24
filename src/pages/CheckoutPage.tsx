import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  cartService, shippingService, paymentTypeService,
  shopBankAccountService, orderService, addressService
} from '../services/api';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/helpers';
import type { AddressDTO } from '../types';
import {
  ArrowLeft, Truck, CreditCard, MapPin, Loader2,
  Check, ShieldCheck, Banknote, Building2, StickyNote,
  Plus, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://160.30.113.40:8080';

const getImageUrl = (url: string | null | undefined) => {
  if (!url) return 'https://via.placeholder.com/60x60?text=No+Image';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

const formatAddress = (addr: AddressDTO) => {
  const parts: string[] = [];
  if (addr.unitNumber) parts.push(addr.unitNumber);
  if (addr.streetNumber) parts.push(addr.streetNumber);
  if (addr.addressLine1) parts.push(addr.addressLine1);
  if (addr.addressLine2) parts.push(addr.addressLine2);
  if (addr.region) parts.push(addr.region);
  if (addr.city) parts.push(addr.city);
  if (addr.postalCode) parts.push(addr.postalCode);
  return parts.join(', ');
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  // State.
  const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null);
  const [selectedPaymentTypeId, setSelectedPaymentTypeId] = useState<number | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Address form state.
  const [addressForm, setAddressForm] = useState({
    unitNumber: '',
    streetNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    region: '',
    postalCode: '',
  });

  // Fetch cart
  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
    enabled: isAuthenticated,
  });

  // Fetch shipping methods
  const { data: shippingMethods = [], isLoading: shippingLoading } = useQuery({
    queryKey: ['shipping-methods'],
    queryFn: shippingService.getAll,
  });

  // Fetch payment types (COD, CK…)
  const { data: paymentTypes = [], isLoading: paymentTypesLoading } = useQuery({
    queryKey: ['payment-types'],
    queryFn: paymentTypeService.getAll,
  });

  // Fetch user addresses
  const { data: addresses = [], isLoading: addressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressService.getMyAddresses,
    enabled: isAuthenticated,
  });

  // Fetch shop bank accounts (for bank transfer display)
  const { data: shopBank } = useQuery({
    queryKey: ['shop-bank-active'],
    queryFn: shopBankAccountService.getActive,
  });

  // Add address mutation
  const addAddressMutation = useMutation({
    mutationFn: addressService.addAddress,
    onSuccess: (newAddress) => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setSelectedAddressId(newAddress.id);
      setShowAddressForm(false);
      setAddressForm({
        unitNumber: '',
        streetNumber: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        region: '',
        postalCode: '',
      });
      toast.success('Đã thêm địa chỉ mới');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi thêm địa chỉ');
    },
  });

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: addressService.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Đã xóa địa chỉ');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi xóa địa chỉ');
    },
  });

  // Determine if the selected payment type is "Chuyển khoản" type
  const selectedPaymentType = paymentTypes.find(t => t.id === selectedPaymentTypeId);
  const isBankTransfer = selectedPaymentType?.value?.toLowerCase().includes('chuyển khoản')
    || selectedPaymentType?.value?.toLowerCase().includes('ck')
    || selectedPaymentType?.value?.toLowerCase().includes('bank');

  // Set default shipping
  useEffect(() => {
    if (shippingMethods.length > 0 && !selectedShippingId) {
      setSelectedShippingId(shippingMethods[0].id);
    }
  }, [shippingMethods, selectedShippingId]);

  // Set default payment type
  useEffect(() => {
    if (paymentTypes.length > 0 && !selectedPaymentTypeId) {
      setSelectedPaymentTypeId(paymentTypes[0].id);
    }
  }, [paymentTypes, selectedPaymentTypeId]);

  // Auto-select default or first address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(a => a.isDefault);
      setSelectedAddressId(defaultAddr?.id || addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  // Show address form if user has no addresses
  useEffect(() => {
    if (!addressesLoading && addresses.length === 0) {
      setShowAddressForm(true);
    }
  }, [addresses, addressesLoading]);

  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: orderService.placeOrder,
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đặt hàng thành công!');
      navigate(`/orders/${order.id}`, { state: { justPlaced: true } });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi đặt hàng');
    },
  });

  const selectedShipping = shippingMethods.find(m => m.id === selectedShippingId);
  const shippingFee = selectedShipping?.price || 0;
  const subtotal = cart?.totalAmount || 0;
  const total = subtotal + shippingFee;

  const handleAddAddress = () => {
    if (!addressForm.addressLine1.trim()) {
      toast.error('Vui lòng nhập địa chỉ chi tiết');
      return;
    }
    if (!addressForm.city.trim()) {
      toast.error('Vui lòng nhập tỉnh/thành phố');
      return;
    }

    addAddressMutation.mutate({
      unitNumber: addressForm.unitNumber.trim() || undefined,
      streetNumber: addressForm.streetNumber.trim() || undefined,
      addressLine1: addressForm.addressLine1.trim(),
      addressLine2: addressForm.addressLine2.trim() || undefined,
      city: addressForm.city.trim(),
      region: addressForm.region.trim(),
      postalCode: addressForm.postalCode.trim() || undefined,
      countryId: 1, // Default: Vietnam
    });
  };

  const handleDeleteAddress = (addressId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      if (selectedAddressId === addressId) {
        const remaining = addresses.filter(a => a.id !== addressId);
        setSelectedAddressId(remaining.length > 0 ? remaining[0].id : null);
      }
      deleteAddressMutation.mutate(addressId);
    }
  };

  const handlePlaceOrder = () => {
    if (!selectedAddressId) {
      toast.error('Vui lòng chọn hoặc thêm địa chỉ giao hàng');
      return;
    }
    if (!selectedShippingId) {
      toast.error('Vui lòng chọn phương thức vận chuyển');
      return;
    }
    if (!selectedPaymentTypeId) {
      toast.error('Vui lòng chọn hình thức thanh toán');
      return;
    }

    placeOrderMutation.mutate({
      paymentTypeId: selectedPaymentTypeId,
      shippingAddressId: selectedAddressId,
      shippingMethodId: selectedShippingId,
      note: note.trim() || undefined,
    });
  };

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Loading
  if (cartLoading || shippingLoading || paymentTypesLoading || addressesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    );
  }

  // Empty cart
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Giỏ hàng trống</p>
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
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại giỏ hàng
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Thanh toán</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Checkout Steps */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" />
                <span>1. Địa chỉ giao hàng</span>
              </h2>

              {/* Saved addresses list */}
              {addresses.length > 0 && (
                <div className="space-y-3 mb-4">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition ${
                        selectedAddressId === addr.id
                          ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="w-4 h-4 text-primary-600 mt-1 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-800 text-sm">
                            {formatAddress(addr)}
                          </p>
                          {addr.isDefault && (
                            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium shrink-0">
                              Mặc định
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteAddress(addr.id, e)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition shrink-0"
                        title="Xóa địa chỉ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </label>
                  ))}
                </div>
              )}

              {/* Toggle add address form */}
              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition"
                >
                  <Plus className="w-4 h-4" />
                  Thêm địa chỉ mới
                </button>
              )}

              {/* Add address form */}
              {showAddressForm && (
                <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <h3 className="font-medium text-gray-800 text-sm">Thêm địa chỉ mới</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số nhà / Tòa nhà</label>
                      <input
                        type="text"
                        value={addressForm.unitNumber}
                        onChange={(e) => setAddressForm({ ...addressForm, unitNumber: e.target.value })}
                        placeholder="VD: 12A, Tòa B"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số đường</label>
                      <input
                        type="text"
                        value={addressForm.streetNumber}
                        onChange={(e) => setAddressForm({ ...addressForm, streetNumber: e.target.value })}
                        placeholder="VD: 123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ chi tiết <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressForm.addressLine1}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                      placeholder="Số nhà, tên đường, phường/xã..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ bổ sung</label>
                    <input
                      type="text"
                      value={addressForm.addressLine2}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                      placeholder="Tầng, căn hộ, ghi chú thêm..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                      <input
                        type="text"
                        value={addressForm.region}
                        onChange={(e) => setAddressForm({ ...addressForm, region: e.target.value })}
                        placeholder="Quận 1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tỉnh / Thành phố <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        placeholder="TP. Hồ Chí Minh"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mã bưu điện</label>
                      <input
                        type="text"
                        value={addressForm.postalCode}
                        onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                        placeholder="700000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleAddAddress}
                      disabled={addAddressMutation.isPending}
                      className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {addAddressMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Lưu địa chỉ
                        </>
                      )}
                    </button>
                    {addresses.length > 0 && (
                      <button
                        onClick={() => setShowAddressForm(false)}
                        className="px-4 py-2 text-gray-600 text-sm rounded-lg font-medium hover:bg-gray-100 transition"
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Warning if no address selected */}
              {!selectedAddressId && addresses.length === 0 && !showAddressForm && (
                <p className="text-sm text-red-500 mt-2">
                  Bạn chưa có địa chỉ nào. Vui lòng thêm địa chỉ giao hàng.
                </p>
              )}
            </div>

            {/* 2. Shipping Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary-600" />
                <span>2. Phương thức vận chuyển</span>
              </h2>
              <div className="space-y-3">
                {shippingMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${
                      selectedShippingId === method.id
                        ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={selectedShippingId === method.id}
                        onChange={() => setSelectedShippingId(method.id)}
                        className="w-4 h-4 text-primary-600"
                      />
                      <p className="font-medium text-gray-800">{method.name}</p>
                    </div>
                    <span className="font-semibold text-gray-800">
                      {method.price === 0 ? (
                        <span className="text-green-600">Miễn phí</span>
                      ) : (
                        formatPrice(method.price)
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Payment Type */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-600" />
                <span>3. Hình thức thanh toán</span>
              </h2>
              <div className="space-y-3">
                {paymentTypes.map((type) => {
                  const isCOD = type.value.toLowerCase().includes('cod')
                    || type.value.toLowerCase().includes('nhận hàng');
                  const isBank = type.value.toLowerCase().includes('chuyển khoản')
                    || type.value.toLowerCase().includes('ck')
                    || type.value.toLowerCase().includes('bank');

                  return (
                    <label
                      key={type.id}
                      className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition ${
                        selectedPaymentTypeId === type.id
                          ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentType"
                        checked={selectedPaymentTypeId === type.id}
                        onChange={() => setSelectedPaymentTypeId(type.id)}
                        className="w-4 h-4 text-primary-600 shrink-0"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        {isCOD ? (
                          <Banknote className="w-6 h-6 text-green-600 shrink-0" />
                        ) : isBank ? (
                          <Building2 className="w-6 h-6 text-blue-600 shrink-0" />
                        ) : (
                          <CreditCard className="w-6 h-6 text-gray-500 shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{type.value}</p>
                          {isCOD && (
                            <p className="text-xs text-gray-500">Thanh toán khi nhận hàng</p>
                          )}
                          {isBank && (
                            <p className="text-xs text-gray-500">Chuyển khoản ngân hàng — hiển thị QR sau khi đặt hàng</p>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Bank info preview if bank transfer selected */}
              {isBankTransfer && shopBank && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Thông tin chuyển khoản (hiển thị chi tiết + QR sau khi đặt hàng)
                  </p>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><span className="font-medium">Ngân hàng:</span> {shopBank.bankName}</p>
                    <p><span className="font-medium">Số TK:</span> {shopBank.accountNumber}</p>
                    <p><span className="font-medium">Chủ TK:</span> {shopBank.accountHolderName}</p>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Order Note */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-primary-600" />
                <span>4. Ghi chú đơn hàng</span>
              </h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Giao giờ hành chính, gọi trước khi giao..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              />
            </div>
          </div>

          {/* Right - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Đơn hàng của bạn</h2>

              {/* Cart Items Summary */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={getImageUrl(item.colorImageUrl)}
                      alt={item.productName}
                      className="w-14 h-14 object-cover rounded bg-gray-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500">
                        {item.colorName} {item.sizeLabel ? `/ ${item.sizeLabel}` : ''} × {item.qty}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 shrink-0">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Selected address summary */}
              {selectedAddressId && addresses.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Giao đến
                  </p>
                  <p className="text-sm text-gray-700">
                    {formatAddress(addresses.find(a => a.id === selectedAddressId)!)}
                  </p>
                </div>
              )}

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tạm tính ({cart.totalItems} sp):</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Vận chuyển:</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-green-600">Miễn phí</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>
                {selectedPaymentType && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Thanh toán:</span>
                    <span className="font-medium">{selectedPaymentType.value}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-800">
                  <span>Tổng cộng:</span>
                  <span className="text-primary-600">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={!selectedAddressId || !selectedShippingId || !selectedPaymentTypeId || placeOrderMutation.isPending}
                className="w-full mt-6 bg-primary-600 text-white py-4 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {placeOrderMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    Đặt hàng
                  </>
                )}
              </button>

              {(!selectedAddressId || !selectedShippingId || !selectedPaymentTypeId) && (
                <p className="text-xs text-red-500 text-center mt-2">
                  {!selectedAddressId && 'Chọn địa chỉ giao hàng. '}
                  {!selectedShippingId && 'Chọn phương thức vận chuyển. '}
                  {!selectedPaymentTypeId && 'Chọn hình thức thanh toán.'}
                </p>
              )}

              <div className="mt-4 text-xs text-gray-400 space-y-1">
                <p className="flex items-center gap-1"><Check className="w-3 h-3" /> Thanh toán an toàn & bảo mật</p>
                <p className="flex items-center gap-1"><Check className="w-3 h-3" /> Đổi trả trong vòng 7 ngày</p>
                <p className="flex items-center gap-1"><Check className="w-3 h-3" /> Hỗ trợ 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

