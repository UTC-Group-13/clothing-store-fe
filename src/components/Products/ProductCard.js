import React from 'react';
import { Card, Button } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product, showAddToCart = true }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleViewDetail = () => {
    navigate(`/products/${product.id}`);
  };

  const actions = [
    <Button type="link" onClick={handleViewDetail}>
      Xem chi tiết
    </Button>,
  ];

  if (showAddToCart) {
    actions.push(
      <Button
        type="primary"
        icon={<ShoppingCartOutlined />}
        onClick={handleAddToCart}
      >
        Thêm
      </Button>
    );
  }

  return (
    <Card
      hoverable
      className="product-card"
      cover={
        <img
          alt={product.name}
          src={product.image}
          className="product-image"
          onClick={handleViewDetail}
          style={{ cursor: 'pointer' }}
        />
      }
      actions={actions}
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
  );
};

export default ProductCard;

