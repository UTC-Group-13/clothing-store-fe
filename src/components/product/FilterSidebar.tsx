import { memo } from 'react';
import { SlidersHorizontal, Search } from 'lucide-react';
import type { Category, Color, Size } from '../../types';

interface FilterSidebarProps {
  // Search
  searchName: string;
  onSearchNameChange: (value: string) => void;
  onSearchSubmit: () => void;
  
  // Categories
  categories: Category[];
  selectedCategories: number[];
  onToggleCategory: (id: number) => void;
  
  // Price
  minPrice: number;
  maxPrice: number;
  onMinPriceChange: (value: number) => void;
  onMaxPriceChange: (value: number) => void;
  
  // Colors
  colors: Color[];
  selectedColors: number[];
  onToggleColor: (id: number) => void;
  
  // Sizes
  sizes: Size[];
  selectedSizes: number[];
  onToggleSize: (id: number) => void;
  
  // Clear filters
  onClearFilters: () => void;
}

const formatPrice = (price: number) => {
  return price.toLocaleString('vi-VN') + '₫';
};

const FilterSidebar = memo(({
  searchName,
  onSearchNameChange,
  onSearchSubmit,
  categories,
  selectedCategories,
  onToggleCategory,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  colors,
  selectedColors,
  onToggleColor,
  sizes,
  selectedSizes,
  onToggleSize,
  onClearFilters,
}: FilterSidebarProps) => {
  // Debug: log khi component render
  console.log('🔵 FilterSidebar rendered');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
  };

  return (
    <aside className="bg-white rounded-2xl border border-gray-200 p-6 h-fit sticky top-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Bộ lọc</h2>
        <SlidersHorizontal className="w-5 h-5 text-gray-400" />
      </div>

      {/* Search Filter */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tìm kiếm</h3>
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchName}
            onChange={(e) => onSearchNameChange(e.target.value)}
            placeholder="Tên sản phẩm..."
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-md transition"
          >
            <Search className="w-5 h-5 text-gray-500" />
          </button>
        </form>
      </div>

      {/* Categories Filter */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh mục</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => onToggleCategory(category.id)}
                className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <span className="text-sm text-gray-700">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Giá</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Giá tối thiểu</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => onMinPriceChange(Number(e.target.value))}
              min="0"
              step="10000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Giá tối đa</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(Number(e.target.value))}
              min="0"
              step="10000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div className="text-xs text-gray-500">
            {formatPrice(minPrice)} - {formatPrice(maxPrice)}
          </div>
        </div>
      </div>

      {/* Colors Filter */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Màu sắc</h3>
        <div className="grid grid-cols-5 gap-3">
          {colors.map((color) => (
            <button
              key={color.id}
              onClick={() => onToggleColor(color.id)}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                selectedColors.includes(color.id)
                  ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-900'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color.hexCode }}
              title={color.name}
              aria-label={color.name}
            >
              {color.hexCode === '#FFFFFF' && (
                <div className="w-full h-full rounded-full border border-gray-300" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sizes Filter */}
      <div className="pb-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kích thước</h3>
        <div className="grid grid-cols-3 gap-2">
          {sizes
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((size) => (
              <button
                key={size.id}
                onClick={() => onToggleSize(size.id)}
                className={`py-2 px-3 rounded-lg border text-sm font-medium transition ${
                  selectedSizes.includes(size.id)
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {size.label}
              </button>
            ))}
        </div>
      </div>

      {/* Clear Filter Button */}
      <button
        onClick={onClearFilters}
        className="w-full py-3 px-4 bg-white text-gray-900 border-2 border-gray-900 rounded-full font-medium hover:bg-gray-900 hover:text-white transition"
      >
        Xóa bộ lọc
      </button>
    </aside>
  );
});

FilterSidebar.displayName = 'FilterSidebar';

export default FilterSidebar;

