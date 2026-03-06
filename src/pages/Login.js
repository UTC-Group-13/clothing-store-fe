import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const onFinish = (values) => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Demo: admin@admin.com / admin123 for admin, any other for user
      const userData = {
        id: 1,
        email: values.email,
        name: values.email === 'admin@admin.com' ? 'Admin User' : 'Regular User',
        role: values.email === 'admin@admin.com' && values.password === 'admin123' ? 'admin' : 'user'
      };

      login(userData);
      message.success('Đăng nhập thành công!');

      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }

      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 200px)',
      padding: '20px'
    }}>
      <Card style={{ width: '100%', maxWidth: '400px' }}>
        <Title level={2} style={{ textAlign: 'center' }}>Đăng Nhập</Title>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text>Chưa có tài khoản? </Text>
            <Link to="/register">Đăng ký ngay</Link>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <strong>Demo Account:</strong><br/>
              Admin: admin@admin.com / admin123<br/>
              User: any email / any password
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;

