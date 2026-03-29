import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  productService, colorService, sizeService,
  adminProductFullService, fileUploadService
} from '../../services/api';
import { formatPrice, generateSlug } from '../../utils/helpers';
import type {
  ProductFullRequest, VariantRequest, StockRequest,
  ProductDetailResponse, Category, Color, Size
} from '../../types';
import {
  ArrowLeft, Save, Plus, Trash2, Upload, X, Image as ImageIcon,
  Loader2, Star, Package, Palette, Ruler, ChevronDown, ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://160.30.113.40:8080';

const getImageUrl = (url: string | null | undefined) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

// Local form state types (more flexible than request types)
interface StockFormState {
  id: number | null;
  sizeId: number;
  stockQty: number;
  priceOverride: string; // keep as string for form input
  sku: string;
}

interface VariantFormState {
  id: number | null;
  colorId: number;
  colorImageUrl: string;
  imageUrls: string[]; // parsed from JSON
  isDefault: boolean;
  stocks: StockFormState[];
  collapsed: boolean;
}

interface ProductFormState {
  name: string;
  slug: string;
  description: string;
  categoryId: number;
  basePrice: string;
  brand: string;
  material: string;
  isActive: boolean;
  variants: VariantFormState[];
}

const emptyStock = (): StockFormState => ({
  id: null,
  sizeId: 0,
  stockQty: 0,
  priceOverride: '',
  sku: '',
});

const emptyVariant = (): VariantFormState => ({
  id: null,
  colorId: 0,
  colorImageUrl: '',
  imageUrls: [],
  isDefault: false,
  stocks: [emptyStock()],
  collapsed: false,
});

const initialFormState: ProductFormState = {
  name: '',
  slug: '',
  description: '',
  categoryId: 0,
  basePrice: '',
  brand: '',
  material: '',
  isActive: true,
  variants: [emptyVariant()],
};

const AdminProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState<ProductFormState>(initialFormState);
  const [autoSlug, setAutoSlug] = useState(true);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null); // variantIndex or 'thumbnail'

  // Load dropdown data
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: productService.getCategories,
  });

  const { data: colors = [] } = useQuery<Color[]>({
    queryKey: ['colors'],
    queryFn: colorService.getAllColors,
  });

  const { data: sizes = [] } = useQuery<Size[]>({
    queryKey: ['sizes'],
    queryFn: sizeService.getAllSizes,
  });

  // Load product for edit
  const { data: productDetail, isLoading: loadingProduct } = useQuery<ProductDetailResponse>({
    queryKey: ['product-full', id],
    queryFn: () => adminProductFullService.getFullById(Number(id)),
    enabled: isEditMode,
  });

  // Populate form when product loads in edit mode
  useEffect(() => {
    if (productDetail && isEditMode) {
      setForm({
        name: productDetail.name,
        slug: productDetail.slug,
        description: productDetail.description || '',
        categoryId: productDetail.categoryId,
        basePrice: productDetail.basePrice.toString(),
        brand: productDetail.brand || '',
        material: productDetail.material || '',
        isActive: productDetail.isActive,
        variants: productDetail.variants.map((v) => {
          let imageUrls: string[] = [];
          if (v.images) {
            try { imageUrls = JSON.parse(v.images); } catch { /* ignore */ }
          }
          return {
            id: v.id,
            colorId: v.colorId,
            colorImageUrl: v.colorImageUrl || '',
            imageUrls,
            isDefault: v.isDefault,
            stocks: v.stocks.map((s) => ({
              id: s.id,
              sizeId: s.sizeId,
              stockQty: s.stockQty,
              priceOverride: s.priceOverride != null ? s.priceOverride.toString() : '',
              sku: s.sku,
            })),
            collapsed: false,
          };
        }),
      });
      setAutoSlug(false);
    }
  }, [productDetail, isEditMode]);

  // Auto-generate slug
  const handleNameChange = useCallback((name: string) => {
    setForm((prev) => {
      const updated = { ...prev, name };
      if (autoSlug) {
        updated.slug = generateSlug(name);
      }
      return updated;
    });
  }, [autoSlug]);

  // ==== Mutations ====
  const createMutation = useMutation({
    mutationFn: (data: ProductFullRequest) => adminProductFullService.createFull(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Tạo sản phẩm thành công!');
      navigate('/admin/products');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Lỗi khi tạo sản phẩm';
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProductFullRequest) => adminProductFullService.updateFull(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-full', id] });
      toast.success('Cập nhật sản phẩm thành công!');
      navigate('/admin/products');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Lỗi khi cập nhật sản phẩm';
      toast.error(msg);
    },
  });

  const deleteVariantMutation = useMutation({
    mutationFn: (variantId: number) => adminProductFullService.deleteVariant(variantId),
    onSuccess: () => {
      toast.success('Đã xóa biến thể');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể xóa biến thể');
    },
  });

  const deleteStockMutation = useMutation({
    mutationFn: (stockId: number) => adminProductFullService.deleteStock(stockId),
    onSuccess: () => {
      toast.success('Đã xóa tồn kho');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể xóa tồn kho');
    },
  });

  // ==== Variant Handlers ====
  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, emptyVariant()],
    }));
  };

  const removeVariant = async (index: number) => {
    const variant = form.variants[index];
    if (variant.id) {
      if (!window.confirm('Xóa biến thể này? Tất cả tồn kho theo size cũng sẽ bị xóa.')) return;
      await deleteVariantMutation.mutateAsync(variant.id);
    }
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const updateVariant = (index: number, updates: Partial<VariantFormState>) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => i === index ? { ...v, ...updates } : v),
    }));
  };

  const setDefaultVariant = (index: number) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => ({ ...v, isDefault: i === index })),
    }));
  };

  // ==== Stock Handlers ====
  const addStock = (variantIndex: number) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === variantIndex ? { ...v, stocks: [...v.stocks, emptyStock()] } : v
      ),
    }));
  };

  const removeStock = async (variantIndex: number, stockIndex: number) => {
    const stock = form.variants[variantIndex].stocks[stockIndex];
    if (stock.id) {
      if (!window.confirm('Xóa size này?')) return;
      await deleteStockMutation.mutateAsync(stock.id);
    }
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, vi) =>
        vi === variantIndex
          ? { ...v, stocks: v.stocks.filter((_, si) => si !== stockIndex) }
          : v
      ),
    }));
  };

  const updateStock = (variantIndex: number, stockIndex: number, updates: Partial<StockFormState>) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, vi) =>
        vi === variantIndex
          ? {
              ...v,
              stocks: v.stocks.map((s, si) => si === stockIndex ? { ...s, ...updates } : s),
            }
          : v
      ),
    }));
  };

  // ==== Image Upload Handlers ====
  const handleColorImageUpload = async (variantIndex: number, file: File) => {
    setUploadingImage(`color-${variantIndex}`);
    try {
      const result = await fileUploadService.uploadImage(file);
      updateVariant(variantIndex, { colorImageUrl: result.fileUrl });
      toast.success('Upload ảnh thành công');
    } catch {
      toast.error('Lỗi upload ảnh');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleGalleryUpload = async (variantIndex: number, files: FileList) => {
    setUploadingImage(`gallery-${variantIndex}`);
    try {
      const fileArray = Array.from(files);
      const results = await fileUploadService.uploadImages(fileArray);
      const newUrls = results.map((r) => r.fileUrl);
      const currentUrls = form.variants[variantIndex].imageUrls;
      updateVariant(variantIndex, { imageUrls: [...currentUrls, ...newUrls] });
      toast.success(`Upload ${results.length} ảnh thành công`);
    } catch {
      toast.error('Lỗi upload ảnh');
    } finally {
      setUploadingImage(null);
    }
  };

  const removeGalleryImage = (variantIndex: number, imageIndex: number) => {
    const urls = [...form.variants[variantIndex].imageUrls];
    urls.splice(imageIndex, 1);
    updateVariant(variantIndex, { imageUrls: urls });
  };

  // ==== Form Validation ====
  const validate = (): string | null => {
    if (!form.name.trim()) return 'Vui lòng nhập tên sản phẩm';
    if (!form.slug.trim()) return 'Vui lòng nhập slug';
    if (!form.categoryId) return 'Vui lòng chọn danh mục';
    if (!form.basePrice || Number(form.basePrice) < 0) return 'Vui lòng nhập giá hợp lệ';
    if (form.variants.length === 0) return 'Cần ít nhất 1 biến thể';

    const defaultCount = form.variants.filter((v) => v.isDefault).length;
    if (defaultCount > 1) return 'Chỉ được chọn 1 biến thể mặc định';

    for (let vi = 0; vi < form.variants.length; vi++) {
      const v = form.variants[vi];
      if (!v.colorId) return `Biến thể ${vi + 1}: Vui lòng chọn màu sắc`;
      if (v.stocks.length === 0) return `Biến thể ${vi + 1}: Cần ít nhất 1 size`;
      for (let si = 0; si < v.stocks.length; si++) {
        const s = v.stocks[si];
        if (!s.sizeId) return `Biến thể ${vi + 1}, Size ${si + 1}: Vui lòng chọn size`;
        if (!s.sku.trim()) return `Biến thể ${vi + 1}, Size ${si + 1}: Vui lòng nhập SKU`;
      }
    }

    return null;
  };

  // ==== Submit ====
  const handleSubmit = () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    const payload: ProductFullRequest = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      categoryId: form.categoryId,
      basePrice: Number(form.basePrice),
      brand: form.brand.trim(),
      material: form.material.trim(),
      isActive: form.isActive,
      variants: form.variants.map((v): VariantRequest => ({
        id: v.id,
        colorId: v.colorId,
        colorImageUrl: v.colorImageUrl || null,
        images: v.imageUrls.length > 0 ? JSON.stringify(v.imageUrls) : null,
        isDefault: v.isDefault,
        stocks: v.stocks.map((s): StockRequest => ({
          id: s.id,
          sizeId: s.sizeId,
          stockQty: s.stockQty,
          priceOverride: s.priceOverride ? Number(s.priceOverride) : null,
          sku: s.sku.trim(),
        })),
      })),
    };

    if (isEditMode) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ==== Loading state ====
  if (isEditMode && loadingProduct) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-500">Đang tải sản phẩm...</span>
      </div>
    );
  }

  const getColorName = (colorId: number) => colors.find((c) => c.id === colorId)?.name || '';
  const getColorHex = (colorId: number) => colors.find((c) => c.id === colorId)?.hexCode || '#ccc';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/products')}
            className="p-2 text-gray-400 hover:text-gray-600 transition rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h1>
            {isEditMode && (
              <p className="text-sm text-gray-500">ID: {id}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 font-medium"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEditMode ? 'Cập nhật' : 'Tạo sản phẩm'}
        </button>
      </div>

      {/* Product Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary-600" />
          Thông tin sản phẩm
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="VD: Áo Thun Nike Basic"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              maxLength={200}
            />
          </div>

          {/* Slug */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug (URL) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={form.slug}
                onChange={(e) => {
                  setAutoSlug(false);
                  setForm((prev) => ({ ...prev, slug: e.target.value }));
                }}
                placeholder="ao-thun-nike-basic"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                maxLength={200}
              />
              <button
                type="button"
                onClick={() => {
                  setAutoSlug(true);
                  setForm((prev) => ({ ...prev, slug: generateSlug(prev.name) }));
                }}
                className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition whitespace-nowrap"
              >
                Tự động sinh
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((prev) => ({ ...prev, categoryId: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value={0}>-- Chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Base Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá gốc (VNĐ) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.basePrice}
              onChange={(e) => setForm((prev) => ({ ...prev, basePrice: e.target.value }))}
              placeholder="250000"
              min={0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {form.basePrice && Number(form.basePrice) > 0 && (
              <p className="text-xs text-gray-500 mt-1">= {formatPrice(Number(form.basePrice))}</p>
            )}
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu</label>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))}
              placeholder="VD: Nike"
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Material */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chất liệu</label>
            <input
              type="text"
              value={form.material}
              onChange={(e) => setForm((prev) => ({ ...prev, material: e.target.value }))}
              placeholder="VD: Cotton 100%"
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Mô tả chi tiết sản phẩm..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y"
            />
          </div>

          {/* Is Active */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">Hiển thị sản phẩm (Active)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Variants */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary-600" />
            Biến thể màu sắc ({form.variants.length})
          </h2>
          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            Thêm màu
          </button>
        </div>

        {form.variants.map((variant, vi) => (
          <div key={vi} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Variant Header */}
            <div
              className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200 cursor-pointer"
              onClick={() => updateVariant(vi, { collapsed: !variant.collapsed })}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: variant.colorId ? getColorHex(variant.colorId) : '#e5e7eb' }}
                />
                <span className="font-medium text-gray-900">
                  {variant.colorId
                    ? `Màu: ${getColorName(variant.colorId)}`
                    : `Biến thể ${vi + 1}`}
                </span>
                {variant.isDefault && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                    <Star className="w-3 h-3" /> Mặc định
                  </span>
                )}
                <span className="text-xs text-gray-400">({variant.stocks.length} size)</span>
              </div>
              <div className="flex items-center gap-2">
                {form.variants.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeVariant(vi); }}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition rounded"
                    title="Xóa biến thể"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {variant.collapsed ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
              </div>
            </div>

            {/* Variant Body */}
            {!variant.collapsed && (
              <div className="p-5 space-y-5">
                {/* Variant Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Color select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Màu sắc <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={variant.colorId}
                      onChange={(e) => updateVariant(vi, { colorId: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value={0}>-- Chọn màu --</option>
                      {colors.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.hexCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Default toggle */}
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer pb-2">
                      <input
                        type="radio"
                        name="default-variant"
                        checked={variant.isDefault}
                        onChange={() => setDefaultVariant(vi)}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Đặt làm mặc định</span>
                    </label>
                  </div>
                </div>

                {/* Color Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh đại diện (thumbnail)</label>
                  <div className="flex items-center gap-4">
                    {variant.colorImageUrl && (
                      <div className="relative group">
                        <img
                          src={getImageUrl(variant.colorImageUrl)}
                          alt="Color thumbnail"
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => updateVariant(vi, { colorImageUrl: '' })}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 cursor-pointer transition">
                      {uploadingImage === `color-${vi}` ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      ) : (
                        <Upload className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-500">Chọn ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleColorImageUpload(vi, file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Gallery Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bộ sưu tập ảnh
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {variant.imageUrls.map((url, imgIdx) => (
                      <div key={imgIdx} className="relative group">
                        <img
                          src={getImageUrl(url)}
                          alt={`Gallery ${imgIdx + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(vi, imgIdx)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 cursor-pointer transition">
                      {uploadingImage === `gallery-${vi}` ? (
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                      ) : (
                        <>
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-xs text-gray-400 mt-1">Thêm</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) handleGalleryUpload(vi, files);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Stocks Table */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                      <Ruler className="w-4 h-4 text-gray-500" />
                      Tồn kho theo size
                    </h3>
                    <button
                      type="button"
                      onClick={() => addStock(vi)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition"
                    >
                      <Plus className="w-3 h-3" />
                      Thêm size
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left py-2 px-3 font-medium text-gray-600 w-36">Size *</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-600 w-40">SKU *</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-600 w-28">Số lượng</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-600 w-40">Giá riêng (VNĐ)</th>
                          <th className="w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {variant.stocks.map((stock, si) => (
                          <tr key={si}>
                            <td className="py-2 px-3">
                              <select
                                value={stock.sizeId}
                                onChange={(e) => updateStock(vi, si, { sizeId: Number(e.target.value) })}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              >
                                <option value={0}>-- Chọn --</option>
                                {sizes.map((s) => (
                                  <option key={s.id} value={s.id}>{s.label} ({s.type})</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={stock.sku}
                                onChange={(e) => updateStock(vi, si, { sku: e.target.value })}
                                placeholder="VD: NIKE-DO-S"
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                maxLength={100}
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                value={stock.stockQty}
                                onChange={(e) => updateStock(vi, si, { stockQty: Number(e.target.value) })}
                                min={0}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                value={stock.priceOverride}
                                onChange={(e) => updateStock(vi, si, { priceOverride: e.target.value })}
                                placeholder="Để trống = giá gốc"
                                min={0}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              />
                              {stock.priceOverride && Number(stock.priceOverride) > 0 && (
                                <span className="text-xs text-gray-400">{formatPrice(Number(stock.priceOverride))}</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-center">
                              {variant.stocks.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeStock(vi, si)}
                                  className="p-1 text-gray-400 hover:text-red-600 transition rounded"
                                  title="Xóa"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom submit */}
      <div className="flex justify-end pb-8">
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 font-medium shadow-sm"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEditMode ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
        </button>
      </div>
    </div>
  );
};

export default AdminProductForm;

