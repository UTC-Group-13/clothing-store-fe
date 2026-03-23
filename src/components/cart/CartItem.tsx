import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { formatPrice } from '../../utils/helpers';

interface CartItemComponentProps {
  item: CartItem;
}

const CartItemComponent = ({ item }: CartItemComponentProps) => {
  const { updateQuantity, removeFromCart } = useCartStore();
  const itemPrice = item.basePrice || item.price || 0;
  const displayName = item.name || item.title || 'Sản phẩm';
  const displayImage = item.image || 'https://via.placeholder.com/100x100?text=No+Image';

  return (
    <div className="flex gap-4 bg-white p-4 rounded-lg shadow-md">
      <img
        src={displayImage}
        alt={displayName}
        className="w-24 h-24 object-contain bg-gray-100 rounded"
      />

      <div className="flex-1">
        <h3 className="font-semibold text-gray-800 mb-1">{displayName}</h3>
        <p className="text-primary-600 font-bold">{formatPrice(itemPrice)}</p>

        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="p-1 rounded bg-gray-200 hover:bg-gray-300 transition"
          >
            <Minus className="w-4 h-4" />
          </button>

          <span className="font-semibold min-w-[2rem] text-center">
            {item.quantity}
          </span>

          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="p-1 rounded bg-gray-200 hover:bg-gray-300 transition"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={() => removeFromCart(item.id)}
            className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded transition"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="text-right">
        <p className="text-lg font-bold text-gray-800">
          {formatPrice(itemPrice * item.quantity)}
        </p>
      </div>
    </div>
  );
};

export default CartItemComponent;

