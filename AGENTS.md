# AGENTS.md — ShopVN Ecommerce Frontend

## Kiến trúc

Ứng dụng SPA sử dụng React 19 + TypeScript cho cửa hàng thời trang Việt Nam. Build bằng Vite, giao diện Tailwind CSS, triển khai qua Docker/nginx trên cổng 3000.

**Công nghệ:** React 19, React Router 7, Zustand (quản lý state), TanStack React Query (dữ liệu từ server), Axios (HTTP), Tailwind CSS 3, Lucide icons, react-hot-toast.

**Hai nhóm route** trong `src/App.tsx`:
- **Route công khai** (`/`, `/products`, `/product/:id`, `/cart`, `/checkout`, `/orders`, `/login`, `/register`) — bọc trong `<Header>` + `<Footer>`.
- **Route quản trị** (`/admin/*`) — layout riêng qua `AdminLayout` (sidebar điều hướng + `<Outlet>`), được bảo vệ bởi `AdminRoute` kiểm tra `role === 'ADMIN'` từ auth store.

## Luồng dữ liệu & Quản lý State

- **State từ server**: Toàn bộ dữ liệu API được fetch qua `@tanstack/react-query`. QueryClient cấu hình trong `src/main.tsx` với `refetchOnWindowFocus: false, retry: 1`. Sử dụng `useQuery`/`useMutation` + `queryClient.invalidateQueries()` để quản lý cache.
- **State phía client**: Hai Zustand store với middleware `persist` (localStorage):
  - `useAuthStore` (key `auth-storage`) — phiên đăng nhập, JWT token, vai trò người dùng.
  - `useCartStore` (key `cart-storage`) — giỏ hàng cục bộ (pattern cũ; checkout sử dụng giỏ hàng phía server qua `cartService`).
- **Luồng token xác thực**: Interceptor trong `api.ts` đọc từ `localStorage('auth-storage')` → parse JSON persist của Zustand → lấy `state.user.accessToken` → gán header `Authorization: Bearer`. Khi gặp lỗi 401, xóa storage và chuyển hướng về `/login`.

## Tầng API

Toàn bộ lời gọi backend nằm trong `src/services/api.ts` (chính) và `src/services/authApi.ts` (xác thực). URL backend: biến môi trường `VITE_API_BASE_URL` (mặc định `http://160.30.113.40:8080/api`).

**Wrapper phản hồi API** — mọi endpoint trả về `ApiResponse<T>` có dạng `{ success, message, errorCode, data, timestamp }`. Luôn trích xuất dữ liệu qua `response.data.data`.

**Đối tượng service** (không dùng class): `productService`, `cartService`, `orderService`, `addressService`, `shippingService`, `adminOrderService`, `adminProductService`, v.v. Khi thêm service mới, tuân theo mẫu sau:
```ts
export const fooService = {
  getAll: async (): Promise<Foo[]> => {
    const response = await api.get<ApiResponse<Foo[]>>('/foo');
    return response.data.data;
  },
};
```

Tài liệu OpenAPI của backend có sẵn tại file `swagger.json` ở thư mục gốc dự án để tham khảo.

## Kiểu dữ liệu (Types)

Toàn bộ kiểu TypeScript dùng chung nằm trong `src/types/index.ts`. Các kiểu chính: `Product`, `ProductVariant`, `VariantStock`, `CartSummary`, `CartItemDetail`, `OrderDetail`, `OrderRequest`, `AddressDTO`. Phân trang sử dụng `PageResponse<T>` (`content`, `pageNumber`, `totalPages`, v.v.).

`Product` có tương thích hai trường (`basePrice`/`price`, `name`/`title`, `thumbnailUrl`/`image`) để hỗ trợ FakeStore API cũ — sử dụng hàm trợ giúp `getProductPrice()` từ `src/utils/helpers.ts`.

## Quy ước quan trọng

- **Định dạng tiền tệ**: Dùng `formatPrice()` (VND) từ `src/utils/helpers.ts`. Không bao giờ tự format thủ công.
- **Ngôn ngữ giao diện**: Tiếng Việt cho toàn bộ chuỗi hiển thị (nút bấm, nhãn, thông báo toast, tiêu đề).
- **Icon**: Chỉ dùng `lucide-react` — không sử dụng thư viện icon nào khác.
- **Thông báo**: `react-hot-toast` — `toast.success()` / `toast.error()`. Toaster đặt trong `main.tsx`.
- **URL hình ảnh**: Backend có thể trả đường dẫn tương đối; thêm `http://160.30.113.40:8080` phía trước khi URL không bắt đầu bằng `http` (xem mẫu `getImageUrl` trong `CheckoutPage.tsx`).
- **Bảng màu chủ đạo**: Thang màu `primary` tùy chỉnh (xanh da trời) định nghĩa trong `tailwind.config.js`. Dùng `primary-600` cho nút bấm, `primary-700` khi hover.
- **Tối ưu render**: Các component nặng bộ lọc (`FilterSidebar`, `ProductsGrid`) sử dụng `memo()` để tránh re-render không cần thiết.

## Các lệnh

```bash
npm run dev      # Chạy server phát triển tại http://localhost:5173
npm run build    # tsc -b && vite build (kiểm tra kiểu dữ liệu rồi đóng gói)
npm run lint     # ESLint (cấu hình flat, bao gồm TS + React hooks + React Refresh)
npm run preview  # Xem trước bản build production
```

Chưa cấu hình framework test. Chưa có CI pipeline trong repo.

## Tổ chức thư mục

| Đường dẫn | Mục đích |
|---|---|
| `src/services/api.ts` | Toàn bộ đối tượng service API + Axios instance + interceptor |
| `src/services/authApi.ts` | API xác thực (đăng nhập/đăng ký/đăng xuất) |
| `src/store/` | Zustand store (auth, cart) với persist localStorage |
| `src/types/index.ts` | Toàn bộ interface TypeScript — một file barrel duy nhất |
| `src/utils/helpers.ts` | Định dạng giá, cắt ngắn văn bản, hàm trợ giúp danh mục |
| `src/components/admin/` | Layout quản trị + route guard |
| `src/components/product/` | Component hiển thị sản phẩm (card, grid, bộ lọc) |
| `src/pages/admin/` | Các trang quản trị (tổng quan, đơn hàng, quản lý sản phẩm) |
| `src/pages/` | Các trang công khai |
