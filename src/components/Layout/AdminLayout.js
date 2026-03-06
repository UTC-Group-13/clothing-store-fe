import React from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Header, Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/admin/products',
      icon: <ShoppingOutlined />,
      label: 'Quản lý sản phẩm',
    },
    {
      key: '/admin/categories',
      icon: <AppstoreOutlined />,
      label: 'Quản lý danh mục',
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Quản lý người dùng',
    },
  ];

  const handleMenuClick = (e) => {
    navigate(e.key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '18px',
          fontWeight: 'bold',
        }}>
          Admin Panel
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout style={{ marginLeft: 200 }}>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
            Xin chào, {user?.name || 'Admin'}
          </div>
          <Menu
            mode="horizontal"
            selectable={false}
            items={[
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Đăng xuất',
                onClick: handleLogout,
              },
            ]}
            style={{ border: 'none' }}
          />
        </Header>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 'calc(100vh - 112px)' }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;

