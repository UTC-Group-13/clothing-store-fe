# 🛍️ ShopVN - Ecommerce Frontend

Ứng dụng ecommerce thời trang Việt Nam được xây dựng bằng **React 19**, **TypeScript**, **Vite**, và **Tailwind CSS**. Kết nối backend Clothing Store API tại `http://160.30.113.40:8080/api`.

## ✨ Tính năng

### Khách hàng
- 🏪 Hiển thị danh sách sản phẩm với tìm kiếm, bộ lọc (danh mục, màu sắc, kích cỡ, giá)
- 📄 Xem chi tiết sản phẩm với biến thể (màu sắc, size, tồn kho)
- 🛒 Giỏ hàng phía server (thêm/xóa/cập nhật số lượng)
- 💳 Thanh toán với chọn địa chỉ, phương thức vận chuyển & thanh toán
- 📦 Theo dõi đơn hàng và lịch sử mua hàng
- 🔐 Đăng nhập / Đăng ký với JWT authentication
- 📱 Responsive design — tối ưu cho mọi thiết bị

### Quản trị (Admin)
- 📊 Tổng quan dashboard (thống kê đơn hàng, doanh thu)
- 📋 Quản lý đơn hàng (xem, cập nhật trạng thái)
- 🏷️ Quản lý sản phẩm (xem, xóa, ẩn/hiện)

## 🚀 Công nghệ sử dụng

- **Vite 5.4** — Build tool siêu nhanh
- **React 19.2** — Framework UI hiện đại
- **TypeScript 5.9** — Type safety (`strict` mode, `verbatimModuleSyntax`)
- **Tailwind CSS 3.4** — Utility-first CSS với bảng màu `primary` tùy chỉnh
- **React Router 7.13** — Client-side routing (2 nhóm route: công khai + quản trị)
- **Zustand 5.0** — State management với persist localStorage
- **TanStack React Query 5.90** — Data fetching & caching
- **Axios 1.13** — HTTP client với interceptor xác thực JWT
- **Lucide React 0.577** — Icon library
- **React Hot Toast 2.6** — Toast notifications

## 📦 Cài đặt

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Ứng dụng sẽ chạy tại: **http://160.30.113.40:5173**

## 🛠️ Commands

```bash
npm run dev      # Chạy development server
npm run build    # Kiểm tra type (tsc -b) rồi build production (vite build)
npm run lint     # Chạy ESLint (flat config, TS + React hooks)
npm run preview  # Preview production build
```

## 📁 Cấu trúc Project

```
src/
├── components/
│   ├── admin/           # AdminLayout, AdminRoute (guard)
│   ├── layout/          # Header, Footer
│   ├── product/         # ProductCard, ProductList, ProductsGrid, FilterSidebar
│   └── cart/            # CartItem
├── pages/
│   ├── HomePage.tsx
│   ├── ProductsPage.tsx
│   ├── ProductDetailPageNew.tsx
│   ├── CartPage.tsx
│   ├── CheckoutPage.tsx
│   ├── OrdersPage.tsx
│   ├── OrderDetailPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── admin/
│       ├── AdminDashboard.tsx
│       ├── AdminOrders.tsx
│       ├── AdminOrderDetail.tsx
│       └── AdminProducts.tsx
├── services/
│   ├── api.ts           # Axios instance, interceptors, tất cả service objects
│   └── authApi.ts       # API đăng nhập/đăng ký/đăng xuất
├── store/
│   ├── authStore.ts     # Zustand auth store (JWT, role, persist)
│   └── cartStore.ts     # Zustand cart store (giỏ hàng cục bộ, legacy)
├── types/
│   └── index.ts         # Tất cả TypeScript interfaces
├── utils/
│   └── helpers.ts       # formatPrice (VND), getProductPrice, truncateText
└── hooks/               # Custom hooks
```

## 🔗 API

Project kết nối backend **Clothing Store API** tại `http://160.30.113.40:8080/api` (cấu hình qua biến môi trường `VITE_API_BASE_URL`).

Tài liệu OpenAPI đầy đủ có tại file `swagger.json` trong thư mục gốc.

**Các nhóm endpoint chính:**
- `GET /api/products/search` — Tìm kiếm sản phẩm (phân trang, lọc theo danh mục/màu/size/giá)
- `GET /api/products/:id` — Chi tiết sản phẩm
- `GET /api/categories` — Danh sách danh mục
- `GET/POST/PUT/DELETE /api/cart/*` — Giỏ hàng phía server
- `POST /api/orders` — Đặt hàng
- `GET /api/orders` — Lịch sử đơn hàng
- `POST /api/auth/login` — Đăng nhập (trả JWT)
- `POST /api/auth/register` — Đăng ký
- `GET /api/orders/admin/all` — Quản trị: danh sách đơn hàng
- `PATCH /api/orders/admin/:id/status` — Quản trị: cập nhật trạng thái đơn

**Wrapper phản hồi:** Mọi endpoint trả về `ApiResponse<T>` dạng `{ success, message, errorCode, data, timestamp }`. Luôn trích xuất dữ liệu qua `response.data.data`.

## 🎨 Tuỳ chỉnh

### Thay đổi màu chủ đạo

Sửa file `tailwind.config.js` — thang màu `primary` (mặc định: xanh da trời):
```js
theme: {
  extend: {
    colors: {
      primary: {
        600: '#0284c7', // Nút bấm
        700: '#0369a1', // Hover
        // ...
      }
    }
  }
}
```

### Thay đổi API backend

Tạo file `.env` tại thư mục gốc:
```env
VITE_API_BASE_URL=https://your-api-url.com/api
```

## 📝 Lưu ý phát triển

- **TypeScript**: Sử dụng `import type` cho type-only imports (do `verbatimModuleSyntax` bật)
- **Ngôn ngữ giao diện**: Tiếng Việt cho toàn bộ chuỗi hiển thị
- **Định dạng giá**: Dùng `formatPrice()` từ `src/utils/helpers.ts` (VND). Không format thủ công
- **Icon**: Chỉ dùng `lucide-react` — không sử dụng thư viện icon khác
- **Thông báo**: `react-hot-toast` — `toast.success()` / `toast.error()`
- **URL hình ảnh**: Backend có thể trả path tương đối, cần thêm `http://160.30.113.40:8080` phía trước (xem `getImageUrl` trong `CheckoutPage.tsx`)
- **Tailwind**: Sử dụng version 3.4 (stable, không phải v4)

**Ví dụ TypeScript:**
```typescript
// Đúng ✅
import type { Product } from './types';
import { useCartStore } from './store/cartStore';

// Sai ❌ — Gây lỗi TS1484
import { Product } from './types';
```

## 🐳 Triển khai Docker

```bash
# Build image
docker build -t shopvn-frontend .

# Chạy container (cổng 3000)
docker run -p 3000:3000 shopvn-frontend
```

Production build chạy trên nginx, cổng 3000, với SPA routing (`try_files $uri /index.html`).

## 🐛 Xử lý lỗi

**Nếu gặp lỗi Tailwind CSS:**
```bash
npm install -D tailwindcss@3.4.1 postcss autoprefixer
npm install
```

**Xóa cache:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

MIT License

## 👨‍💻 Tác giả

Được xây dựng với ❤️ bởi ShopVN Team

---

**Happy Coding! 🚀**
