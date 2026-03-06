import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const { Title } = Typography;

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      message.success('Đặt hàng thành công!');
      clearCart();
      setLoading(false);
      navigate('/');
    }, 1500);
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div>
      <Title level={2}>Thanh Toán</Title>
      <Row gutter={24}>
        <Col xs={24} md={16}>
          <Card>
            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
              >
                <Input size="large" />
              </Form.Item>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
              >
                <Input size="large" />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
              >
                <Input size="large" />
              </Form.Item>
              <Form.Item
                label="Địa chỉ"
                name="address"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
              >
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" loading={loading} block>
                  Đặt Hàng
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Đơn hàng của bạn">
            <div style={{ marginBottom: '16px' }}>
              <strong>Tổng tiền hàng:</strong> {getTotal().toLocaleString('vi-VN')}đ
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Phí vận chuyển:</strong> 30,000đ
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff4d4f' }}>
              <strong>Tổng thanh toán:</strong> {(getTotal() + 30000).toLocaleString('vi-VN')}đ
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Checkout;

