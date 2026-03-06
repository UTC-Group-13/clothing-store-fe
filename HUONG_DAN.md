# HƯỚNG DẪN SỬ DỤNG CLOTHING STORE FRONTEND

## 1. CÀI ĐẶT

### Yêu cầu hệ thống
- Node.js >= 14.0.0
- npm hoặc yarn

### Các bước cài đặt

1. **Cài đặt dependencies:**
```bash
npm install
```

2. **Tạo file .env:**
```bash
copy .env.example .env
```

3. **Chạy ứng dụng:**
```bash
npm start
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## 2. CẤU TRÚC DỰ ÁN

```
src/
├── components/          # Các component tái sử dụng
│   └── Layout/         # Layout components
│       ├── MainLayout.js      # Layout cho user
│       └── AdminLayout.js     # Layout cho admin
├── context/            # Context API
│   ├── AuthContext.js         # Quản lý authentication
│   └── CartContext.js         # Quản lý giỏ hàng
├── pages/              # Các trang
│   ├── Home.js
│   ├── Products.js
│   ├── ProductDetail.js
│   ├── Cart.js
│   ├── Checkout.js
│   ├── Login.js
│   ├── Register.js
│   └── admin/
│       ├── Dashboard.js
│       ├── ProductManagement.js
│       └── CategoryManagement.js
├── services/           # API services
│   ├── api.js                 # Axios instance
│   └── index.js               # API endpoints
└── utils/              # Utility functions
    └── helpers.js
```

## 3. CHỨC NĂNG

### A. USER (Khách hàng)

#### Trang chủ (/)
- Hiển thị banner carousel
- Sản phẩm nổi bật
- Giới thiệu về cửa hàng

#### Danh sách sản phẩm (/products)
- Xem tất cả sản phẩm
- Tìm kiếm sản phẩm
- Lọc theo danh mục
- Sắp xếp theo giá
- Thêm vào giỏ hàng nhanh

#### Chi tiết sản phẩm (/products/:id)
- Xem chi tiết sản phẩm
- Chọn size, màu sắc
- Chọn số lượng
- Thêm vào giỏ hàng

#### Giỏ hàng (/cart)
- Xem danh sách sản phẩm trong giỏ
- Cập nhật số lượng
- Xóa sản phẩm
- Xem tổng tiền
- Tiến hành thanh toán

#### Thanh toán (/checkout)
- Nhập thông tin giao hàng
- Xác nhận đơn hàng
- (Yêu cầu đăng nhập)

#### Đăng ký (/register)
- Đăng ký tài khoản mới
- Tự động đăng nhập sau khi đăng ký

#### Đăng nhập (/login)
- Đăng nhập vào hệ thống
- Tự động redirect về trang phù hợp

### B. ADMIN (Quản trị viên)

**Đăng nhập với tài khoản admin:**
- Email: admin@admin.com
- Password: admin123

#### Dashboard (/admin/dashboard)
- Thống kê tổng quan
- Sản phẩm bán chạy
- Hoạt động gần đây

#### Quản lý sản phẩm (/admin/products)
**Thêm sản phẩm mới:**
1. Click nút "Thêm sản phẩm"
2. Nhập thông tin:
   - Tên sản phẩm
   - Danh mục
   - Giá
   - Số lượng tồn kho
   - Mô tả
   - Hình ảnh
3. Click "Thêm"

**Sửa sản phẩm:**
1. Click nút "Sửa" ở sản phẩm cần sửa
2. Cập nhật thông tin
3. Click "Cập nhật"

**Xóa sản phẩm:**
1. Click nút "Xóa"
2. Xác nhận xóa

#### Quản lý danh mục (/admin/categories)
**Thêm danh mục mới:**
1. Click nút "Thêm danh mục"
2. Nhập:
   - Tên danh mục
   - Mô tả
3. Click "Thêm"

**Sửa/Xóa danh mục:** Tương tự như sản phẩm

## 4. STATE MANAGEMENT

### AuthContext
Quản lý trạng thái authentication:
- `user`: Thông tin user hiện tại
- `login()`: Đăng nhập
- `logout()`: Đăng xuất
- `register()`: Đăng ký
- `isAuthenticated`: Kiểm tra đã đăng nhập
- `isAdmin`: Kiểm tra quyền admin

### CartContext
Quản lý giỏ hàng:
- `cart`: Danh sách sản phẩm trong giỏ
- `addToCart()`: Thêm sản phẩm
- `removeFromCart()`: Xóa sản phẩm
- `updateQuantity()`: Cập nhật số lượng
- `clearCart()`: Xóa toàn bộ giỏ hàng
- `getTotal()`: Tính tổng tiền

## 5. TÍCH HỢP BACKEND

### Cấu hình API

1. **Cập nhật file .env:**
```env
REACT_APP_API_URL=http://localhost:8080/api
```

2. **Sử dụng API trong component:**
```javascript
import { productAPI } from '../services';

// Get all products
const fetchProducts = async () => {
  try {
    const response = await productAPI.getAll();
    setProducts(response.data);
  } catch (error) {
    console.error(error);
  }
};
```

### API Endpoints có sẵn

**Auth:**
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/logout
- GET /api/auth/me

**Products:**
- GET /api/products
- GET /api/products/:id
- POST /api/products
- PUT /api/products/:id
- DELETE /api/products/:id

**Categories:**
- GET /api/categories
- GET /api/categories/:id
- POST /api/categories
- PUT /api/categories/:id
- DELETE /api/categories/:id

**Orders:**
- GET /api/orders
- GET /api/orders/:id
- POST /api/orders
- PUT /api/orders/:id
- PUT /api/orders/:id/cancel

## 6. BUILD & DEPLOY

### Build production

```bash
npm run build
```

Files sẽ được tạo trong thư mục `build/`

### Deploy

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

## 7. TÙY CHỈNH

### Thay đổi màu sắc theme
Chỉnh sửa trong `src/App.js`:

```javascript
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#00b96b',
    },
  }}
>
```

### Thêm trang mới

1. Tạo component trong `src/pages/`
2. Thêm route trong `src/App.js`
3. Thêm menu item trong layout (nếu cần)

## 8. XỬ LÝ LỖI THƯỜNG GẶP

**Lỗi: Module not found**
```bash
npm install
```

**Lỗi: Port 3000 đã được sử dụng**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Hoặc chạy trên port khác
set PORT=3001 && npm start
```

**Lỗi: Authentication không hoạt động**
- Kiểm tra localStorage
- Xóa cache trình duyệt
- Đăng nhập lại

## 9. LIÊN HỆ & HỖ TRỢ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra console log
2. Kiểm tra Network tab trong DevTools
3. Đọc lại hướng dẫn
4. Liên hệ support

## 10. LICENSE

MIT License - Free to use and modify

