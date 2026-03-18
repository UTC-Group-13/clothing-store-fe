import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/api';
import ProductList from '../components/product/ProductList';
import { useState } from 'react';

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAllProducts,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: productService.getCategories,
  });

  const { data: categoryProducts, isLoading: categoryLoading } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: () => productService.getProductsByCategory(selectedCategory),
    enabled: selectedCategory !== 'all',
  });

  const displayProducts = selectedCategory === 'all' ? products : categoryProducts;
  const isLoading = selectedCategory === 'all' ? productsLoading : categoryLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Chào mừng đến ShopVN
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Khám phá hàng ngàn sản phẩm chất lượng với giá tốt nhất
          </p>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-2 rounded-full font-semibold transition ${
              selectedCategory === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Tất cả
          </button>
          {categories?.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-semibold transition capitalize ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <ProductList products={displayProducts || []} isLoading={isLoading} />
      </section>
    </div>
  );
};

export default HomePage;

