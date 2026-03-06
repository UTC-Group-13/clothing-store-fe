import React from 'react';
import { Row, Col, Card, Button, InputNumber, Empty, Typography, Image, message } from 'antd';
import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const { Title, Text } = Typography;

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getTotal } = useCart();

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const handleRemove = (productId, productName) => {
    removeFromCart(productId);
    message.success(`Đã xóa ${productName} khỏi giỏ hàng`);
  };

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Empty
          description="Giỏ hàng trống"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button
            type="primary"
            size="large"
            icon={<ShoppingOutlined />}
            onClick={() => navigate('/products')}
          >
            Tiếp tục mua sắm
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>Giỏ Hàng Của Bạn</Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {cart.map((item) => (
            <Card key={item.id} className="cart-item" style={{ marginBottom: '16px' }}>
              <Row gutter={16} align="middle">
                <Col xs={8} sm={6} md={4}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    style={{ width: '100%', borderRadius: '8px' }}
                    preview={false}
                  />
                </Col>
                <Col xs={16} sm={18} md={20}>
                  <Row justify="space-between" align="middle">
                    <Col xs={24} md={12}>
                      <Title level={5}>{item.name}</Title>
                      {item.selectedSize && (
                        <Text type="secondary">Kích thước: {item.selectedSize}</Text>
                      )}
                      {item.selectedColor && (
                        <Text type="secondary" style={{ marginLeft: '12px' }}>
                          Màu: {item.selectedColor}
                        </Text>
                      )}
                      <div style={{ marginTop: '8px' }}>
                        <Text strong style={{ color: '#ff4d4f', fontSize: '16px' }}>
                          {item.price.toLocaleString('vi-VN')}đ
                        </Text>
                      </div>
                    </Col>
                    <Col xs={24} md={12}>
                      <Row gutter={8} justify="end" align="middle">
                        <Col>
                          <InputNumber
                            min={1}
                            max={99}
                            value={item.quantity}
                            onChange={(value) => handleUpdateQuantity(item.id, value)}
                          />
                        </Col>
                        <Col>
                          <Text strong style={{ fontSize: '16px' }}>
                            = {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                          </Text>
                        </Col>
                        <Col>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemove(item.id, item.name)}
                          >
                            Xóa
                          </Button>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          ))}
        </Col>

        <Col xs={24} lg={8}>
          <Card className="cart-summary">
            <Title level={4}>Tóm Tắt Đơn Hàng</Title>

            <div style={{ marginBottom: '16px' }}>
              <Row justify="space-between">
                <Col>
                  <Text>Tạm tính:</Text>
                </Col>
                <Col>
                  <Text>{getTotal().toLocaleString('vi-VN')}đ</Text>
                </Col>
              </Row>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Row justify="space-between">
                <Col>
                  <Text>Phí vận chuyển:</Text>
                </Col>
                <Col>
                  <Text>30,000đ</Text>
                </Col>
              </Row>
            </div>

            <div style={{ marginBottom: '24px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
              <Row justify="space-between">
                <Col>
                  <Title level={5}>Tổng cộng:</Title>
                </Col>
                <Col>
                  <Title level={5} style={{ color: '#ff4d4f' }}>
                    {(getTotal() + 30000).toLocaleString('vi-VN')}đ
                  </Title>
                </Col>
              </Row>
            </div>

            <Button
              type="primary"
              size="large"
              block
              onClick={() => navigate('/checkout')}
            >
              Tiến Hành Thanh Toán
            </Button>

            <Button
              type="default"
              size="large"
              block
              style={{ marginTop: '12px' }}
              onClick={() => navigate('/products')}
            >
              Tiếp Tục Mua Sắm
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Cart;

