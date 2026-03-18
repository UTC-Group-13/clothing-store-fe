import type { Product } from '../../types';
import { ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { formatPriceUSD, truncateText } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast.success('Đã thêm vào giỏ hàng!');
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="relative pb-[100%] bg-gray-100">
        <img
          src={product.image}
          alt={product.title}
          className="absolute inset-0 w-full h-full object-contain p-4"
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 h-14">
          {truncateText(product.title, 60)}
        </h3>

        <div className="flex items-center mb-2">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="ml-1 text-sm text-gray-600">
            {product.rating.rate} ({product.rating.count})
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary-600">
            {formatPriceUSD(product.price)}
          </span>

          <button
            onClick={handleAddToCart}
            className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 transition"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

