import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/api';
import { ArrowLeft, Check, Minus, Plus, SlidersHorizontal, Star } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { formatPriceUSD, getFashionCategoryLabel, truncateText } from '../utils/helpers';
import toast from 'react-hot-toast';

const COLOR_OPTIONS = [
  { name: 'Olive', value: '#5A5A3C' },
  { name: 'Teal', value: '#1F4D4F' },
  { name: 'Indigo', value: '#2A355E' },
];

const SIZE_OPTIONS = ['Small', 'Medium', 'Large', 'X-Large'];

const REVIEW_TAB_OPTIONS = [
  { id: 'details', label: 'Product Details' },
  { id: 'reviews', label: 'Rating & Reviews' },
  { id: 'faq', label: 'FAQs' },
] as const;

type ReviewTab = (typeof REVIEW_TAB_OPTIONS)[number]['id'];

interface ReviewItem {
  id: number;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

const REVIEW_ITEMS: ReviewItem[] = [
  {
    id: 1,
    author: 'Samantha D.',
    rating: 5,
    date: '14/08/2023',
    comment: 'Ao dep, chat vai mem va form mac rat ton dang. Minh mac di lam va di choi deu hop.',
  },
  {
    id: 2,
    author: 'Alex M.',
    rating: 5,
    date: '15/08/2023',
    comment: 'Mau ao dep hon hinh, duong may chac chan. Giao nhanh va dong goi ky.',
  },
  {
    id: 3,
    author: 'Ethan R.',
    rating: 4,
    date: '16/08/2023',
    comment: 'Thiet ke don gian nhung hien dai. Minh danh gia cao chat lieu vai va do ben.',
  },
  {
    id: 4,
    author: 'Olivia P.',
    rating: 5,
    date: '17/08/2023',
    comment: 'Rat de phoi do, chat vai thoang khi. Day la mot trong nhung ao minh mac nhieu nhat.',
  },
];

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const addToCart = useCartStore((state) => state.addToCart);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].name);
  const [selectedSize, setSelectedSize] = useState('Large');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<ReviewTab>('reviews');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(Number(id)),
    enabled: !!id,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAllProducts,
  });

  const galleryImages = useMemo(() => {
    if (!product) {
      return [];
    }

    return [product.image, product.image, product.image];
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    const sameCategory = products.filter((item) => item.id !== product.id && item.category === product.category);
    if (sameCategory.length >= 4) {
      return sameCategory.slice(0, 4);
    }

    const fallback = products.filter((item) => item.id !== product.id);
    return fallback.slice(0, 4);
  }, [product, products]);

  const handleAddToCart = () => {
    if (product) {
      for (let index = 0; index < quantity; index += 1) {
        addToCart(product);
      }

      toast.success(`Da them ${quantity} san pham vao gio hang!`);
    }
  };

  const increaseQuantity = () => {
    setQuantity((prev) => Math.min(20, prev + 1));
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
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
    <div className="min-h-screen bg-[#F2F0F1]">
      <div className="container mx-auto px-4 py-8 lg:py-10">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-gray-700 transition">Home</Link>
          <span>&gt;</span>
          <Link to="/products" className="hover:text-gray-700 transition">Shop</Link>
          <span>&gt;</span>
          <span className="text-gray-700">{getFashionCategoryLabel(product.category)}</span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[120px_1fr_1fr]">
          <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col lg:overflow-visible">
            {galleryImages.map((image, index) => {
              const isActive = selectedImageIndex === index;

              return (
                <button
                  key={`${image}-${index}`}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex h-24 min-w-24 items-center justify-center rounded-2xl border bg-white p-2 transition ${
                    isActive ? 'border-black' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={image} alt={`${product.title} ${index + 1}`} className="h-full w-full object-contain" />
                </button>
              );
            })}
          </div>

          <div className="order-1 rounded-3xl bg-[#EBE8E9] p-6 lg:order-2 lg:p-10">
            <img
              src={galleryImages[selectedImageIndex] || product.image}
              alt={product.title}
              className="mx-auto h-[360px] w-full object-contain lg:h-[520px]"
            />
          </div>

          <div className="order-3 rounded-3xl bg-white p-6 lg:p-8">
            <Link
              to="/products"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lai
            </Link>

            <h1 className="text-3xl font-black uppercase text-gray-900 lg:text-4xl">
              {product.title}
            </h1>

            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, starIndex) => (
                  <Star
                    key={starIndex}
                    className={`h-5 w-5 ${starIndex < Math.round(product.rating.rate) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">{product.rating.rate.toFixed(1)}/5</span>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 border-b border-gray-200 pb-6">
              <span className="text-4xl font-bold text-gray-900">{formatPriceUSD(product.price)}</span>
              <span className="text-3xl font-semibold text-gray-400 line-through">
                {formatPriceUSD(product.price / 0.6)}
              </span>
              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">-40%</span>
            </div>

            <p className="mt-6 border-b border-gray-200 pb-6 text-gray-600">{product.description}</p>

            <div className="mt-6 border-b border-gray-200 pb-6">
              <p className="mb-3 text-sm font-medium text-gray-600">Select Colors</p>
              <div className="flex items-center gap-3">
                {COLOR_OPTIONS.map((color) => {
                  const isActive = selectedColor === color.name;

                  return (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border ${isActive ? 'border-black' : 'border-transparent'}`}
                      style={{ backgroundColor: color.value }}
                      aria-label={color.name}
                    >
                      {isActive ? <Check className="h-4 w-4 text-white" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 border-b border-gray-200 pb-6">
              <p className="mb-3 text-sm font-medium text-gray-600">Choose Size</p>
              <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                      selectedSize === size ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center justify-between rounded-full bg-gray-100 px-4 py-3 sm:w-40">
                <button onClick={decreaseQuantity} className="text-gray-700 hover:text-black" aria-label="Giam so luong">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold">{quantity}</span>
                <button onClick={increaseQuantity} className="text-gray-700 hover:text-black" aria-label="Tang so luong">
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-900"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        <section className="mt-12">
          <div className="grid grid-cols-3 border-b border-gray-300">
            {REVIEW_TAB_OPTIONS.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 text-center text-sm font-medium transition ${
                    isActive ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'reviews' ? (
            <div className="pt-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-gray-900">All Reviews ({product.rating.count})</h2>
                <div className="flex items-center gap-3">
                  <button className="rounded-full bg-gray-200 p-3 text-gray-700 hover:bg-gray-300">
                    <SlidersHorizontal className="h-4 w-4" />
                  </button>
                  <button className="rounded-full bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300">
                    Latest
                  </button>
                  <button className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-900">
                    Write a Review
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {REVIEW_ITEMS.map((review) => (
                  <article key={review.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex">
                        {[...Array(5)].map((_, starIndex) => (
                          <Star
                            key={starIndex}
                            className={`h-4 w-4 ${starIndex < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-400">...</span>
                    </div>

                    <p className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      {review.author}
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                        <Check className="h-3 w-3 text-white" />
                      </span>
                    </p>

                    <p className="mb-4 text-sm leading-6 text-gray-600">&quot;{review.comment}&quot;</p>
                    <p className="text-sm text-gray-500">Posted on {review.date}</p>
                  </article>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button className="rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">
                  Load More Reviews
                </button>
              </div>
            </div>
          ) : null}

          {activeTab === 'details' ? (
            <div className="rounded-2xl bg-white p-6 text-gray-600">
              <h2 className="mb-3 text-xl font-bold text-gray-900">Product Details</h2>
              <p>
                {product.title} thuoc nhom {getFashionCategoryLabel(product.category).toLowerCase()}. San pham co chat lieu mem,
                thoang va de phoi do cho nhieu dip khac nhau.
              </p>
            </div>
          ) : null}

          {activeTab === 'faq' ? (
            <div className="rounded-2xl bg-white p-6 text-gray-600">
              <h2 className="mb-3 text-xl font-bold text-gray-900">FAQs</h2>
              <p className="mb-2"><strong>Hoi:</strong> Form ao co dung size khong?</p>
              <p className="mb-4"><strong>Tra loi:</strong> Form true-to-size, neu thich mac rong hay tang 1 size.</p>
              <p className="mb-2"><strong>Hoi:</strong> Co doi tra duoc khong?</p>
              <p><strong>Tra loi:</strong> Co, ho tro doi tra trong 7 ngay voi san pham con nguyen tem.</p>
            </div>
          ) : null}
        </section>

        <section className="mt-14">
          <h2 className="mb-8 text-center text-4xl font-black uppercase text-gray-900">You Might Also Like</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => {
              const discountRate = ((item.id % 3) + 1) * 10;
              const originalPrice = item.price / (1 - discountRate / 100);

              return (
                <Link
                  key={item.id}
                  to={`/product/${item.id}`}
                  className="rounded-2xl border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="mb-4 rounded-xl bg-[#F0EEED] p-4">
                    <img src={item.image} alt={item.title} className="h-52 w-full object-contain" />
                  </div>

                  <h3 className="mb-2 text-lg font-bold text-gray-900">{truncateText(item.title, 28)}</h3>

                  <div className="mb-2 flex items-center gap-1">
                    {[...Array(5)].map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className={`h-4 w-4 ${starIndex < Math.round(item.rating.rate) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="ml-1 text-sm text-gray-600">{item.rating.rate.toFixed(1)}/5</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">{formatPriceUSD(item.price)}</span>
                    <span className="text-lg text-gray-400 line-through">{formatPriceUSD(originalPrice)}</span>
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-600">-{discountRate}%</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetailPage;

