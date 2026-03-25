import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/api';
import ProductList from '../components/product/ProductList';
import { useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import heroImage from '../assets/hero.png';
import type { ProductSearchParams } from '../types';

const BRAND_NAMES = ['VERSACE', 'ZARA', 'GUCCI', 'PRADA', 'Calvin Klein'];

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    message:
      'Form dáng đẹp, chất vải mịn và mặc rất thoải mái. Mình sẽ quay lại mua thêm.',
  },
  {
    name: 'Alex K.',
    message:
      'Hình ảnh đúng thực tế, giao hàng nhanh. Bộ outfit đi làm cực kỳ ổn áp.',
  },
  {
    name: 'James L.',
    message:
      'Mức giá tốt so với chất lượng. Đóng gói cẩn thận và hỗ trợ khách hàng nhanh.',
  },
];

const STYLE_TITLES = ['Casual', 'Formal', 'Party', 'Gym'];

const HomePage = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const handleNewsletterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  // Fetch products for general use (style products, etc.)
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAllProducts,
  });

  // API call cho HÀNG MỚI VỀ - sản phẩm mới nhất theo thời gian tạo
  const newArrivalsParams: ProductSearchParams = {
    isActive: true,
    page: 0,
    size: 8,
    sortBy: 'id', // Sort theo id DESC = mới nhất
    direction: 'DESC',
  };

  const { data: newArrivalsPage, isLoading: newArrivalsLoading } = useQuery({
    queryKey: ['products', 'newArrivals'],
    queryFn: () => productService.searchProducts(newArrivalsParams),
  });

  // API call cho RẺ BẤT NGỜ - sản phẩm giá thấp nhất
  const cheapestParams: ProductSearchParams = {
    isActive: true,
    page: 0,
    size: 8,
    sortBy: 'basePrice', // Sort theo giá tăng dần
    direction: 'ASC',
  };

  const { data: cheapestPage, isLoading: cheapestLoading } = useQuery({
    queryKey: ['products', 'cheapest'],
    queryFn: () => productService.searchProducts(cheapestParams),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: productService.getCategories,
  });

  // Filter to only show subcategories (parentId is not null) - giống ProductsPage
  const displayCategories = useMemo(() => {
    return categories?.filter(cat => cat.parentId !== null) || [];
  }, [categories]);

  // Build search params for category filter
  const searchParams = useMemo((): ProductSearchParams => ({
    categoryIds: selectedCategoryId ? [selectedCategoryId] : undefined,
    isActive: true,
    page: 0,
    size: 8,
    sortBy: 'id',
    direction: 'DESC',
  }), [selectedCategoryId]);

  // Fetch products by category using searchProducts API
  const { data: categoryProductsPage, isLoading: categoryLoading } = useQuery({
    queryKey: ['products', 'category', selectedCategoryId, searchParams],
    queryFn: () => productService.searchProducts(searchParams),
  });

  // Display products from API response
  const displayProducts = categoryProductsPage?.content || [];

  const isLoading = categoryLoading;

  // Lấy sản phẩm từ API response
  const newArrivals = newArrivalsPage?.content || [];
  const topSelling = cheapestPage?.content || [];
  
  const styleProducts = useMemo(() => (products || []).slice(0, 4), [products]);

  // Handle category selection
  const handleCategorySelect = useCallback((categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F0F1]">
      <section className="container mx-auto px-4 pt-8 lg:pt-10">
        <div className="bg-white rounded-[28px] px-6 py-8 lg:px-12 lg:py-12 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-gray-900">
              FIND CLOTHES THAT MATCHES YOUR STYLE
            </h1>
            <p className="mt-4 text-gray-600 max-w-xl">
              Khám phá bộ sưu tập quần áo nam và nữ được tuyển chọn mỗi tuần, tối ưu cho đi
              làm, đi chơi và luyện tập.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:items-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 bg-black text-white px-7 py-3 rounded-full font-semibold hover:bg-gray-900 transition"
              >
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/cart"
                className="inline-flex items-center justify-center px-7 py-3 rounded-full font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Xem giỏ hàng
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <p className="text-2xl font-bold text-gray-900">200+</p>
                <p className="text-sm text-gray-500">Thương hiệu thời trang</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">2,000+</p>
                <p className="text-sm text-gray-500">Mẫu quần áo mới</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">30,000+</p>
                <p className="text-sm text-gray-500">Khách hàng hài lòng</p>
              </div>
            </div>
          </div>

          <div className="relative bg-[#F2F0F1] rounded-2xl p-6">
            <img
              src={heroImage}
              alt="Fashion collection"
              className="w-full h-[340px] lg:h-[420px] object-cover rounded-xl"
            />
          </div>
        </div>
      </section>

      <div className="bg-black mt-8">
        <div className="container mx-auto px-4 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-white font-semibold tracking-wide">
          {BRAND_NAMES.map((brand) => (
            <span key={brand} className="text-lg md:text-xl">
              {brand}
            </span>
          ))}
        </div>
      </div>

      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl md:text-4xl font-black text-center text-gray-900">HÀNG MỚI VỀ</h2>
        <div className="mt-8">
          <ProductList products={newArrivals} isLoading={newArrivalsLoading} />
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            View All
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-12">
        <h2 className="text-3xl md:text-4xl font-black text-center text-gray-900">RẺ BẤT NGỜ</h2>
        <div className="mt-8">
          <ProductList products={topSelling} isLoading={cheapestLoading} />
        </div>
      </section>

      <section className="container mx-auto px-4 pb-12">
        <div className="bg-[#E7E5E6] rounded-3xl p-6 md:p-8">
          <h2 className="text-3xl md:text-4xl font-black text-center text-gray-900 mb-8">
            BROWSE BY DRESS STYLE
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STYLE_TITLES.map((style, index) => (
              <div
                key={style}
                className="bg-white rounded-2xl p-4 h-40 md:h-48 flex items-start justify-between overflow-hidden"
              >
                <p className="text-2xl font-bold text-gray-900">{style}</p>
                {styleProducts[index] ? (
                  <img
                    src={styleProducts[index].image}
                    alt={style}
                    className="h-full object-contain"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-12">
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">OUR HAPPY CUSTOMERS</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((testimonial) => (
            <article key={testimonial.name} className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, index) => (
                  <Star key={`${testimonial.name}-${index}`} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="font-semibold text-gray-900">{testimonial.name}</p>
              <p className="mt-2 text-sm text-gray-600">{testimonial.message}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Category Filter Section - Updated to use categoryIds */}
      <section className="container mx-auto px-4 pb-12">
        <h2 className="text-3xl md:text-4xl font-black text-center text-gray-900 mb-8">TẤT CẢ BỘ SƯU TẬP</h2>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`px-6 py-2 rounded-full font-semibold transition ${
              selectedCategoryId === null
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Tất cả
          </button>
          {displayCategories?.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                selectedCategoryId === category.id
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <ProductList products={displayProducts} isLoading={isLoading} />

        <div className="bg-black text-white rounded-3xl p-6 md:p-8 mt-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-2xl md:text-3xl font-black">STAY UPTO DATE ABOUT OUR LATEST OFFERS</h3>
            <p className="text-gray-300 mt-2">Nhận thông tin ưu đãi độc quyền mỗi tuần.</p>
          </div>

          <form
            className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto"
            onSubmit={handleNewsletterSubmit}
          >
            <input
              type="email"
              placeholder="Enter your email address"
              className="px-4 py-3 rounded-full text-gray-900 min-w-72"
            />
            <button
              type="submit"
              className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

