import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService, colorService, sizeService } from '../services/api';
import type { ProductSearchParams } from '../types';
import FilterSidebar from '../components/product/FilterSidebar';
import ProductsGrid from '../components/product/ProductsGrid';

type SortOption = 'id-asc' | 'id-desc' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

const ProductsPage = () => {
  const [searchName, setSearchName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  const [selectedColors, setSelectedColors] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(2000000);
  const [sortBy, setSortBy] = useState<SortOption>('id-desc');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const pageSize = 9;

  // Ref để lưu searchName hiện tại, tránh dependency trong callback
  const searchNameRef = useRef(searchName);
  
  // Update ref mỗi khi searchName thay đổi
  useEffect(() => {
    searchNameRef.current = searchName;
  }, [searchName]);

  // Parse sort option
  const { sortField, sortDirection } = useMemo(() => {
    const [field, direction] = sortBy.split('-');
    return {
      sortField: field === 'price' ? 'basePrice' : field,
      sortDirection: direction.toUpperCase() as 'ASC' | 'DESC',
    };
  }, [sortBy]);

  // Build search params
  const searchParams = useMemo((): ProductSearchParams => ({
    name: searchQuery || undefined,
    categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
    colorIds: selectedColors.length > 0 ? selectedColors : undefined,
    sizeIds: selectedSizes.length > 0 ? selectedSizes : undefined,
    minPrice: minPrice > 0 ? minPrice : undefined,
    maxPrice: maxPrice < 2000000 ? maxPrice : undefined,
    isActive: true,
    page: currentPage,
    size: pageSize,
    sortBy: sortField,
    direction: sortDirection,
  }), [searchQuery, selectedCategories, selectedColors, selectedSizes, minPrice, maxPrice, currentPage, sortField, sortDirection]);

  // KHÔNG fetch products ở đây nữa - để ProductsGrid tự fetch
  // Products query đã move vào ProductsGrid component

  // Fetch colors (static data - cache lâu dài)
  const { data: colors = [], isLoading: colorsLoading } = useQuery({
    queryKey: ['colors'],
    queryFn: colorService.getAllColors,
    staleTime: Infinity, // Data không bao giờ stale
    gcTime: 1000 * 60 * 60 * 24, // Cache 24 giờ
  });

  // Fetch categories (static data - cache lâu dài)
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: productService.getCategories,
    staleTime: Infinity, // Data không bao giờ stale
    gcTime: 1000 * 60 * 60 * 24, // Cache 24 giờ
  });

  // Fetch sizes (static data - cache lâu dài)
  const { data: sizes = [], isLoading: sizesLoading } = useQuery({
    queryKey: ['sizes'],
    queryFn: sizeService.getAllSizes,
    staleTime: Infinity, // Data không bao giờ stale
    gcTime: 1000 * 60 * 60 * 24, // Cache 24 giờ
  });

  // Filter to only show subcategories
  const displayCategories = useMemo(() => {
    return categories.filter(cat => cat.parentId !== null);
  }, [categories]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 0) {
      setCurrentPage(0);
    }
  }, [selectedCategories, selectedColors, selectedSizes, minPrice, maxPrice, searchQuery]);


  // Memoized callbacks to prevent re-renders
  const handleToggleCategory = useCallback((categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  }, []);

  const handleToggleColor = useCallback((colorId: number) => {
    setSelectedColors((prev) =>
      prev.includes(colorId) ? prev.filter((id) => id !== colorId) : [...prev, colorId]
    );
  }, []);

  const handleToggleSize = useCallback((sizeId: number) => {
    setSelectedSizes((prev) =>
      prev.includes(sizeId) ? prev.filter((id) => id !== sizeId) : [...prev, sizeId]
    );
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchName('');
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setMinPrice(0);
    setMaxPrice(2000000);
    setCurrentPage(0);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    setSearchQuery(searchNameRef.current); // Dùng ref, không dependency
    setCurrentPage(0);
  }, []); // Empty dependency - callback stable

  const handleSortChange = useCallback((newSort: string) => {
    setSortBy(newSort as SortOption);
    setCurrentPage(0);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSearchNameChange = useCallback((value: string) => {
    setSearchName(value);
  }, []);

  const handleMinPriceChange = useCallback((value: number) => {
    setMinPrice(value);
  }, []);

  const handleMaxPriceChange = useCallback((value: number) => {
    setMaxPrice(value);
  }, []);

  // Loading chỉ cho filter data
  const isLoading = colorsLoading || categoriesLoading || sizesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F2F0F1]">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            <div className="bg-white rounded-2xl p-6 animate-pulse h-[640px]" />
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
          </div>
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
            <span className="text-gray-900">Sản phẩm</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar Filters */}
          <FilterSidebar
            searchName={searchName}
            onSearchNameChange={handleSearchNameChange}
            onSearchSubmit={handleSearchSubmit}
            categories={displayCategories}
            selectedCategories={selectedCategories}
            onToggleCategory={handleToggleCategory}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={handleMinPriceChange}
            onMaxPriceChange={handleMaxPriceChange}
            colors={colors}
            selectedColors={selectedColors}
            onToggleColor={handleToggleColor}
            sizes={sizes}
            selectedSizes={selectedSizes}
            onToggleSize={handleToggleSize}
            onClearFilters={handleClearFilters}
          />

          {/* Products Grid */}
          <ProductsGrid
            searchParams={searchParams}
            sortBy={sortBy}
            onPageChange={handlePageChange}
            onSortChange={handleSortChange}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;

