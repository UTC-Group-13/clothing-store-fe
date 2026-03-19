import type { Product } from '../../types';
import { ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { formatPriceUSD, getFashionCategoryLabel, truncateText } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const discountRate = ((product.id % 3) + 2) * 10;
  const originalPrice = product.price / (1 - discountRate / 100);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast.success('Đã thêm vào giỏ hàng!');
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="bg-white rounded-2xl p-3 border border-gray-100 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative pb-[100%] bg-gray-100 rounded-xl overflow-hidden">
        <span className="absolute top-3 left-3 z-10 bg-black text-white text-xs px-2 py-1 rounded-full">
          {getFashionCategoryLabel(product.category)}
        </span>
        <img
          src={product.image}
          alt={product.title}
          className="absolute inset-0 w-full h-full object-contain p-4"
        />
      </div>

      <div className="p-3">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1 min-h-10">
          {truncateText(product.title, 42)}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm text-gray-700 font-medium">{product.rating.rate}</span>
          <span className="text-xs text-gray-500">({product.rating.count})</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            {formatPriceUSD(product.price)}
          </span>
          <span className="text-sm text-gray-400 line-through">
            {formatPriceUSD(originalPrice)}
          </span>
          <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
            -{discountRate}%
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          className="w-full bg-primary-600 text-white py-2.5 rounded-xl hover:bg-primary-700 transition flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Thêm vào giỏ
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;

