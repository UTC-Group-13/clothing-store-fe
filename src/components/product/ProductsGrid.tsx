import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { productService } from '../../services/api';
import type { ProductSearchParams } from '../../types';
import { getImageUrl } from '../../utils/helpers';

interface ProductsGridProps {
  searchParams: ProductSearchParams;
  sortBy: string;
  onPageChange: (page: number) => void;
  onSortChange: (sort: string) => void;
  onClearFilters: () => void;
}

const formatPrice = (price: number) => {
  return price.toLocaleString('vi-VN') + '₫';
};

const ProductsGrid = memo(({
  searchParams,
  sortBy,
  onPageChange,
  onSortChange,
  onClearFilters,
}: ProductsGridProps) => {
  // Debug: log khi component render
  console.log('🟢 ProductsGrid rendered');

  // Fetch products INSIDE this component - không ảnh hưởng parent
  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ['products', searchParams],
    queryFn: () => productService.searchProducts(searchParams),
  });

  const products = productsResponse?.content || [];
  const totalPages = productsResponse?.totalPages || 1;
  const totalElements = productsResponse?.totalElements || 0;
  const isFirstPage = productsResponse?.first ?? true;
  const isLastPage = productsResponse?.last ?? true;
  const currentPage = searchParams.page || 0;
  const pageSize = searchParams.size || 9;

  const from = products.length === 0 ? 0 : currentPage * pageSize + 1;
  const to = currentPage * pageSize + products.length;

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(event.target.value);
  };

  return (
    <main>
      {/* Header with Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Sản phẩm
          <span className="text-gray-500 text-base font-normal ml-2">
            ({totalElements} sản phẩm)
          </span>
        </h1>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sắp xếp:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-4 pr-10 text-sm font-medium text-gray-900 cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="id-desc">Mới nhất</option>
              <option value="id-asc">Cũ nhất</option>
              <option value="price-asc">Giá: Thấp đến Cao</option>
              <option value="price-desc">Giá: Cao đến Thấp</option>
              <option value="name-asc">Tên: A-Z</option>
              <option value="name-desc">Tên: Z-A</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(9)].map((_, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 animate-pulse">
              <div className="bg-gray-200 rounded-xl h-56 mb-4" />
              <div className="h-4 bg-gray-200 rounded mb-3" />
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">Không tìm thấy sản phẩm nào</p>
          <button
            onClick={onClearFilters}
            className="text-gray-900 font-medium hover:underline"
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      <div className="relative aspect-square overflow-hidden bg-[#F0EEED]">
                        <img
                          src={getImageUrl(product.thumbnailUrl || product.image)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition">
                          {product.name}
                        </h3>

                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {product.brand}
                          </span>
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {product.material}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatPrice(product.basePrice)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6">
              <button
                onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                disabled={isFirstPage}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Trước
              </button>

              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index;
                  if (
                    pageNumber === 0 ||
                    pageNumber === totalPages - 1 ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => onPageChange(pageNumber)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                          currentPage === pageNumber
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNumber + 1}
                      </button>
                    );
                  }
                  if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                    return (
                      <span key={pageNumber} className="text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                disabled={isLastPage}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Sau
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Showing Results */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Hiển thị {from}-{to} trong tổng số {totalElements} sản phẩm
          </p>
        </>
      )}
    </main>
  );
});

ProductsGrid.displayName = 'ProductsGrid';

export default ProductsGrid;

