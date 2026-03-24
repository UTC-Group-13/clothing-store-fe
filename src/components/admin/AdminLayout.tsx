import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, LogOut,
  ChevronLeft, Settings, Boxes
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authApi';
import toast from 'react-hot-toast';

const sidebarLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Tổng quan', exact: true },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Đơn hàng', exact: false },
  { to: '/admin/products', icon: Boxes, label: 'Sản phẩm', exact: false },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    authService.logout();
    logout();
    toast.success('Đăng xuất thành công');
    navigate('/login');
  };

  const isActive = (path: string, exact: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-gray-700">
          <Link to="/admin" className="flex items-center gap-2 text-lg font-bold">
            <Settings className="w-6 h-6 text-primary-400" />
            <span>SHOP.CO Admin</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to, link.exact);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-700 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition rounded-lg hover:bg-gray-800"
          >
            <ChevronLeft className="w-4 h-4" />
            Về trang chủ
          </Link>
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold shrink-0">
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                <p className="text-xs text-gray-400">Admin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-red-400 transition rounded"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

