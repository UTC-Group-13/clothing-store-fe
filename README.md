# 🛍️ ShopVN - Ecommerce Frontend

Ứng dụng ecommerce hiện đại được xây dựng bằng **React 19**, **TypeScript**, **Vite**, và **Tailwind CSS**.

## ✨ Tính năng

- 🏪 Hiển thị danh sách sản phẩm từ FakeStore API
- 🔍 Lọc sản phẩm theo danh mục
- 📄 Xem chi tiết sản phẩm
- 🛒 Giỏ hàng với tính năng thêm/xóa/cập nhật số lượng
- 💾 Lưu trữ giỏ hàng tự động (localStorage)
- 📱 Responsive design - tối ưu cho mọi thiết bị
- 🎨 UI đẹp mắt với Tailwind CSS
- 🔔 Toast notifications cho user feedback

## 🚀 Công nghệ sử dụng

- **Vite 8.0** - Build tool siêu nhanh
- **React 19.2.4** - Framework UI hiện đại
- **TypeScript 5.9** - Type safety
- **Tailwind CSS 3.4.1** - Utility-first CSS
- **React Router 7.13.1** - Client-side routing
- **Zustand 5.0.12** - State management đơn giản với persist
- **React Query 5.90.21** - Data fetching & caching
- **Axios 1.13.6** - HTTP client
- **Lucide React 0.577.0** - Beautiful icons
- **React Hot Toast 2.6.0** - Notifications

## 📦 Cài đặt

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Ứng dụng sẽ chạy tại: **http://localhost:5173**

## 🛠️ Commands

```bash
npm run dev      # Chạy development server
npm run build    # Build cho production
npm run preview  # Preview production build
npm run lint     # Chạy ESLint
```

## 📁 Cấu trúc Project

```
src/
├── components/
│   ├── layout/          # Header, Footer
│   ├── product/         # ProductCard, ProductList
│   └── cart/            # CartItem
├── pages/               # Route pages
│   ├── HomePage.tsx
│   ├── ProductsPage.tsx
│   ├── ProductDetailPage.tsx
│   └── CartPage.tsx
├── store/               # Zustand stores
│   └── cartStore.ts
├── services/            # API services
│   └── api.ts
├── types/               # TypeScript types
│   └── index.ts
├── utils/               # Helper functions
│   └── helpers.ts
└── hooks/               # Custom hooks
```

## 🎯 Features Chi tiết

### Quản lý Sản phẩm
- Hiển thị danh sách sản phẩm với hình ảnh, giá, đánh giá
- Lọc theo danh mục (electronics, jewelery, men's clothing, women's clothing)
- Xem chi tiết đầy đủ của từng sản phẩm
- Loading states với skeleton screens

### Giỏ hàng
- Thêm sản phẩm vào giỏ hàng
- Cập nhật số lượng (tăng/giảm)
- Xóa sản phẩm khỏi giỏ
- Tự động tính tổng tiền
- Lưu trữ trong localStorage (không mất khi reload)
- Badge hiển thị số lượng items

### UI/UX
- Responsive design
- Loading states
- Toast notifications
- Smooth transitions
- Mobile-friendly
- Hover effects

## 🔗 API

Project sử dụng [FakeStore API](https://fakestoreapi.com/)

**Endpoints:**
- `GET /products` - Lấy tất cả sản phẩm
- `GET /products/:id` - Lấy sản phẩm theo ID
- `GET /products/categories` - Lấy danh sách categories
- `GET /products/category/:category` - Lấy sản phẩm theo category

## 🎨 Customization

### Thay đổi màu chủ đạo

Edit `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      primary: {
        // Customize colors here
      }
    }
  }
}
```

### Thay đổi API

Edit `src/services/api.ts`:
```typescript
const API_BASE_URL = 'your-api-url';
```

## 📝 Development Notes

- **TypeScript**: Sử dụng `import type` cho type-only imports (do `verbatimModuleSyntax` enabled)
- **Cart state**: Tự động lưu vào localStorage với key: `cart-storage`
- **React Query**: Config `refetchOnWindowFocus: false`
- **Toaster**: Đã được setup trong `main.tsx`
- **Price format**: USD (có thể convert sang VND bằng `formatPrice()`)
- **Tailwind**: Sử dụng version 3.4.1 (stable, không phải v4)

**TypeScript Example:**
```typescript
// Correct ✅
import type { Product } from './types';
import { useCartStore } from './store/cartStore';

// Incorrect ❌ - Will cause TS1484 error
import { Product } from './types';
```

## 🐛 Troubleshooting

**Nếu gặp lỗi Tailwind CSS:**
```bash
npm install -D tailwindcss@3.4.1 postcss autoprefixer
npm install
```

**Clear cache:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

MIT License

## 👨‍💻 Author

Built with ❤️ by ShopVN Team

---

**Happy Coding! 🚀**

