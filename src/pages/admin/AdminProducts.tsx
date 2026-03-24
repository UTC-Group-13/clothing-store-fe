import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, adminProductService } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import {
  Loader2, Boxes, Trash2, Search,
  Eye, EyeOff, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Product } from '../../types';

const API_BASE_URL = 'http://160.30.113.40:8080';

const getImageUrl = (url: string | null | undefined) => {
  if (!url) return 'https://via.placeholder.com/60x60?text=No+Image';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAllProducts,
  });

  const deleteMutation = useMutation({
    mutationFn: adminProductService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Đã xóa sản phẩm');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi xóa sản phẩm');
    },
  });

  const handleDelete = (product: Product) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) {
      deleteMutation.mutate(product.id);
    }
  };

  // Filter products by search
  const filteredProducts = products.filter((p: Product) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-primary-600" />
            Quản lý sản phẩm
          </h1>
          <p className="text-sm text-gray-500 mt-1">Tổng cộng {products.length} sản phẩm</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Boxes className="w-12 h-12 mx-auto mb-3" />
            <p className="text-lg">Không tìm thấy sản phẩm nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Sản phẩm</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Danh mục</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Thương hiệu</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Giá</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Trạng thái</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product: Product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(product.thumbnailUrl)}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded bg-gray-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[250px]">{product.name}</p>
                          <p className="text-xs text-gray-400">ID: {product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {product.categoryName || '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {product.brand || '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      {formatPrice(product.basePrice)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {product.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                          <Eye className="w-3 h-3" /> Hiển thị
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          <EyeOff className="w-3 h-3" /> Ẩn
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          to={`/product/${product.id}`}
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-primary-600 transition rounded"
                          title="Xem trên shop"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product)}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition rounded disabled:opacity-50"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;

