import React, { useState } from 'react';
import { Layout, Menu, Badge, Drawer, Dropdown, Button } from 'antd';
import {
  HomeOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  MenuOutlined,
  LoginOutlined,
  LogoutOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const { Header, Content, Footer } = Layout;

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCart();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Trang chủ',
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: 'Sản phẩm',
    },
    {
      key: '/cart',
      icon: (
        <Badge count={cartItemsCount} size="small">
          <ShoppingCartOutlined />
        </Badge>
      ),
      label: 'Giỏ hàng',
    },
  ];

  const handleMenuClick = (e) => {
    navigate(e.key);
    setMobileMenuVisible(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userMenuItems = [
    ...(isAdmin ? [{
      key: 'admin',
      icon: <DashboardOutlined />,
      label: 'Quản trị',
      onClick: () => navigate('/admin/dashboard'),
    }] : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="layout">
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#001529',
        }}
      >
        <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
          Clothing Store
        </div>

        {/* Desktop Menu */}
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            flex: 1,
            minWidth: 0,
            justifyContent: 'flex-end',
          }}
          className="desktop-menu"
        />

        {/* Auth Section */}
        {isAuthenticated ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" style={{ color: '#fff' }}>
              <UserOutlined /> {user?.name}
            </Button>
          </Dropdown>
        ) : (
          <div className="desktop-menu" style={{ marginLeft: '16px' }}>
            <Button
              type="text"
              style={{ color: '#fff' }}
              icon={<LoginOutlined />}
              onClick={() => navigate('/login')}
            >
              Đăng nhập
            </Button>
          </div>
        )}

        {/* Mobile Menu Icon */}
        <MenuOutlined
          className="mobile-menu-icon"
          style={{ color: '#fff', fontSize: '20px', cursor: 'pointer' }}
          onClick={() => setMobileMenuVisible(true)}
        />
      </Header>

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
      >
        <Menu
          mode="vertical"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Drawer>

      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content">{children}</div>
      </Content>

      <Footer style={{ textAlign: 'center' }}>
        Clothing Store ©{new Date().getFullYear()} Created with ❤️
      </Footer>
    </Layout>
  );
};

export default MainLayout;

