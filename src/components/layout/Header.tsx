import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Store, User, LogOut, Package, Shield } from 'lucide-react';
import { cartService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authApi';
import toast from 'react-hot-toast';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  // Fetch server-side cart count
  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
    enabled: isAuthenticated,
    staleTime: 1000 * 30, // 30s cache
  });

  const totalItems = cart?.totalItems || 0;

  const handleLogout = () => {
    authService.logout();
    logout();
    toast.success('Đăng xuất thành công');
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-primary-600">
            <Store className="w-8 h-8" />
            <span>SHOP.CO</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-600 transition">
              Trang chủ
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-primary-600 transition">
              Sản phẩm
            </Link>
            {isAuthenticated && (
              <Link to="/orders" className="text-gray-700 hover:text-primary-600 transition flex items-center gap-1">
                <Package className="w-4 h-4" />
                Đơn hàng
              </Link>
            )}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <Link to="/admin" className="text-orange-600 hover:text-orange-700 transition flex items-center gap-1 font-medium">
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-primary-600 transition"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden md:flex items-center space-x-2 text-sm">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700 font-medium">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:text-red-600 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Đăng xuất</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-gray-700 hover:text-primary-600 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

