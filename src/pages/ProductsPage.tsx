import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, Star } from 'lucide-react';
import { productService } from '../services/api';
import { formatPriceUSD, truncateText } from '../utils/helpers';
import type { Product } from '../types';

const PRODUCT_TYPES = ['T-shirts', 'Shorts', 'Shirts', 'Hoodie', 'Jeans'];
const DRESS_STYLES = ['Casual', 'Formal', 'Party', 'Gym'];
const SIZES = ['All', 'XX-Small', 'X-Small', 'Small', 'Medium', 'Large', 'X-Large', 'XX-Large', '3X-Large'];

const COLORS = [
  { name: 'Green', value: '#16a34a' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Yellow', value: '#facc15' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Blue', value: '#06b6d4' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Pink', value: '#db2777' },
  { name: 'White', value: '#f3f4f6' },
  { name: 'Black', value: '#111827' },
];

const getProductType = (product: Product): string => PRODUCT_TYPES[product.id % PRODUCT_TYPES.length];
const getProductStyle = (product: Product): string => DRESS_STYLES[product.id % DRESS_STYLES.length];
const getProductColor = (product: Product): string => COLORS[product.id % COLORS.length].name;
const getProductSize = (product: Product): string => SIZES[(product.id % (SIZES.length - 1)) + 1];

const getDiscountRate = (product: Product): number => ((product.id % 3) + 1) * 10;
const getOriginalPrice = (product: Product): number => {
  const discountRate = getDiscountRate(product);
  return product.price / (1 - discountRate / 100);
};

type SortOption = 'most-popular' | 'price-low' | 'price-high' | 'newest';

const ProductsPage = () => {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStyle, setSelectedStyle] = useState<string>('All');
  const [selectedSize, setSelectedSize] = useState<string>('All');
  const [selectedColors, setSelectedColors] = useState<string[]>(['Blue']);
  const [maxPrice, setMaxPrice] = useState<number>(200);
  const [sortBy, setSortBy] = useState<SortOption>('most-popular');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAllProducts,
  });

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedType !== 'All') {
      result = result.filter((product) => getProductType(product) === selectedType);
    }

    if (selectedStyle !== 'All') {
      result = result.filter((product) => getProductStyle(product) === selectedStyle);
    }

    if (selectedColors.length > 0) {
      result = result.filter((product) => selectedColors.includes(getProductColor(product)));
    }

    if (selectedSize !== 'All') {
      result = result.filter((product) => getProductSize(product) === selectedSize);
    }

    result = result.filter((product) => product.price <= maxPrice);

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
      case 'most-popular':
      default:
        result.sort((a, b) => b.rating.rate - a.rating.rate);
        break;
    }

    return result;
  }, [maxPrice, products, selectedColors, selectedSize, selectedStyle, selectedType, sortBy]);

  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const from = filteredProducts.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const to = Math.min(safeCurrentPage * pageSize, filteredProducts.length);

  const toggleColor = (colorName: string) => {
    setCurrentPage(1);
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((color) => color !== colorName) : [...prev, colorName]
    );
  };

  const applyFilters = () => {
    setCurrentPage(1);
  };

  const selectType = (type: string) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const selectStyle = (style: string) => {
    setSelectedStyle(style);
    setCurrentPage(1);
  };

  const changeSort = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value as SortOption);
    setCurrentPage(1);
  };

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
      <div className="container mx-auto px-4 py-8">
        <div className="text-sm text-gray-500 flex items-center gap-2 mb-6">
          <Link to="/" className="hover:text-gray-700 transition">Home</Link>
          <span>&gt;</span>
          <span className="text-gray-700">Casual</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="bg-white rounded-2xl p-5 h-fit border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
              <SlidersHorizontal className="w-5 h-5 text-gray-500" />
            </div>

            <div className="border-t border-gray-200 pt-4">
              <ul className="space-y-2 text-gray-600">
                <li>
                  <button onClick={() => selectType('All')} className={`w-full text-left flex items-center justify-between hover:text-gray-900 ${selectedType === 'All' ? 'text-gray-900 font-semibold' : ''}`}>
                    All
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </li>
                {PRODUCT_TYPES.map((type) => (
                  <li key={type}>
                    <button onClick={() => selectType(type)} className={`w-full text-left flex items-center justify-between hover:text-gray-900 ${selectedType === type ? 'text-gray-900 font-semibold' : ''}`}>
                      {type}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Price</h3>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="range"
                min={50}
                max={250}
                value={maxPrice}
                onChange={(event) => {
                  setMaxPrice(Number(event.target.value));
                  setCurrentPage(1);
                }}
                className="w-full mt-4"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>$50</span>
                <span>${maxPrice}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Colors</h3>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              <div className="grid grid-cols-5 gap-2 mt-4">
                {COLORS.map((color) => {
                  const isActive = selectedColors.includes(color.name);
                  return (
                    <button
                      key={color.name}
                      onClick={() => toggleColor(color.name)}
                      className={`w-8 h-8 rounded-full border-2 ${isActive ? 'border-black' : 'border-transparent'}`}
                      style={{ backgroundColor: color.value }}
                      aria-label={color.name}
                    />
                  );
                })}
              </div>
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Size</h3>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-2 rounded-full text-sm ${selectedSize === size ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Dress Style</h3>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              <ul className="space-y-2 mt-4 text-gray-600">
                <li>
                  <button onClick={() => selectStyle('All')} className={`w-full text-left flex items-center justify-between hover:text-gray-900 ${selectedStyle === 'All' ? 'text-gray-900 font-semibold' : ''}`}>
                    All
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </li>
                {DRESS_STYLES.map((style) => (
                  <li key={style}>
                    <button onClick={() => selectStyle(style)} className={`w-full text-left flex items-center justify-between hover:text-gray-900 ${selectedStyle === style ? 'text-gray-900 font-semibold' : ''}`}>
                      {style}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={applyFilters}
              className="w-full bg-black text-white rounded-full py-3 font-semibold mt-5 hover:bg-gray-900 transition"
            >
              Apply Filter
            </button>
          </aside>

          <section>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
              <h1 className="text-4xl font-black text-gray-900">Casual</h1>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <p>
                  Showing {from}-{to} of {filteredProducts.length} Products
                </p>
                <label className="flex items-center gap-2">
                  Sort by:
                  <select
                    value={sortBy}
                    onChange={changeSort}
                    className="bg-transparent text-gray-900 font-semibold"
                  >
                    <option value="most-popular">Most Popular</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </label>
              </div>
            </div>

            {paginatedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center">
                <p className="text-xl text-gray-600">Khong tim thay san pham phu hop bo loc.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginatedProducts.map((product) => {
                  const discountRate = getDiscountRate(product);
                  const originalPrice = getOriginalPrice(product);
                  const ratingStars = Math.round(product.rating.rate);

                  return (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="bg-white rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition"
                    >
                      <div className="bg-gray-100 rounded-xl p-4 h-56 flex items-center justify-center">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      <h2 className="mt-4 text-2xl font-semibold text-gray-900 leading-tight">
                        {truncateText(product.title, 30)}
                      </h2>

                      <div className="flex items-center gap-1 mt-2">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={`${product.id}-${index}`}
                            className={`w-4 h-4 ${index < ratingStars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="text-sm text-gray-500 ml-1">{product.rating.rate}/5</span>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-3xl font-bold text-gray-900">{formatPriceUSD(product.price)}</span>
                        <span className="text-2xl text-gray-400 line-through">{formatPriceUSD(originalPrice)}</span>
                        <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">-{discountRate}%</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="border-t border-gray-300 mt-8 pt-6 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safeCurrentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50 inline-flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-2 text-sm text-gray-700">
                {[...Array(totalPages)].slice(0, 5).map((_, index) => {
                  const page = index + 1;
                  const isActive = page === safeCurrentPage;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg ${isActive ? 'bg-gray-200 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      {page}
                    </button>
                  );
                })}
                {totalPages > 5 ? <span>...</span> : null}
              </div>

              <button
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={safeCurrentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50 inline-flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        </div>

        <section className="mt-12 bg-black rounded-3xl p-6 md:p-8 text-white flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h2 className="text-3xl md:text-5xl font-black max-w-xl">STAY UPTO DATE ABOUT OUR LATEST OFFERS</h2>
          <form className="flex flex-col gap-3 w-full max-w-md" onSubmit={(event) => event.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full rounded-full px-5 py-3 text-gray-900"
            />
            <button
              type="submit"
              className="w-full rounded-full bg-white text-black py-3 font-semibold hover:bg-gray-200 transition"
            >
              Subscribe to Newsletter
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ProductsPage;

