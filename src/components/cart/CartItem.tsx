import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { formatPriceUSD } from '../../utils/helpers';

interface CartItemComponentProps {
  item: CartItem;
}

const CartItemComponent = ({ item }: CartItemComponentProps) => {
  const { updateQuantity, removeFromCart } = useCartStore();

  return (
    <div className="flex gap-4 bg-white p-4 rounded-lg shadow-md">
      <img
        src={item.image}
        alt={item.title}
        className="w-24 h-24 object-contain bg-gray-100 rounded"
      />

      <div className="flex-1">
        <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
        <p className="text-primary-600 font-bold">{formatPriceUSD(item.price)}</p>

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
          {formatPriceUSD(item.price * item.quantity)}
        </p>
      </div>
    </div>
  );
};

export default CartItemComponent;

