import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/api';
import ProductList from '../components/product/ProductList';

const ProductsPage = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAllProducts,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Tất cả sản phẩm</h1>
        <ProductList products={products || []} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ProductsPage;

