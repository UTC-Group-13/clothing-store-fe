import React from 'react';
import { Row, Col, Card, Button, Carousel, Typography } from 'antd';
import { ShoppingCartOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const Home = () => {
  const navigate = useNavigate();

  const featuredProducts = [
    {
      id: 1,
      name: 'Áo Thun Basic',
      price: 199000,
      image: 'https://via.placeholder.com/300x400?text=Ao+Thun',
    },
    {
      id: 2,
      name: 'Quần Jean Slim Fit',
      price: 599000,
      image: 'https://via.placeholder.com/300x400?text=Quan+Jean',
    },
    {
      id: 3,
      name: 'Áo Sơ Mi Công Sở',
      price: 399000,
      image: 'https://via.placeholder.com/300x400?text=Ao+So+Mi',
    },
    {
      id: 4,
      name: 'Váy Midi Thanh Lịch',
      price: 499000,
      image: 'https://via.placeholder.com/300x400?text=Vay+Midi',
    },
  ];

  const bannerStyle = {
    height: '400px',
    color: '#fff',
    lineHeight: '400px',
    textAlign: 'center',
    background: '#364d79',
  };

  return (
    <div>
      {/* Banner Carousel */}
      <Carousel autoplay style={{ marginBottom: '40px' }}>
        <div>
          <div style={bannerStyle}>
            <Title level={1} style={{ color: '#fff', lineHeight: '400px' }}>
              Chào mừng đến Clothing Store
            </Title>
          </div>
        </div>
        <div>
          <div style={{ ...bannerStyle, background: '#52c41a' }}>
            <Title level={1} style={{ color: '#fff', lineHeight: '400px' }}>
              Khuyến mãi đến 50%
            </Title>
          </div>
        </div>
        <div>
          <div style={{ ...bannerStyle, background: '#fa8c16' }}>
            <Title level={1} style={{ color: '#fff', lineHeight: '400px' }}>
              Bộ sưu tập mới 2026
            </Title>
          </div>
        </div>
      </Carousel>

      {/* Featured Products */}
      <div style={{ marginBottom: '40px' }}>
        <Title level={2}>Sản phẩm nổi bật</Title>
        <Row gutter={[16, 16]}>
          {featuredProducts.map((product) => (
            <Col xs={24} sm={12} md={6} key={product.id}>
              <Card
                hoverable
                className="product-card"
                cover={
                  <img
                    alt={product.name}
                    src={product.image}
                    className="product-image"
                  />
                }
                actions={[
                  <Button
                    type="primary"
                    icon={<ShoppingCartOutlined />}
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    Xem chi tiết
                  </Button>,
                ]}
              >
                <Card.Meta
                  title={product.name}
                  description={
                    <span style={{ color: '#ff4d4f', fontSize: '18px', fontWeight: 'bold' }}>
                      {product.price.toLocaleString('vi-VN')}đ
                    </span>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Button
            type="primary"
            size="large"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate('/products')}
          >
            Xem tất cả sản phẩm
          </Button>
        </div>
      </div>

      {/* About Section */}
      <div style={{ background: '#fafafa', padding: '40px 24px', borderRadius: '8px' }}>
        <Title level={2} style={{ textAlign: 'center' }}>
          Về Chúng Tôi
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <Title level={4}>Chất lượng cao</Title>
              <Paragraph>
                Sản phẩm được tuyển chọn kỹ lưỡng, đảm bảo chất lượng tốt nhất
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <Title level={4}>Giao hàng nhanh</Title>
              <Paragraph>
                Giao hàng toàn quốc, nhanh chóng và an toàn
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <Title level={4}>Hỗ trợ 24/7</Title>
              <Paragraph>
                Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ
              </Paragraph>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Home;

