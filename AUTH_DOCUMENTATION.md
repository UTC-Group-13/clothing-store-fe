# 🔐 Authentication System - Documentation

## ✅ Đã Hoàn Thành

Hệ thống đăng ký và đăng nhập đã được tích hợp hoàn chỉnh vào project ShopVN.

## 🎯 Tính Năng

### 1. **Đăng Ký (Register)**
- URL: `/register`
- Form fields:
  - Tên đăng nhập (username)
  - Email (emailAddress)
  - Số điện thoại (phoneNumber)
  - Mật khẩu (password)
  - Xác nhận mật khẩu
- Validation:
  - Email format check
  - Số điện thoại 10 chữ số
  - Mật khẩu tối thiểu 6 ký tự
  - Xác nhận mật khẩu khớp
- API: `POST http://localhost:8080/api/auth/register`

### 2. **Đăng Nhập (Login)**
- URL: `/login`
- Form fields:
  - Tên đăng nhập (username)
  - Mật khẩu (password)
- Show/hide password feature
- API: `POST http://localhost:8080/api/auth/login`
- Auto redirect về home sau login thành công

### 3. **User Session Management**
- Token lưu trong localStorage
- User info persist với Zustand
- Auto-logout khi token hết hạn
- Display username trong Header
- Logout button

## 📁 Files Đã Tạo/Cập Nhật

### New Files (6):
1. ✅ `src/types/index.ts` - Authentication types
2. ✅ `src/services/authApi.ts` - Auth API service
3. ✅ `src/store/authStore.ts` - Auth state management
4. ✅ `src/pages/LoginPage.tsx` - Login UI
5. ✅ `src/pages/RegisterPage.tsx` - Register UI

### Updated Files (2):
6. ✅ `src/components/layout/Header.tsx` - User menu & logout
7. ✅ `src/App.tsx` - Auth routes

## 🔧 Technical Details

### Types (types/index.ts)
```typescript
- AuthResponse<T>: API response wrapper
- AuthData: Login/Register response data
- LoginRequest: Login payload
- RegisterRequest: Register payload
- AuthUser: User session data
```

### Auth Store (authStore.ts)
```typescript
- user: AuthUser | null
- isAuthenticated: boolean
- setAuth(user): Save user & token
- logout(): Clear session
- updateUser(data): Update user info
```

### Auth Service (authApi.ts)
```typescript
- register(data): POST /api/auth/register
- login(data): POST /api/auth/login
- logout(): Clear localStorage
- Auto-attach Bearer token to requests
```

## 🎨 UI Components

### LoginPage
- Gradient background (primary-50 to primary-100)
- White card với shadow
- Show/hide password toggle
- Link đến register page
- Loading state khi submit
- Toast notifications

### RegisterPage
- Similar design với LoginPage
- 5 form fields với validation
- Confirm password field
- Real-time validation
- Toast cho errors

### Header Updates
- Conditional rendering:
  - Not logged in: "Đăng nhập" & "Đăng ký" buttons
  - Logged in: Username & "Đăng xuất" button
- User icon display
- Logout functionality

## 🚀 Usage

### 1. Đăng Ký Tài Khoản Mới
```bash
Navigate to: http://localhost:5173/register
Fill form:
- username: john_doe
- email: john@example.com
- phone: 0901234567
- password: password123
Submit → Redirect to login
```

### 2. Đăng Nhập
```bash
Navigate to: http://localhost:5173/login
Fill form:
- username: john_doe
- password: password123
Submit → Redirect to home (với user session)
```

### 3. Check Auth State
```typescript
// In any component
import { useAuthStore } from '../store/authStore';

const { user, isAuthenticated } = useAuthStore();

if (isAuthenticated) {
  console.log('User:', user.username);
}
```

### 4. Protected Routes (Optional)
Có thể tạo ProtectedRoute component:
```typescript
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};
```

## 🔐 Security Features

- ✅ Password hidden by default
- ✅ Bearer token authentication
- ✅ Token stored in localStorage
- ✅ Auto-attach token to API requests
- ✅ Logout clears all auth data
- ✅ Form validation trước khi submit

## 📝 API Integration

### Register Request
```json
POST http://localhost:8080/api/auth/register
{
  "username": "john_doe",
  "emailAddress": "john@example.com",
  "phoneNumber": "0901234567",
  "password": "password123"
}
```

### Login Request
```json
POST http://localhost:8080/api/auth/login
{
  "username": "john_doe",
  "password": "password123"
}
```

### Success Response
```json
{
  "success": true,
  "message": "string",
  "errorCode": "string",
  "data": {
    "accessToken": "string",
    "tokenType": "Bearer",
    "userId": 1073741824,
    "username": "string",
    "emailAddress": "string",
    "role": "USER"
  },
  "timestamp": "2026-03-18T02:47:48.762Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Tên đăng nhập đã tồn tại: john_doe",
  "errorCode": "BAD_REQUEST",
  "data": null,
  "timestamp": "2026-03-18T02:29:43.958070200Z"
}
```

## 🎯 Toast Notifications

- ✅ Login success: "Đăng nhập thành công!"
- ✅ Login error: API error message
- ✅ Register success: "Đăng ký thành công! Vui lòng đăng nhập."
- ✅ Register error: API error message
- ✅ Logout: "Đăng xuất thành công"
- ✅ Validation errors: Specific messages

## 📱 Responsive Design

- ✅ Mobile-first approach
- ✅ Forms responsive trên mọi screen size
- ✅ User menu collapse trên mobile
- ✅ Touch-friendly buttons

## ⚙️ Configuration

### Change API URL
Edit `src/services/authApi.ts`:
```typescript
const AUTH_API_BASE_URL = 'http://localhost:8080/api/auth';
// Change to your backend URL
```

### Customize Colors
Forms sử dụng Tailwind primary colors từ config:
```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: { ... }
    }
  }
}
```

## 🐛 Troubleshooting

**Lỗi CORS:**
Backend cần enable CORS cho frontend origin

**Token không được gửi:**
Check authApi interceptor đã setup đúng

**Logout không clear data:**
Check localStorage được clear hết

**Form validation không work:**
Check regex patterns trong RegisterPage

## ✨ Next Steps (Optional)

Có thể mở rộng thêm:
- [ ] Protected routes
- [ ] Remember me checkbox
- [ ] Forgot password
- [ ] Email verification
- [ ] Social login (Google, Facebook)
- [ ] Profile page
- [ ] Change password
- [ ] 2FA authentication

## 🎉 Status: HOÀN THÀNH

Auth system đã sẵn sàng sử dụng!
- ✅ Register page working
- ✅ Login page working
- ✅ User session management
- ✅ Token authentication
- ✅ UI/UX hoàn chỉnh
- ✅ Error handling
- ✅ 0 TypeScript errors

**Ready to test! 🚀**

