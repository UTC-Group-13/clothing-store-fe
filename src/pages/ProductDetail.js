import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Image, Button, InputNumber, Typography, Tag, Divider, message } from 'antd';
import { ShoppingCartOutlined, LeftOutlined } from '@ant-design/icons';
import { useCart } from '../context/CartContext';

const { Title, Paragraph } = Typography;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Sample product data (in real app, fetch from API)
  const product = {
    id: parseInt(id),
    name: 'Áo Thun Basic Premium',
    price: 199000,
    description: 'Áo thun chất liệu cotton cao cấp, thoáng mát, thấm hút mồ hôi tốt. Thiết kế basic dễ phối đồ.',
    category: 'Áo',
    images: [
      'https://via.placeholder.com/500x600?text=Ao+Thun+1',
      'https://via.placeholder.com/500x600?text=Ao+Thun+2',
      'https://via.placeholder.com/500x600?text=Ao+Thun+3',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Trắng', 'Đen', 'Xám', 'Navy'],
    inStock: true,
  };

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Trắng');

  const handleAddToCart = () => {
    addToCart({
      ...product,
      selectedSize,
      selectedColor,
    }, quantity);
    message.success('Đã thêm sản phẩm vào giỏ hàng!');
  };

  return (
    <div>
      <Button
        icon={<LeftOutlined />}
        onClick={() => navigate('/products')}
        style={{ marginBottom: '24px' }}
      >
        Quay lại
      </Button>

      <Row gutter={[32, 32]}>
        <Col xs={24} md={12}>
          <Image.PreviewGroup>
            {product.images.map((img, index) => (
              <Image
                key={index}
                src={img}
                alt={`${product.name} ${index + 1}`}
                style={{ marginBottom: '8px' }}
              />
            ))}
          </Image.PreviewGroup>
        </Col>

        <Col xs={24} md={12}>
          <Title level={2}>{product.name}</Title>

          <Title level={3} style={{ color: '#ff4d4f' }}>
            {product.price.toLocaleString('vi-VN')}đ
          </Title>

          <Divider />

          <Paragraph style={{ fontSize: '16px' }}>
            {product.description}
          </Paragraph>

          <div style={{ marginBottom: '24px' }}>
            <Title level={5}>Danh mục:</Title>
            <Tag color="blue">{product.category}</Tag>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <Title level={5}>Kích thước:</Title>
            {product.sizes.map((size) => (
              <Tag
                key={size}
                color={selectedSize === size ? 'blue' : 'default'}
                style={{ cursor: 'pointer', marginBottom: '8px' }}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </Tag>
            ))}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <Title level={5}>Màu sắc:</Title>
            {product.colors.map((color) => (
              <Tag
                key={color}
                color={selectedColor === color ? 'blue' : 'default'}
                style={{ cursor: 'pointer', marginBottom: '8px' }}
                onClick={() => setSelectedColor(color)}
              >
                {color}
              </Tag>
            ))}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <Title level={5}>Số lượng:</Title>
            <InputNumber
              min={1}
              max={99}
              value={quantity}
              onChange={setQuantity}
              size="large"
            />
          </div>

          <Button
            type="primary"
            size="large"
            icon={<ShoppingCartOutlined />}
            onClick={handleAddToCart}
            disabled={!product.inStock}
            block
          >
            {product.inStock ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
          </Button>

          <Divider />

          <div>
            <Title level={5}>Thông tin sản phẩm:</Title>
            <ul>
              <li>Chất liệu: Cotton cao cấp</li>
              <li>Xuất xứ: Việt Nam</li>
              <li>Hướng dẫn bảo quản: Giặt máy ở nhiệt độ thường</li>
              <li>Đổi trả trong vòng 7 ngày</li>
            </ul>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ProductDetail;

