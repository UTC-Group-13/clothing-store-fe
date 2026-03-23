import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Minus, Plus, ShoppingCart, Check } from 'lucide-react';
import { productService, productVariantService, variantStockService, colorService, sizeService } from '../services/api';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);

  // State
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fetch all colors (for mapping)
  const { data: allColors = [] } = useQuery({
    queryKey: ['colors'],
    queryFn: colorService.getAllColors,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });

  // Fetch all sizes (for mapping)
  const { data: allSizes = [] } = useQuery({
    queryKey: ['sizes'],
    queryFn: sizeService.getAllSizes,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });

  // Create maps for quick lookup
  const colorsMap = useMemo(() => {
    return new Map(allColors.map(color => [color.id, color]));
  }, [allColors]);

  const sizesMap = useMemo(() => {
    return new Map(allSizes.map(size => [size.id, size]));
  }, [allSizes]);

  // 1. Fetch product details
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(Number(id)),
    enabled: !!id,
  });

  // 2. Fetch product variants (colors)
  const { data: variants = [], isLoading: variantsLoading } = useQuery({
    queryKey: ['product-variants', id],
    queryFn: () => productVariantService.getByProductId(Number(id)),
    enabled: !!id,
  });

  // Set default variant when variants load
  useMemo(() => {
    if (variants.length > 0 && !selectedVariantId) {
      const defaultVariant = variants.find(v => v.isDefault) || variants[0];
      setSelectedVariantId(defaultVariant.id);
    }
  }, [variants, selectedVariantId]);

  // 3. Fetch variant stocks (sizes) for selected variant
  const { data: stocks = [], isLoading: stocksLoading } = useQuery({
    queryKey: ['variant-stocks', selectedVariantId],
    queryFn: () => variantStockService.getByVariantId(selectedVariantId!),
    enabled: !!selectedVariantId,
  });

  // Get selected variant
  const selectedVariant = useMemo(() => {
    return variants.find(v => v.id === selectedVariantId);
  }, [variants, selectedVariantId]);

  // Get selected stock (for size)
  const selectedStock = useMemo(() => {
    return stocks.find(s => s.sizeId === selectedSizeId);
  }, [stocks, selectedSizeId]);

  // Calculate final price
  const finalPrice = useMemo(() => {
    if (selectedStock?.priceOverride) {
      return selectedStock.priceOverride;
    }
    return product?.basePrice || 0;
  }, [product, selectedStock]);

  // Parse images from variant
  const productImages = useMemo(() => {
    if (!selectedVariant?.images) {
      return ['https://via.placeholder.com/600x600?text=No+Image'];
    }
    try {
      const parsed = JSON.parse(selectedVariant.images);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [selectedVariant.images];
    }
  }, [selectedVariant]);

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) {
      toast.error('Sản phẩm không tồn tại');
      return;
    }

    if (!selectedVariantId) {
      toast.error('Vui lòng chọn màu sắc');
      return;
    }

    // Chỉ check size nếu sản phẩm có size
    if (stocks.length > 0) {
      if (!selectedSizeId) {
        toast.error('Vui lòng chọn kích thước');
        return;
      }

      if (!selectedStock || selectedStock.stockQty < quantity) {
        toast.error('Không đủ hàng trong kho');
        return;
      }
    }

    // Create cart item
    const selectedColorInfo = colorsMap.get(selectedVariant!.colorId);
    const selectedSizeInfo = selectedSizeId ? sizesMap.get(selectedSizeId) : null;
    
    const cartItem = {
      ...product,
      price: finalPrice,
      basePrice: finalPrice,
      quantity: quantity,
      selectedVariantId,
      selectedSizeId: selectedSizeId || undefined,
      selectedColorName: selectedColorInfo?.name || selectedVariant?.colorName || 'N/A',
      selectedColorHex: selectedColorInfo?.hexCode,
      selectedSizeLabel: selectedSizeInfo?.label || selectedStock?.sizeLabel || undefined,
      selectedSizeType: selectedSizeInfo?.type,
      sku: selectedStock?.sku || `${product.slug}-${selectedVariantId}`,
      image: productImages[0],
      name: product.name,
    };

    addToCart(cartItem);
    toast.success(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`, {
      duration: 3000,
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + '₫';
  };

  const increaseQuantity = () => {
    if (selectedStock) {
      // Nếu có size (có stock), limit bởi stockQty
      if (quantity < selectedStock.stockQty) {
        setQuantity(prev => prev + 1);
      }
    } else {
      // Nếu không có size, cho phép tối đa 99
      if (quantity < 99) {
        setQuantity(prev => prev + 1);
      }
    }
  };

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  // Loading state
  if (productLoading || variantsLoading) {
    return (
      <div className="min-h-screen bg-[#F2F0F1] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F2F0F1] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Không tìm thấy sản phẩm</p>
          <button
            onClick={() => navigate('/products')}
            className="text-gray-900 font-medium hover:underline"
          >
            Quay lại danh sách sản phẩm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F0F1]">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-900">
              Trang chủ
            </Link>
            <span className="text-gray-400">/</span>
            <Link to="/products" className="text-gray-500 hover:text-gray-900">
              Sản phẩm
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-2xl p-8 aspect-square flex items-center justify-center">
              <img
                src={productImages[selectedImageIndex]}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`bg-white rounded-xl p-4 aspect-square flex items-center justify-center border-2 transition ${
                      selectedImageIndex === index
                        ? 'border-gray-900'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="bg-white rounded-2xl p-8 space-y-6">
            {/* Product Name */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Brand & Material */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  {product.brand}
                </span>
              </div>
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-blue-700">
                  {product.material}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="pb-6 border-b border-gray-200">
              <div className="text-4xl font-bold text-gray-900">
                {formatPrice(finalPrice)}
              </div>
              {selectedStock?.priceOverride && (
                <p className="text-sm text-gray-500 mt-2">
                  Giá đặc biệt cho size/màu này
                </p>
              )}
            </div>

            {/* Color Selection */}
            <div className="space-y-4 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Chọn màu sắc
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                {variants.map((variant) => {
                  const colorInfo = colorsMap.get(variant.colorId);
                  const displayColor = colorInfo?.hexCode || variant.colorHexCode || '#ccc';
                  const displayName = colorInfo?.name || variant.colorName || 'Unknown';
                  
                  return (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setSelectedVariantId(variant.id);
                        setSelectedSizeId(null); // Reset size when color changes
                        setSelectedImageIndex(0);
                      }}
                      className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                        selectedVariantId === variant.id
                          ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-900'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: displayColor }}
                      title={displayName}
                      aria-label={displayName}
                    >
                      {selectedVariantId === variant.id && (
                        <Check className="w-6 h-6 text-white absolute inset-0 m-auto drop-shadow-lg" />
                      )}
                      {displayColor === '#FFFFFF' && (
                        <div className="w-full h-full rounded-full border border-gray-300" />
                      )}
                    </button>
                  );
                })}
              </div>
              {selectedVariant && (
                <p className="text-sm text-gray-600">
                  Màu đã chọn: <span className="font-medium">
                    {colorsMap.get(selectedVariant.colorId)?.name || selectedVariant.colorName || 'Unknown'}
                  </span>
                </p>
              )}
            </div>

            {/* Size Selection */}
            <div className="space-y-4 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Chọn kích thước
              </h3>
              
              {stocksLoading ? (
                <div className="text-sm text-gray-500">Đang tải sizes...</div>
              ) : stocks.length === 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    💡 Sản phẩm này không có phân loại theo size. Bạn có thể mua ngay sau khi chọn màu.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-3">
                    {stocks
                      .sort((a, b) => {
                        const sizeA = sizesMap.get(a.sizeId);
                        const sizeB = sizesMap.get(b.sizeId);
                        return (sizeA?.sortOrder || 0) - (sizeB?.sortOrder || 0);
                      })
                      .map((stock) => {
                        const sizeInfo = sizesMap.get(stock.sizeId);
                        const displayLabel = sizeInfo?.label || stock.sizeLabel || 'N/A';
                        
                        return (
                          <button
                            key={stock.id}
                            onClick={() => setSelectedSizeId(stock.sizeId)}
                            disabled={stock.stockQty === 0}
                            className={`py-3 px-4 rounded-lg border text-sm font-medium transition relative ${
                              selectedSizeId === stock.sizeId
                                ? 'bg-gray-900 text-white border-gray-900'
                                : stock.stockQty === 0
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {displayLabel}
                            {stock.stockQty === 0 && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <span className="w-full h-0.5 bg-gray-400 rotate-45"></span>
                              </span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                  
                  {/* Size type indicator */}
                  {stocks.length > 0 && sizesMap.get(stocks[0].sizeId) && (
                    <div className="text-xs text-gray-500">
                      Loại: {sizesMap.get(stocks[0].sizeId)?.type === 'clothing' ? 'Size chữ' : 'Size số'}
                    </div>
                  )}
                </>
              )}

              {selectedStock && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    Kho: <span className={`font-medium ${selectedStock.stockQty < 10 ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedStock.stockQty} sản phẩm
                      {selectedStock.stockQty < 10 && selectedStock.stockQty > 0 && ' (Sắp hết)'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    SKU: <span className="font-medium font-mono">{selectedStock.sku}</span>
                  </p>
                  {sizesMap.get(selectedStock.sizeId) && (
                    <p className="text-sm text-gray-600">
                      Size: <span className="font-medium">
                        {sizesMap.get(selectedStock.sizeId)?.label}
                        {sizesMap.get(selectedStock.sizeId)?.type === 'numeric' && ' (số)'}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Quantity Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Số lượng</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={decreaseQuantity}
                    className="p-3 hover:bg-gray-100 transition rounded-l-lg"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 py-3 font-semibold min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQuantity}
                    disabled={selectedStock ? quantity >= selectedStock.stockQty : false}
                    className="p-3 hover:bg-gray-100 transition rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {selectedStock && quantity > selectedStock.stockQty && (
                  <p className="text-sm text-red-600">
                    Chỉ còn {selectedStock.stockQty} sản phẩm
                  </p>
                )}
                
                {!selectedStock && stocks.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Số lượng tùy chọn (max: 99)
                  </p>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariantId || (stocks.length > 0 && !selectedSizeId)}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Thêm vào giỏ hàng
            </button>
            
            {!selectedVariantId && (
              <p className="text-sm text-red-600 text-center">
                Vui lòng chọn màu sắc
              </p>
            )}
            
            {selectedVariantId && stocks.length > 0 && !selectedSizeId && (
              <p className="text-sm text-red-600 text-center">
                Vui lòng chọn kích thước
              </p>
            )}

            {/* Additional Info */}
            <div className="pt-6 border-t border-gray-200 space-y-2 text-sm text-gray-600">
              <p>✓ Miễn phí vận chuyển cho đơn hàng trên 500.000₫</p>
              <p>✓ Đổi trả trong vòng 7 ngày</p>
              <p>✓ Thanh toán khi nhận hàng</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

