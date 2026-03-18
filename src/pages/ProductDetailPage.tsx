import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/api';
import { ShoppingCart, Star, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { formatPriceUSD } from '../utils/helpers';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const addToCart = useCartStore((state) => state.addToCart);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(Number(id)),
    enabled: !!id,
  });

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast.success('Đã thêm vào giỏ hàng!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Không tìm thấy sản phẩm</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
              <img
                src={product.image}
                alt={product.title}
                className="max-w-full max-h-96 object-contain"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500 uppercase mb-2">
                {product.category}
              </span>

              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {product.title}
              </h1>

              <div className="flex items-center mb-4">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="ml-2 text-lg text-gray-600">
                  {product.rating.rate} / 5
                </span>
                <span className="ml-2 text-gray-500">
                  ({product.rating.count} đánh giá)
                </span>
              </div>

              <div className="text-4xl font-bold text-primary-600 mb-6">
                {formatPriceUSD(product.price)}
              </div>

              <p className="text-gray-700 leading-relaxed mb-8">
                {product.description}
              </p>

              <button
                onClick={handleAddToCart}
                className="bg-primary-600 text-white py-4 px-8 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

