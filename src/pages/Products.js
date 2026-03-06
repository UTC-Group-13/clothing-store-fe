import React, { useState } from 'react';
import { Row, Col, Card, Button, Select, Input, Pagination, Typography } from 'antd';
import { ShoppingCartOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const { Title } = Typography;
const { Option } = Select;

const Products = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const pageSize = 12;

  // Sample products data
  const allProducts = [
    { id: 1, name: 'Áo Thun Basic Trắng', price: 199000, category: 'ao', image: 'https://via.placeholder.com/300x400?text=Ao+Thun+Trang' },
    { id: 2, name: 'Áo Thun Basic Đen', price: 199000, category: 'ao', image: 'https://via.placeholder.com/300x400?text=Ao+Thun+Den' },
    { id: 3, name: 'Quần Jean Slim Fit', price: 599000, category: 'quan', image: 'https://via.placeholder.com/300x400?text=Quan+Jean' },
    { id: 4, name: 'Quần Kaki Đen', price: 499000, category: 'quan', image: 'https://via.placeholder.com/300x400?text=Quan+Kaki' },
    { id: 5, name: 'Áo Sơ Mi Công Sở Trắng', price: 399000, category: 'ao', image: 'https://via.placeholder.com/300x400?text=Ao+So+Mi' },
    { id: 6, name: 'Váy Midi Đỏ', price: 499000, category: 'vay', image: 'https://via.placeholder.com/300x400?text=Vay+Do' },
    { id: 7, name: 'Áo Khoác Denim', price: 799000, category: 'ao', image: 'https://via.placeholder.com/300x400?text=Ao+Khoac' },
    { id: 8, name: 'Quần Short Jean', price: 399000, category: 'quan', image: 'https://via.placeholder.com/300x400?text=Quan+Short' },
    { id: 9, name: 'Váy Maxi Hoa', price: 699000, category: 'vay', image: 'https://via.placeholder.com/300x400?text=Vay+Maxi' },
    { id: 10, name: 'Áo Polo Nam', price: 299000, category: 'ao', image: 'https://via.placeholder.com/300x400?text=Ao+Polo' },
    { id: 11, name: 'Quần Tây Công Sở', price: 549000, category: 'quan', image: 'https://via.placeholder.com/300x400?text=Quan+Tay' },
    { id: 12, name: 'Đầm Dự Tiệc', price: 899000, category: 'vay', image: 'https://via.placeholder.com/300x400?text=Dam+Tiec' },
  ];

  // Filter and sort products
  let filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || product.category === category;
    return matchesSearch && matchesCategory;
  });

  if (sortBy === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  // Pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <div>
      <Title level={2}>Danh Sách Sản Phẩm</Title>

      {/* Filters */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="large"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Select
            value={category}
            onChange={setCategory}
            style={{ width: '100%' }}
            size="large"
          >
            <Option value="all">Tất cả danh mục</Option>
            <Option value="ao">Áo</Option>
            <Option value="quan">Quần</Option>
            <Option value="vay">Váy</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Select
            value={sortBy}
            onChange={setSortBy}
            style={{ width: '100%' }}
            size="large"
          >
            <Option value="default">Sắp xếp mặc định</Option>
            <Option value="price-asc">Giá: Thấp đến Cao</Option>
            <Option value="price-desc">Giá: Cao đến Thấp</Option>
          </Select>
        </Col>
      </Row>

      {/* Products Grid */}
      <Row gutter={[16, 16]}>
        {currentProducts.map((product) => (
          <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
            <Card
              hoverable
              className="product-card"
              cover={
                <img
                  alt={product.name}
                  src={product.image}
                  className="product-image"
                  onClick={() => navigate(`/products/${product.id}`)}
                />
              }
              actions={[
                <Button
                  type="link"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  Xem chi tiết
                </Button>,
                <Button
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  onClick={() => handleAddToCart(product)}
                >
                  Thêm
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

      {/* Pagination */}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Pagination
          current={currentPage}
          total={filteredProducts.length}
          pageSize={pageSize}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default Products;

